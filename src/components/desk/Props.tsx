"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { B, Ball, Cyl, photo, type V3 } from "./prims";

/* ---------- Shared bits ---------- */

const texCache = new Map<string, THREE.Texture>();
function canvasTex(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  let t = texCache.get(key);
  if (!t) {
    const el = document.createElement("canvas");
    el.width = w;
    el.height = h;
    draw(el.getContext("2d")!);
    t = new THREE.CanvasTexture(el);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(key, t);
  }
  return t;
}

/** Red suit with black web lines; on a sphere the grid reads as a web. */
function webTex(base: string, line: string) {
  return canvasTex(`web:${base}:${line}`, 256, 128, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 256, 128);
    c.strokeStyle = line;
    c.lineWidth = 1.6;
    for (let i = 0; i <= 16; i++) {
      c.beginPath();
      c.moveTo(i * 16, 0);
      c.lineTo(i * 16, 128);
      c.stroke();
    }
    for (let j = 1; j < 8; j++) {
      c.beginPath();
      for (let x = 0; x <= 256; x += 4) {
        const y = j * 16 + Math.sin((x / 16) * Math.PI) * 3;
        x ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
  });
}

/** Instanced spheres: beads, petals, flower heads. */
function Dots({ pts, rad, color, scale }: { pts: V3[]; rad: number; color: string; scale?: V3 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const s = new THREE.Vector3(...(scale ?? [1, 1, 1]));
    const q = new THREE.Quaternion();
    pts.forEach((p, i) => ref.current!.setMatrixAt(i, m.compose(new THREE.Vector3(...p), q, s)));
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [pts, scale]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pts.length]}>
      <sphereGeometry args={[rad, 32, 24]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </instancedMesh>
  );
}

/** Seeded random so the props look the same on every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- Posters ---------- */

/** Framed album poster: wooden frame, the print, and a faint glass sheen. */
export function Poster({ p, w, img, aspect }: { p: [number, number]; w: number; img: string; aspect: number }) {
  const h = w / aspect;
  const f = 0.022;
  const tex = photo(`posters/${img}`);
  return (
    <group position={[p[0], p[1], 0.014]}>
      <B p={[0, h / 2 + f / 2, 0]} s={[w + f * 2, f, 0.024]} c="#2b1a12" rough={0.55} />
      <B p={[0, -h / 2 - f / 2, 0]} s={[w + f * 2, f, 0.024]} c="#2b1a12" rough={0.55} />
      <B p={[-w / 2 - f / 2, 0, 0]} s={[f, h, 0.024]} c="#2b1a12" rough={0.55} />
      <B p={[w / 2 + f / 2, 0, 0]} s={[f, h, 0.024]} c="#2b1a12" rough={0.55} />
      <B p={[0, 0, -0.008]} s={[w, h, 0.006]} c="#111" />
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.28} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial transparent opacity={0.08} roughness={0.08} clearcoat={1} color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ---------- Diecast cars ---------- */

/** 1:64 car lying with its roof facing +z (out of the wall) or +y (on a shelf). */
export function Car({ p, r, c, glass = "#151a22", f1 = false, s = 1 }: { p: V3; r?: V3; c: string; glass?: string; f1?: boolean; s?: number }) {
  if (f1)
    return (
      <group position={p} rotation={r} scale={s}>
        <B p={[0, 0, 0.006]} s={[0.012, 0.06, 0.008]} c={c} rough={0.35} />
        <B p={[0, 0.028, 0.006]} s={[0.032, 0.008, 0.003]} c={c} rough={0.35} />
        <B p={[0, -0.03, 0.01]} s={[0.03, 0.006, 0.008]} c="#111" />
        <Ball p={[0, -0.004, 0.012]} rad={0.005} c="#111" />
        {[[-0.013, 0.018], [0.013, 0.018], [-0.014, -0.02], [0.014, -0.02]].map(([x, y], i) => (
          <Cyl key={i} p={[x, y, 0.006]} rad={0.0065} h={0.007} c="#0b0b0b" r={[0, 0, Math.PI / 2]} />
        ))}
      </group>
    );
  return (
    <group position={p} rotation={r} scale={s}>
      <B p={[0, 0, 0.005]} s={[0.026, 0.062, 0.009]} c={c} rough={0.3} metal={0.35} />
      <B p={[0, -0.004, 0.012]} s={[0.022, 0.03, 0.007]} c={glass} rough={0.15} />
      <B p={[0, -0.004, 0.0158]} s={[0.019, 0.02, 0.001]} c={c} rough={0.3} metal={0.35} />
      {[[-0.014, 0.019], [0.014, 0.019], [-0.014, -0.021], [0.014, -0.021]].map(([x, y], i) => (
        <Cyl key={i} p={[x, y, 0.004]} rad={0.0055} h={0.005} c="#0b0b0b" r={[0, 0, Math.PI / 2]} />
      ))}
    </group>
  );
}

function asphaltTex(kind: "road" | "parking") {
  return canvasTex(`asphalt:${kind}`, 256, 360, (c) => {
    c.fillStyle = "#4b4d52";
    c.fillRect(0, 0, 256, 360);
    const r = rng(kind === "road" ? 3 : 7);
    for (let i = 0; i < 2200; i++) {
      c.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,${0.04 + r() * 0.05})`;
      c.fillRect(r() * 256, r() * 360, 1.5, 1.5);
    }
    c.fillStyle = "#e9e6dc";
    if (kind === "road") {
      for (let y = 10; y < 360; y += 56) c.fillRect(124, y, 8, 30);
    } else {
      for (const y of [8, 290]) for (let x = 0; x <= 256; x += 52) c.fillRect(x, y, 4, 62);
      c.fillRect(0, 70, 256, 4);
      c.fillRect(0, 288, 256, 4);
    }
  });
}

/** Shadow-box frame with diecast cars mounted inside. */
export function CarFrame({ p, w, kind, cars }: { p: [number, number]; w: number; kind: "road" | "parking"; cars: { x: number; y: number; c: string; a?: number; f1?: boolean }[] }) {
  const h = w * 1.4;
  const f = 0.02;
  return (
    <group position={[p[0], p[1], 0.02]}>
      <B p={[0, h / 2 + f / 2, 0]} s={[w + f * 2, f, 0.04]} c="#151416" rough={0.5} />
      <B p={[0, -h / 2 - f / 2, 0]} s={[w + f * 2, f, 0.04]} c="#151416" rough={0.5} />
      <B p={[-w / 2 - f / 2, 0, 0]} s={[f, h, 0.04]} c="#151416" rough={0.5} />
      <B p={[w / 2 + f / 2, 0, 0]} s={[f, h, 0.04]} c="#151416" rough={0.5} />
      <mesh position={[0, 0, -0.018]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={asphaltTex(kind)} roughness={0.95} />
      </mesh>
      {cars.map((car, i) => (
        <Car key={i} p={[car.x * w, car.y * h, -0.018]} r={[0, 0, car.a ?? 0]} c={car.c} f1={car.f1} />
      ))}
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial transparent opacity={0.07} roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
}

function cardTex(bg: string, accent: string, label: string) {
  return canvasTex(`card:${bg}:${label}`, 200, 280, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, bg);
    g.addColorStop(1, "#0b0b0d");
    c.fillStyle = g;
    c.fillRect(0, 0, 200, 280);
    c.fillStyle = "rgba(255,255,255,0.9)";
    c.beginPath();
    c.arc(100, 22, 9, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = bg;
    c.beginPath();
    c.arc(100, 22, 4, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = accent;
    c.beginPath();
    c.moveTo(14, 52);
    c.lineTo(186, 44);
    c.lineTo(176, 84);
    c.lineTo(22, 90);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "900 34px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText(label, 100, 80);
    c.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 6; i++) c.fillRect(0, 120 + i * 26, 200, 10);
    c.fillStyle = accent;
    c.fillRect(140, 250, 50, 20);
    c.fillStyle = "#111";
    c.font = "700 13px system-ui, sans-serif";
    c.fillText("1:64", 165, 265);
  });
}

/** Carded diecast in a blister, hung on the pegboard. */
export function BlisterCard({ p, bg, accent, label, car }: { p: V3; bg: string; accent: string; label: string; car: string }) {
  return (
    <group position={p}>
      <mesh>
        <planeGeometry args={[0.1, 0.14]} />
        <meshStandardMaterial map={cardTex(bg, accent, label)} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Car p={[0, -0.022, 0.002]} r={[0, 0, Math.PI / 2 + 0.25]} c={car} s={1.1} />
      <mesh position={[0, -0.022, 0.012]}>
        <boxGeometry args={[0.085, 0.055, 0.022]} />
        <meshPhysicalMaterial transparent opacity={0.16} roughness={0.05} clearcoat={1} color="#e8f0ff" />
      </mesh>
    </group>
  );
}

/* ---------- Spider-Man shelf ---------- */

type HeroLook = { suit: string; trim?: string; web?: string; eyes?: string };

/** Chibi hero figure, about h tall, standing on y=0. */
export function Hero({ p, h = 0.1, look, pose = "stand", ry = 0 }: { p: V3; h?: number; look: HeroLook; pose?: "stand" | "crouch" | "hang"; ry?: number }) {
  const web = look.web ? webTex(look.suit, look.web) : undefined;
  const trim = look.trim ?? look.suit;
  const head = h * 0.2;
  const crouch = pose === "crouch";
  const hy = crouch ? h * 0.55 : h * 0.78;
  return (
    <group position={p} rotation={[pose === "hang" ? Math.PI : 0, ry, 0]}>
      {/* legs */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * h * 0.07, crouch ? h * 0.1 : h * 0.18, crouch ? h * 0.06 : 0]} rotation={[crouch ? -1.1 : 0, 0, sd * (crouch ? 0.5 : 0.05)]}>
          <capsuleGeometry args={[h * 0.05, h * 0.2, 4, 8]} />
          <meshStandardMaterial color={trim} roughness={0.5} />
        </mesh>
      ))}
      {/* torso */}
      <mesh position={[0, crouch ? h * 0.3 : h * 0.47, 0]} rotation={[crouch ? 0.5 : 0, 0, 0]}>
        <capsuleGeometry args={[h * 0.1, h * 0.16, 4, 12]} />
        <meshStandardMaterial color={look.suit} map={web} roughness={0.5} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * h * 0.15, crouch ? h * 0.24 : h * 0.47, crouch ? h * 0.06 : 0]} rotation={[crouch ? -0.6 : 0, 0, sd * 0.35]}>
          <capsuleGeometry args={[h * 0.038, h * 0.17, 4, 8]} />
          <meshStandardMaterial color={sd > 0 ? look.suit : trim} map={web} roughness={0.5} />
        </mesh>
      ))}
      {/* head */}
      <mesh position={[0, hy, 0]} scale={[1, 1.12, 1]}>
        <sphereGeometry args={[head, 32, 24]} />
        <meshStandardMaterial color={look.suit} map={web} roughness={0.45} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * head * 0.42, hy + head * 0.12, head * 0.86]} rotation={[0, sd * 0.45, sd * -0.5]}>
          <mesh scale={[1.25, 0.8, 0.3]}>
            <sphereGeometry args={[head * 0.36, 28, 20]} />
            <meshStandardMaterial color="#0b0b0b" />
          </mesh>
          <mesh position={[0, 0, head * 0.05]} scale={[1.1, 0.66, 0.3]}>
            <sphereGeometry args={[head * 0.33, 28, 20]} />
            <meshStandardMaterial color={look.eyes ?? "#f4f4f4"} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Big-headed vinyl figure in its window box. */
export function VinylBox({ p, look, ry = 0 }: { p: V3; look: HeroLook; ry?: number }) {
  const W = 0.075, H = 0.1, D = 0.06;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B p={[0, H / 2, -D / 2 + 0.003]} s={[W, H, 0.004]} c="#1f3f9a" />
      <B p={[-W / 2, H / 2, 0]} s={[0.003, H, D]} c="#e9e6ee" />
      <B p={[W / 2, H / 2, 0]} s={[0.003, H, D]} c="#e9e6ee" />
      <B p={[0, H - 0.008, 0]} s={[W, 0.016, D]} c="#c0262b" />
      <B p={[0, 0.006, 0]} s={[W, 0.012, D]} c="#e9e6ee" />
      <Hero p={[0, 0.012, 0]} h={0.075} look={look} />
      <mesh position={[0, H / 2, D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
}

/** The red knit mask sitting on the right end of the shelf. */
export function KnitMask({ p }: { p: V3 }) {
  const web = webTex("#a3171f", "#5e0b10");
  return (
    <group position={p}>
      <mesh position={[0, 0.1, 0]} scale={[0.85, 1.25, 0.8]}>
        <sphereGeometry args={[0.085, 32, 24]} />
        <meshStandardMaterial color="#b11d25" map={web} roughness={0.95} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.033, 0.12, 0.06]} rotation={[0, sd * 0.5, sd * -0.5]}>
          <mesh scale={[1.3, 0.75, 0.3]}>
            <sphereGeometry args={[0.024, 28, 20]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Star Wars shelf ---------- */

export function GreenAlien({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.035, 0]}>
        <coneGeometry args={[0.045, 0.075, 18]} />
        <meshStandardMaterial color="#b49a78" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.024, 0.01, 16, 48]} />
        <meshStandardMaterial color="#a68c6b" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.1, 0]} scale={[1.05, 0.95, 1]}>
        <sphereGeometry args={[0.035, 32, 24]} />
        <meshStandardMaterial color="#93b26f" roughness={0.6} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[sd * 0.058, 0.106, -0.004]} rotation={[0, 0, sd * -1.35]} scale={[1, 1, 0.35]}>
            <coneGeometry args={[0.02, 0.07, 12]} />
            <meshStandardMaterial color="#93b26f" roughness={0.6} />
          </mesh>
          <mesh position={[sd * 0.014, 0.106, 0.03]} scale={[1, 1.15, 0.6]}>
            <sphereGeometry args={[0.009, 24, 20]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Trooper({ p, s = 1, ry = 0 }: { p: V3; s?: number; ry?: number }) {
  return (
    <group position={p} scale={s} rotation={[0, ry, 0]}>
      {[-1, 1].map((sd) => (
        <B key={sd} p={[sd * 0.011, 0.02, 0]} s={[0.016, 0.04, 0.018]} c="#f1f1f1" rough={0.35} />
      ))}
      <B p={[0, 0.042, 0]} s={[0.036, 0.008, 0.02]} c="#1a1a1a" />
      <B p={[0, 0.062, 0]} s={[0.036, 0.034, 0.022]} c="#f3f3f3" rough={0.35} />
      {[-1, 1].map((sd) => (
        <B key={sd} p={[sd * 0.025, 0.058, 0]} s={[0.012, 0.036, 0.014]} c="#ededed" rough={0.35} />
      ))}
      <mesh position={[0, 0.098, 0]} scale={[1, 1.1, 1.05]}>
        <sphereGeometry args={[0.024, 32, 24]} />
        <meshStandardMaterial color="#f6f6f6" roughness={0.3} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.009, 0.102, 0.021]} rotation={[0, 0, sd * 0.5]} scale={[1.4, 0.8, 0.4]}>
          <sphereGeometry args={[0.007, 20, 16]} />
          <meshStandardMaterial color="#111" roughness={0.2} />
        </mesh>
      ))}
      <B p={[0, 0.087, 0.022]} s={[0.012, 0.006, 0.004]} c="#2a2a2a" />
    </group>
  );
}

export function DarkLord({ p, s = 1, ry = 0 }: { p: V3; s?: number; ry?: number }) {
  return (
    <group position={p} scale={s} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.045, -0.006]}>
        <cylinderGeometry args={[0.026, 0.042, 0.09, 36, 1, true, -Math.PI * 0.85, Math.PI * 1.7]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <B p={[0, 0.05, 0]} s={[0.034, 0.075, 0.022]} c="#141416" rough={0.6} />
      <B p={[0, 0.065, 0.012]} s={[0.016, 0.012, 0.003]} c="#2a2a2e" />
      {["#d62828", "#2a9d3f", "#3a6ee8"].map((col, i) => (
        <mesh key={col} position={[-0.004 + i * 0.004, 0.065, 0.0136]}>
          <boxGeometry args={[0.002, 0.004, 0.001]} />
          <meshBasicMaterial color={col} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.103, 0]}>
        <sphereGeometry args={[0.022, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.15} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.018, 36]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.15} metalness={0.4} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.008, 0.1, 0.019]} rotation={[0, 0, sd * 0.3]} scale={[1.3, 1, 0.5]}>
          <sphereGeometry args={[0.006, 20, 16]} />
          <meshStandardMaterial color="#26262b" roughness={0.05} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.088, 0.02]}>
        <coneGeometry args={[0.007, 0.012, 3]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

export function Droid({ p, s = 1, ry = 0 }: { p: V3; s?: number; ry?: number }) {
  return (
    <group position={p} scale={s} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.05, 36]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.35} />
      </mesh>
      <B p={[0, 0.045, 0.02]} s={[0.014, 0.022, 0.004]} c="#2856c8" />
      <B p={[0, 0.03, 0.02]} s={[0.02, 0.006, 0.004]} c="#2856c8" />
      <mesh position={[0, 0.065, 0]}>
        <sphereGeometry args={[0.022, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8ccd2" roughness={0.25} metalness={0.7} />
      </mesh>
      <B p={[0, 0.077, 0.017]} s={[0.012, 0.007, 0.006]} c="#2856c8" />
      <Ball p={[0.006, 0.072, 0.02]} rad={0.004} c="#111" />
      {[-1, 1].map((sd) => (
        <B key={sd} p={[sd * 0.026, 0.03, 0]} s={[0.007, 0.06, 0.012]} c="#e6e6e6" rough={0.4} />
      ))}
    </group>
  );
}

/* ---------- Plants ---------- */

/** Poinsettia: red bracts fanned out over green leaves. */
export function Poinsettia({ p, s = 1 }: { p: V3; s?: number }) {
  const leaves = useMemo(() => {
    const r = rng(11);
    const out: { pos: V3; rot: V3; c: string; len: number }[] = [];
    for (let k = 0; k < 3; k++) {
      const cx = (k - 1) * 0.04;
      const cy = 0.075 + (k % 2) * 0.015;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + r() * 0.4;
        out.push({ pos: [cx + Math.cos(a) * 0.012, cy, Math.sin(a) * 0.012], rot: [0, -a, 0.35 + r() * 0.25], c: r() > 0.5 ? "#c4161f" : "#9d0f17", len: 0.034 + r() * 0.012 });
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        out.push({ pos: [cx + Math.cos(a) * 0.015, cy - 0.016, Math.sin(a) * 0.015], rot: [0, -a, 0.1], c: "#2f5a2b", len: 0.04 });
      }
    }
    return out;
  }, []);
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.022, 0]}>
        <cylinderGeometry args={[0.04, 0.032, 0.045, 36]} />
        <meshStandardMaterial color="#6d4a35" roughness={0.9} />
      </mesh>
      <Cyl p={[0, 0.045, 0]} rad={0.038} h={0.004} c="#2a1d16" />
      {leaves.map((l, i) => (
        <group key={i} position={l.pos} rotation={l.rot}>
          <mesh position={[l.len / 2, 0, 0]} scale={[1, 0.12, 0.42]}>
            <sphereGeometry args={[l.len / 2, 20, 12]} />
            <meshStandardMaterial color={l.c} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {[-0.04, 0, 0.04].map((x) => (
        <Ball key={x} p={[x, 0.08, 0]} rad={0.004} c="#e7c53a" />
      ))}
    </group>
  );
}

/** Kalanchoe with coral flower clusters in a white ribbed cactus pot. */
export function KalanchoePot({ p }: { p: V3 }) {
  const potGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.045, 0.04, 0.12, 64, 6);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = Math.hypot(v.x, v.z);
      if (r < 0.001) continue;
      const a = Math.atan2(v.z, v.x);
      const k = 1 + 0.07 * Math.max(0, Math.cos(a * 9)) ** 0.6;
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const { flowers, centers, leaves } = useMemo(() => {
    const r = rng(5);
    const f: V3[] = [];
    const c: V3[] = [];
    const heads: V3[] = [[-0.022, 0.19, 0.012], [0.024, 0.2, -0.004], [0.0, 0.21, 0.026], [0.032, 0.18, 0.03], [-0.032, 0.178, -0.024], [0.006, 0.19, -0.03], [-0.004, 0.2, 0.0]];
    for (const [hx, hy, hz] of heads)
      for (let i = 0; i < 16; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * 0.02;
        const pt: V3 = [hx + Math.cos(a) * d, hy + r() * 0.012, hz + Math.sin(a) * d];
        f.push(pt);
        c.push([pt[0], pt[1] + 0.004, pt[2]]);
      }
    const l: { pos: V3; rot: V3 }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
      l.push({ pos: [Math.cos(a) * 0.018, 0.132 + (i % 3) * 0.014, Math.sin(a) * 0.018], rot: [0, -a, 0.35 + (i % 3) * 0.15] });
    }
    return { flowers: f, centers: c, leaves: l };
  }, []);
  return (
    <group position={p}>
      <Cyl p={[0, 0.004, 0]} rad={0.06} h={0.008} c="#f2f2ef" rough={0.35} />
      <mesh position={[0, 0.068, 0]} geometry={potGeo}>
        <meshStandardMaterial color="#f4f4f1" roughness={0.4} />
      </mesh>
      <mesh position={[0.05, 0.05, 0.012]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.012, 0.03, 4, 12]} />
        <meshStandardMaterial color="#f4f4f1" roughness={0.4} />
      </mesh>
      <Cyl p={[0, 0.126, 0]} rad={0.042} h={0.004} c="#2a1d16" />
      {leaves.map((l, i) => (
        <group key={i} position={l.pos} rotation={l.rot}>
          <mesh position={[0.022, 0, 0]} scale={[1, 0.3, 0.7]}>
            <sphereGeometry args={[0.02, 24, 16]} />
            <meshStandardMaterial color="#3d6b35" roughness={0.45} />
          </mesh>
        </group>
      ))}
      {[[-0.02, 0.01], [0.022, -0.005], [0, 0.025], [0.03, 0.03], [-0.03, -0.025], [0.005, -0.03]].map(([x, z], i) => (
        <mesh key={i} position={[x / 2, 0.155, z / 2]} rotation={[z * 8, 0, -x * 8]}>
          <cylinderGeometry args={[0.0018, 0.0018, 0.05, 12]} />
          <meshStandardMaterial color="#4f7a3f" />
        </mesh>
      ))}
      <Dots pts={flowers} rad={0.0072} color="#ef7a5c" scale={[1, 0.6, 1]} />
      <Dots pts={centers} rad={0.0028} color="#ffd2b8" />
    </group>
  );
}

/** Zebra haworthia rosette in a jointed wooden box. */
export function SucculentBox({ p }: { p: V3 }) {
  const blades = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + r() * 0.3;
      const tilt = 0.25 + (i % 3) * 0.18;
      return { a, tilt, len: 0.05 + r() * 0.025 };
    });
  }, []);
  return (
    <group position={p}>
      <B p={[0, 0.032, 0]} s={[0.085, 0.064, 0.085]} c="#c9a172" rough={0.8} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <B key={i} p={[x * 0.0425, 0.032, z * 0.0425]} s={[0.006, 0.066, 0.006]} c="#a57e52" />
      ))}
      <B p={[0, 0.0645, 0]} s={[0.074, 0.002, 0.074]} c="#2a1d16" />
      {blades.map((b, i) => (
        <group key={i} position={[0, 0.066, 0]} rotation={[0, -b.a, 0]}>
          <mesh position={[Math.sin(b.tilt) * b.len * 0.5, Math.cos(b.tilt) * b.len * 0.5, 0]} rotation={[0, 0, -b.tilt]}>
            <coneGeometry args={[0.006, b.len, 5]} />
            <meshStandardMaterial color={i % 2 ? "#2f5d33" : "#3b6d3c"} roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** String-of-pearls style hanging plant. */
export function HangingPlant({ p }: { p: V3 }) {
  const beads = useMemo(() => {
    const r = rng(21);
    const out: V3[] = [];
    for (let s = 0; s < 11; s++) {
      const x0 = (r() - 0.5) * 0.09;
      const z0 = (r() - 0.5) * 0.05;
      const len = 0.14 + r() * 0.24;
      for (let y = 0; y < len; y += 0.011) out.push([x0 + Math.sin(y * 18 + s) * 0.006, -y, z0 + Math.cos(y * 14 + s) * 0.004]);
    }
    for (let i = 0; i < 40; i++) out.push([(r() - 0.5) * 0.1, r() * 0.03, (r() - 0.5) * 0.08]);
    return out;
  }, []);
  return (
    <group position={p}>
      <Cyl p={[0, 0, 0]} rad={0.045} h={0.06} c="#3d2a20" />
      <group position={[0, 0.02, 0.01]}>
        <Dots pts={beads} rad={0.0055} color="#4f8a45" />
      </group>
    </group>
  );
}

/* ---------- Football boots ---------- */

function bootShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.215, 0);
  s.bezierCurveTo(0.255, 0.0, 0.262, 0.03, 0.24, 0.042);
  s.bezierCurveTo(0.2, 0.06, 0.15, 0.068, 0.1, 0.078);
  s.lineTo(0.062, 0.105);
  s.bezierCurveTo(0.04, 0.112, 0.012, 0.11, 0.0, 0.098);
  s.bezierCurveTo(-0.012, 0.07, -0.01, 0.03, 0, 0);
  return s;
}

/** Boot built from an extruded side profile, studs underneath, sock collar on top. */
export function Boot({ p, r, upper = "#d6e23a", heel = "#151515", stud = "#e0567a" }: { p: V3; r?: V3; upper?: string; heel?: string; stud?: string }) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(bootShape(), { depth: 0.062, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 4, curveSegments: 18 });
    g.translate(0, 0, -0.031);
    return g;
  }, []);
  const upperTex = canvasTex(`boot:${upper}:${heel}`, 256, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, heel);
    g.addColorStop(0.32, heel);
    g.addColorStop(0.42, upper);
    g.addColorStop(1, "#eef77a");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 64);
  });
  upperTex.repeat.set(1 / 0.27, 1);
  upperTex.offset.set(0.02 / 0.27, 0);
  const studs: [number, number][] = [[0.03, 0], [0.03, 0.026], [0.03, -0.026], [0.14, 0.03], [0.14, -0.03], [0.17, 0], [0.2, 0.026], [0.2, -0.026], [0.235, 0]];
  return (
    <group position={p} rotation={r}>
      <mesh geometry={geo}>
        <meshStandardMaterial map={upperTex} roughness={0.45} />
      </mesh>
      <mesh position={[0.12, -0.006, 0]}>
        <boxGeometry args={[0.27, 0.01, 0.08]} />
        <meshStandardMaterial color="#f3f1ec" roughness={0.35} />
      </mesh>
      {studs.map(([x, z], i) => (
        <mesh key={i} position={[x, -0.019, z]}>
          <cylinderGeometry args={[0.0055, 0.008, 0.016, 36]} />
          <meshStandardMaterial color={stud} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.03, 0.112, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.035, 0.038, 0.035, 36, 1, true]} />
        <meshStandardMaterial color="#121212" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} p={[0.08 + i * 0.022, 0.082 - i * 0.006, 0]} s={[0.004, 0.003, 0.07]} r={[0, 0, -0.25]} c="#fafafa" rough={0.6} />
      ))}
    </group>
  );
}

/* ---------- Wall TV ---------- */

const TV_SLIDES = 6;
const TV_HOLD = 3800;
const TV_FADE = 0.7;

/** Wall-mounted TV cycling through kavunOS screenshots with a crossfade. */
export function WallTV({ p, w }: { p: V3; w: number }) {
  const h = (w * 9) / 16;
  const texs = useMemo(() => Array.from({ length: TV_SLIDES }, (_, i) => photo(`tv/${i}`)), []);
  const base = useRef<THREE.MeshBasicMaterial>(null);
  const top = useRef<THREE.MeshBasicMaterial>(null);
  const slide = useRef({ cur: 0, fade: -1 });
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => {
      if (document.hidden) return;
      const s = slide.current;
      const next = (s.cur + 1) % TV_SLIDES;
      if (reduced) {
        s.cur = next;
        if (base.current) base.current.map = texs[next];
      } else {
        if (top.current) top.current.map = texs[next];
        s.fade = 0;
      }
      invalidate();
    }, TV_HOLD);
    return () => clearInterval(id);
  }, [texs, invalidate]);

  useFrame((_, dt) => {
    const s = slide.current;
    if (s.fade < 0 || !top.current || !base.current) return;
    s.fade = Math.min(1, s.fade + Math.min(dt, 0.05) / TV_FADE);
    top.current.opacity = s.fade;
    if (s.fade >= 1) {
      s.cur = (s.cur + 1) % TV_SLIDES;
      base.current.map = texs[s.cur];
      top.current.opacity = 0;
      s.fade = -1;
    }
    invalidate();
  });

  return (
    <group position={p}>
      {/* Wall bracket, slim body and a thin bezel */}
      <B p={[0, 0, 0.02]} s={[0.3, 0.2, 0.04]} c="#141416" rough={0.6} />
      <B p={[0, 0, 0.055]} s={[w + 0.024, h + 0.024, 0.03]} c="#0b0b0d" rough={0.3} gloss={0.7} />
      <mesh position={[0, 0, 0.0705]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={base} map={texs[0]} color="#dcdcdc" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0708]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={top} map={texs[1]} color="#dcdcdc" toneMapped={false} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[w / 2 - 0.03, -h / 2 - 0.006, 0.0712]}>
        <circleGeometry args={[0.0035, 12]} />
        <meshBasicMaterial color="#ff5a3c" toneMapped={false} />
      </mesh>
      {/* Screen glow, kept below the panel so it spills onto the wall and console without a hot spot on the bezel. */}
      <pointLight position={[0, -h / 2 - 0.12, 0.22]} color="#ffb98a" intensity={0.3} distance={1.3} decay={2} />
    </group>
  );
}

/** Acoustic fabric over a perforated grille: staggered dark holes on a woven grey, tiled across the front. */
function grilleTex() {
  const t = canvasTex("soundbar-grille", 128, 128, (c) => {
    c.fillStyle = "#6a6a72";
    c.fillRect(0, 0, 128, 128);
    // Weave: faint alternating threads.
    for (let i = 0; i < 128; i += 2) {
      c.fillStyle = i % 4 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.05)";
      c.fillRect(0, i, 128, 1);
      c.fillRect(i, 0, 1, 128);
    }
    c.fillStyle = "#101012";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * 16 + (row % 2 ? 8 : 0) + 8;
        const y = row * 16 + 8;
        c.beginPath();
        c.arc(x % 128, y, 4.8, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(20, 1.45);
  return t;
}

/** Two-channel soundbar the monitor sits on: fabric-wrapped front, rounded ends, top buttons and a status LED. */
export function Soundbar({ p, w = 0.66, h = 0.06, d = 0.12 }: { p: V3; w?: number; h?: number; d?: number }) {
  const shell = useMemo(() => new RoundedBoxGeometry(w, h, d, 6, Math.min(h, d) * 0.42), [w, h, d]);
  const grille = grilleTex();
  const fw = w - h * 0.7;
  return (
    <group position={p}>
      <mesh geometry={shell} castShadow receiveShadow>
        <meshStandardMaterial color="#0f0f11" roughness={0.6} />
      </mesh>
      {/* Fabric front, slightly proud of the shell so it reads as a separate cover. */}
      <mesh position={[0, -0.002, d / 2 + 0.0008]}>
        <planeGeometry args={[fw, h * 0.74]} />
        <meshStandardMaterial map={grille} bumpMap={grille} bumpScale={2} color="#9a9aa4" roughness={1} />
      </mesh>
      {/* Thin seam where the fabric meets the top shell. */}
      <B p={[0, h * 0.37 - 0.002, d / 2 - 0.001]} s={[fw, 0.0025, 0.003]} c="#0a0a0b" rough={0.4} />
      {/* Status LED glowing through the fabric. */}
      <mesh position={[w * 0.38, -h * 0.22, d / 2 + 0.0015]}>
        <circleGeometry args={[0.0028, 16]} />
        <meshBasicMaterial color="#f2f6ff" toneMapped={false} />
      </mesh>
      {/* Top controls on the right end: power, volume down, volume up, Bluetooth. */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[w * 0.27 + i * 0.026, h / 2 + 0.0008, d * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.0055, 0.0068, 24]} />
          <meshStandardMaterial color="#4a4a50" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** Low media console under the TV, with a streaming stick and a remote. */
export function MediaConsole({ p, w }: { p: V3; w: number }) {
  return (
    <group position={p}>
      <B p={[0, 0.22, 0]} s={[w, 0.03, 0.4]} c="#3a2a20" rough={0.6} />
      <B p={[0, 0.12, 0.005]} s={[w - 0.02, 0.17, 0.39]} c="#2a1e17" rough={0.7} />
      <B p={[-w / 4, 0.12, 0.2]} s={[w / 2 - 0.03, 0.15, 0.006]} c="#4a3527" rough={0.55} />
      <B p={[w / 4, 0.12, 0.2]} s={[w / 2 - 0.03, 0.15, 0.006]} c="#4a3527" rough={0.55} />
      <B p={[0, 0.02, 0]} s={[w - 0.04, 0.04, 0.36]} c="#151517" rough={0.8} />
      {/* Streaming stick box and remote */}
      <B p={[-0.25, 0.26, 0.02]} s={[0.12, 0.04, 0.1]} c="#16161a" rough={0.4} gloss={0.5} />
      <B p={[0.2, 0.243, 0.08]} s={[0.04, 0.012, 0.15]} c="#1b1b1f" rough={0.5} r={[0, 0.35, 0]} />
    </group>
  );
}

/* ---------- Top shelf ---------- */

/** Backwards side stripe: the tip points at the toe, the hook sits by the heel. */
function stripeGeo() {
  const s = new THREE.Shape();
  s.moveTo(0.05, 0.016);
  s.quadraticCurveTo(0, -0.012, -0.03, -0.008);
  s.quadraticCurveTo(-0.043, -0.006, -0.037, 0.005);
  s.quadraticCurveTo(-0.025, -0.001, 0, 0.001);
  s.quadraticCurveTo(0.025, 0.003, 0.05, 0.016);
  return new THREE.ShapeGeometry(s, 12);
}

/** Low-top sneaker in a sail / mocha suede colourway with a reversed black side stripe. Toe points to +x. */
export function Sneaker({ p, ry = 0 }: { p: V3; ry?: number }) {
  const stripe = useMemo(stripeGeo, []);
  const sail = "#ece2c8";
  const mocha = "#5a3a28";
  const dark = "#2b1b12";
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {/* Gum-brown outsole and sail midsole */}
      <B p={[0, -0.032, 0]} s={[0.175, 0.008, 0.068]} c="#4a3324" rough={0.8} />
      <B p={[0, -0.02, 0]} s={[0.172, 0.016, 0.066]} c={sail} rough={0.7} />
      {/* Sail leather vamp and rounded toe */}
      <B p={[0.015, 0.003, 0]} s={[0.07, 0.03, 0.062]} c={sail} rough={0.55} />
      <mesh position={[0.05, -0.004, 0]} scale={[1.15, 0.55, 0.97]} castShadow receiveShadow>
        <sphereGeometry args={[0.032, 28, 18]} />
        <meshStandardMaterial color={sail} roughness={0.55} />
      </mesh>
      {/* Mocha suede mudguard, heel and eyestay */}
      <B p={[0.058, -0.007, 0]} s={[0.052, 0.011, 0.066]} c={mocha} rough={0.95} />
      <B p={[-0.05, 0.008, 0]} s={[0.075, 0.04, 0.064]} c={mocha} rough={0.95} />
      <B p={[-0.054, 0.03, 0]} s={[0.062, 0.008, 0.066]} c={dark} rough={0.9} />
      <B p={[0.005, 0.024, 0]} s={[0.07, 0.008, 0.05]} c={mocha} rough={0.95} r={[0, 0, -0.22]} />
      {/* Tongue with a small red tag, and sail laces */}
      <B p={[-0.02, 0.036, 0]} s={[0.035, 0.02, 0.03]} c={sail} rough={0.6} r={[0, 0, 0.3]} />
      <B p={[-0.017, 0.042, 0]} s={[0.012, 0.008, 0.031]} c="#b0202a" rough={0.6} r={[0, 0, 0.3]} />
      {[0.03, 0.012, -0.006].map((x) => (
        <B key={x} p={[x, 0.029 - (x - 0.005) * 0.22, 0]} s={[0.004, 0.004, 0.044]} c="#f3eee2" rough={0.7} />
      ))}
      {/* Reversed black stripe on both sides */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} geometry={stripe} position={[-0.008, 0.002, sd * 0.0335]}>
          <meshStandardMaterial color="#141210" roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
