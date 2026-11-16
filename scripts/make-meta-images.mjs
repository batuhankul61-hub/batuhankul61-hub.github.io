// Generates the social preview card and favicons into public/.
// Run with `npm run meta-images` after changing the name or role.
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));

const BG = "#09090b";
const ACCENT = "#5eead4";
const FONT = "Segoe UI, Helvetica Neue, Arial, sans-serif";

const grid = (w, h, step) => {
  let d = "";
  for (let x = step; x < w; x += step) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) d += `M0 ${y}H${w}`;
  return `<path d="${d}" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>`;
};

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="0.15" cy="0" r="0.9">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  ${grid(1200, 630, 48)}
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="96" cy="118" r="7" fill="${ACCENT}"/>
  <text x="116" y="126" font-family="${FONT}" font-size="26" fill="#a1a1aa" letter-spacing="1">AI Automation &amp; Workflow Engineer</text>
  <text x="80" y="300" font-family="${FONT}" font-size="104" font-weight="700" fill="#ededef" letter-spacing="-3">Batuhan Kul</text>
  <text x="84" y="380" font-family="${FONT}" font-size="38" fill="#a1a1aa">LLM agents · MCP integrations · FastAPI · SQL</text>
  <text x="84" y="550" font-family="${FONT}" font-size="28" fill="${ACCENT}">batuhankul61-hub.github.io</text>
</svg>`;

const icon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${BG}"/>
  <text x="32" y="43" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700" fill="${ACCENT}" letter-spacing="-1">BK</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(out("og.png"));
for (const [file, size] of [
  ["icon.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  await sharp(Buffer.from(icon(size))).png().toFile(out(file));
}
await writeFile(out("icon.svg"), icon(64));
console.log("wrote public/og.png, icon.png, apple-touch-icon.png, icon.svg");
