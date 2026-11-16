"use client";

import { invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { grainTexture } from "./textures";

export type V3 = [number, number, number];

/* ---------- Shared geometry ---------- */

const geoCache = new Map<string, THREE.BufferGeometry>();
function geo(key: string, make: () => THREE.BufferGeometry) {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

/** Real objects never have razor edges: every box gets a bevel scaled to its thinnest side. */
function roundedBox(s: V3) {
  const min = Math.min(...s);
  const radius = Math.min(0.012, min * 0.3);
  return geo(`rb:${s.join()}`, () =>
    radius < 0.0006 ? new THREE.BoxGeometry(...s) : new RoundedBoxGeometry(s[0], s[1], s[2], 3, radius),
  );
}

/** Cylinder with softened rims, built as a lathe so the bevel catches highlights. */
function roundedCyl(rad: number, h: number) {
  return geo(`rc:${rad}:${h}`, () => {
    const b = Math.min(rad * 0.18, h * 0.3, 0.008);
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, -h / 2)];
    const arc = (cx: number, cy: number, a0: number) => {
      for (let i = 0; i <= 4; i++) {
        const a = a0 + (i / 4) * (Math.PI / 2);
        pts.push(new THREE.Vector2(cx + Math.cos(a) * b, cy + Math.sin(a) * b));
      }
    };
    arc(rad - b, -h / 2 + b, -Math.PI / 2);
    arc(rad - b, h / 2 - b, 0);
    pts.push(new THREE.Vector2(0, h / 2));
    return new THREE.LatheGeometry(pts, 48);
  });
}

/* ---------- Primitives ---------- */

export type BoxProps = {
  p: V3;
  s: V3;
  c?: string;
  r?: V3;
  rough?: number;
  metal?: number;
  e?: string;
  ei?: number;
  map?: THREE.Texture;
  /** Lacquer / plastic shell: adds a clearcoat layer. */
  gloss?: number;
};

export function B({ p, s, c = "#fff", r, rough = 0.85, metal = 0, e, ei = 1, map, gloss }: BoxProps) {
  const common = {
    color: c,
    roughness: rough,
    metalness: metal,
    map,
    roughnessMap: map ? undefined : grainTexture(),
    emissive: e ?? "#000000",
    emissiveIntensity: ei,
    toneMapped: !e,
  };
  return (
    <mesh position={p} rotation={r} geometry={roundedBox(s)} castShadow={!e} receiveShadow>
      {gloss ? (
        <meshPhysicalMaterial {...common} clearcoat={gloss} clearcoatRoughness={0.25} />
      ) : (
        <meshStandardMaterial {...common} />
      )}
    </mesh>
  );
}

export function Cyl({ p, rad, h, c = "#fff", r, rough = 0.8, map }: { p: V3; rad: number; h: number; c?: string; r?: V3; rough?: number; map?: THREE.Texture }) {
  return (
    <mesh position={p} rotation={r} geometry={map ? undefined : roundedCyl(rad, h)} castShadow receiveShadow>
      {map && <cylinderGeometry args={[rad, rad, h, 48]} />}
      <meshStandardMaterial color={c} roughness={rough} map={map} />
    </mesh>
  );
}

export function Ball({ p, rad, c, s, e }: { p: V3; rad: number; c: string; s?: V3; e?: string }) {
  return (
    <mesh position={p} scale={s} castShadow receiveShadow>
      <sphereGeometry args={[rad, 40, 28]} />
      <meshStandardMaterial color={c} roughness={0.6} emissive={e ?? "#000000"} />
    </mesh>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

/** Thin cylinder between two points: wires, neon, arms. */
export function Tube({ a, b, rad = 0.004, c = "#111", e, ei = 1 }: { a: V3; b: V3; rad?: number; c?: string; e?: string; ei?: number }) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  const mid = va.add(vb).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[rad, rad, len, 16]} />
      <meshStandardMaterial color={c} roughness={0.5} emissive={e ?? "#000000"} emissiveIntensity={ei} toneMapped={!e} />
    </mesh>
  );
}

const photoCache = new Map<string, THREE.Texture>();

/** Texture cut from the real room photos (public/desk). */
export function photo(name: string) {
  let t = photoCache.get(name);
  if (!t) {
    // The canvas renders on demand, so ask for a frame once the image arrives.
    t = new THREE.TextureLoader().load(`/desk/${name}.jpg`, () => invalidate());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    photoCache.set(name, t);
  }
  return t;
}

