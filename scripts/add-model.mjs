#!/usr/bin/env node
/**
 * One-step 3D model import for the desk scene.
 *
 *   npm run model -- <sketchfab-url | file.zip | file.glb | file.gltf> [options]
 *
 * Does, in order:
 *   1. Sketchfab URL → reads title / author / license from the public API and refuses
 *      licenses a portfolio can't use (NonCommercial, NoDerivs, store/editorial) unless --force.
 *   2. Downloads the glTF archive when SKETCHFAB_TOKEN is set (.env.local), otherwise
 *      tells you which file to download and the exact command to re-run.
 *   3. Optimizes for the web: dedup, prune, weld, simplify to --tris, textures → WebP at
 *      --tex px, meshopt compression. A 1M-triangle scan with 8K maps ends up a few MB.
 *   4. Writes public/desk/models/<slug>.glb and records the credit in src/content/models.json,
 *      which the desk page lists under "Credits".
 *
 * Options:
 *   --name <slug>     output name (default: from the model title or file name)
 *   --from <url>      Sketchfab page for a file you downloaded by hand (for credits/license)
 *   --tris <n>        triangle budget (default 40000)
 *   --tex <px>        max texture size (default 1024)
 *   --force           import even if the license looks unsuitable
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, resample, simplify, textureCompress, weld } from "@gltf-transform/functions";
import { unzipSync } from "fflate";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT_DIR = path.join(ROOT, "public", "desk", "models");
const CREDITS = path.join(ROOT, "src", "content", "models.json");

/* ---------- args ---------- */

const argv = process.argv.slice(2);
const opts = { tris: 40000, tex: 1024, force: false };
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--force") opts.force = true;
  else if (a.startsWith("--")) opts[a.slice(2)] = argv[++i];
  else positional.push(a);
}
opts.tris = Number(opts.tris);
opts.tex = Number(opts.tex);
const input = positional[0];
if (!input) {
  console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]);
  process.exit(1);
}

/* ---------- helpers ---------- */

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const isUrl = (s) => /^https?:\/\//i.test(s);

async function sketchfabUid(url) {
  const res = await fetch(url, { redirect: "follow" });
  const m = (res.url || url).match(/([0-9a-f]{32})(?:[/?#]|$)/i);
  if (!m) throw new Error(`Could not find a Sketchfab model id in ${res.url || url}`);
  return m[1];
}

// License slugs from https://api.sketchfab.com/v3/licenses
const OK_LICENSES = { cc0: "CC0", by: "CC BY 4.0", "by-sa": "CC BY-SA 4.0" };

async function sketchfabMeta(url) {
  const uid = await sketchfabUid(url);
  const res = await fetch(`https://api.sketchfab.com/v3/models/${uid}`);
  if (!res.ok) throw new Error(`Sketchfab API ${res.status} for ${uid}`);
  const d = await res.json();
  const slug = d.license?.slug ?? "unknown";
  return {
    uid,
    title: d.name,
    author: d.user?.displayName ?? d.user?.username,
    authorUrl: d.user?.profileUrl,
    sourceUrl: d.viewerUrl ?? `https://sketchfab.com/3d-models/${uid}`,
    license: OK_LICENSES[slug] ?? d.license?.label ?? slug,
    licenseSlug: slug,
    licenseUrl: d.license?.url,
    downloadable: d.isDownloadable,
    price: d.price,
  };
}

function checkLicense(meta) {
  if (OK_LICENSES[meta.licenseSlug]) return;
  const why =
    meta.licenseSlug === "st" || meta.licenseSlug === "ed"
      ? `it is a paid Sketchfab Store model (${meta.license}${meta.price ? `, $${meta.price / 100}` : ""}); buy it first`
      : `its license is "${meta.license}" (NonCommercial / NoDerivs aren't safe on a public portfolio)`;
  if (!opts.force) {
    console.error(`✗ Not importing "${meta.title}": ${why}.\n  Re-run with --force only if you have the rights.`);
    process.exit(2);
  }
  console.warn(`! --force: importing despite license (${why}).`);
}

async function sketchfabDownload(meta) {
  const token = process.env.SKETCHFAB_TOKEN;
  if (!meta.downloadable || !token) {
    console.log(
      [
        "",
        `→ Download it by hand: open ${meta.sourceUrl}`,
        "  Download 3D Model → glTF → save the .zip (into this repo is fine), then run:",
        `  npm run model -- <path-to-zip> --from ${meta.sourceUrl}`,
        "",
        meta.downloadable
          ? "  Tip: put SKETCHFAB_TOKEN=<your API token> in .env.local (sketchfab.com/settings/password)\n  and this step becomes automatic."
          : "  (This model isn't downloadable for free.)",
      ].join("\n"),
    );
    process.exit(3);
  }
  const res = await fetch(`https://api.sketchfab.com/v3/models/${meta.uid}/download`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`Sketchfab download API ${res.status}: ${await res.text()}`);
  const { gltf } = await res.json();
  if (!gltf?.url) throw new Error("Sketchfab returned no glTF archive for this model.");
  process.stdout.write(`↓ downloading ${(gltf.size / 1e6).toFixed(1)} MB… `);
  const zip = new Uint8Array(await (await fetch(gltf.url)).arrayBuffer());
  console.log("done");
  return zip;
}

/** Unzip into a temp dir and return the path of the first .gltf/.glb inside. */
function extractZip(bytes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "desk-model-"));
  const files = unzipSync(bytes);
  for (const [name, data] of Object.entries(files)) {
    if (name.endsWith("/")) continue;
    const target = path.join(dir, name);
    if (!target.startsWith(dir)) continue; // zip-slip guard
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
  const found = Object.keys(files).find((n) => /\.(gltf|glb)$/i.test(n) && !n.includes("__MACOSX"));
  if (!found) throw new Error("No .gltf or .glb inside the zip.");
  return path.join(dir, found);
}

function countTris(doc) {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute("POSITION");
      n += (idx ? idx.getCount() : (pos?.getCount() ?? 0)) / 3;
    }
  return Math.round(n);
}

const mb = (bytes) => `${(bytes / 1e6).toFixed(2)} MB`;

/* ---------- main ---------- */

loadEnv();

let meta = null;
let modelPath;

if (isUrl(input)) {
  meta = await sketchfabMeta(input);
  console.log(`• ${meta.title} — ${meta.author} — ${meta.license}`);
  checkLicense(meta);
  modelPath = extractZip(await sketchfabDownload(meta));
} else {
  const p = path.resolve(input);
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
  modelPath = /\.zip$/i.test(p) ? extractZip(fs.readFileSync(p)) : p;
  if (opts.from) {
    meta = await sketchfabMeta(opts.from);
    console.log(`• ${meta.title} — ${meta.author} — ${meta.license}`);
    checkLicense(meta);
  } else {
    console.warn("! No --from <url>: no license check and no credit will be recorded.");
  }
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder,
  "meshopt.decoder": MeshoptDecoder,
});

const doc = await io.read(modelPath);
const before = countTris(doc);
const ratio = Math.min(1, opts.tris / Math.max(before, 1));

await doc.transform(
  dedup(),
  prune(),
  weld(),
  ...(ratio < 1 ? [simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.01 })] : []),
  resample(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [opts.tex, opts.tex] }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

const slug = slugify(opts.name ?? meta?.title ?? path.basename(input).replace(/\.[^.]+$/, ""));
fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `${slug}.glb`);
const glb = await io.writeBinary(doc);
fs.writeFileSync(outFile, glb);

const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, "utf8")) : {};
credits[slug] = meta
  ? {
      file: `/desk/models/${slug}.glb`,
      title: meta.title,
      author: meta.author,
      authorUrl: meta.authorUrl,
      sourceUrl: meta.sourceUrl,
      license: meta.license,
      licenseUrl: meta.licenseUrl,
    }
  : { file: `/desk/models/${slug}.glb`, title: slug };
fs.writeFileSync(CREDITS, `${JSON.stringify(credits, null, 2)}\n`);

console.log(
  [
    `✓ ${path.relative(ROOT, outFile)}  ${mb(glb.byteLength)}  (${before.toLocaleString()} → ${countTris(doc).toLocaleString()} triangles)`,
    `  Use it:  <Model slug="${slug}" p={[x, y, z]} size={0.2} />   // optional: tint="#d9b21c"`,
  ].join("\n"),
);
