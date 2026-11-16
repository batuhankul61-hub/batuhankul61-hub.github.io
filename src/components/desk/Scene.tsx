"use client";

import { ContactShadows, Environment, Lightformer, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { SpotId } from "@/content/desk";
import {
  blossomTexture,
  keyboardTexture,
  labelTexture,
  mainScreenTexture,
  plasterTexture,
  tileRoughTexture,
  tileTexture,
} from "./textures";
import { B, Ball, Cyl, Tube, photo, type V3 } from "./prims";
import {
  BlisterCard,
  Boot,
  Car,
  CarFrame,
  DarkLord,
  Droid,
  GreenAlien,
  HangingPlant,
  Hero,
  KalanchoePot,
  KnitMask,
  Poinsettia,
  Poster,
  SucculentBox,
  Trooper,
  VinylBox,
} from "./Props";

const SPIDEY = { suit: "#c4161f", trim: "#1f3f9a", web: "#3a0507" };
const MILES = { suit: "#141416", trim: "#141416", web: "#c4161f" };
const SYMBIOTE = { suit: "#0c0c0f", trim: "#0c0c0f" };
const CARDS = [
  { bg: "#17171a", accent: "#e8e8e8", label: "LB", car: "#f2f2f2" },
  { bg: "#3d6fb8", accent: "#f4f4f4", label: "AERO", car: "#ffffff" },
  { bg: "#b3262a", accent: "#f2c230", label: "GT", car: "#1d1d1f" },
  { bg: "#6a6f78", accent: "#d34a3a", label: "RACE", car: "#c0262b" },
];

export type Phase = "intro" | "overview" | SpotId;

/* ---------- Camera ---------- */

const VIEWS: Record<Phase, { pos: V3; target: V3 }> = {
  intro: { pos: [0.5, 1.6, 2.2], target: [-0.05, 1.32, 0.1] },
  overview: { pos: [0.0, 1.45, 2.05], target: [-0.05, 1.32, 0.1] },
  pc: { pos: [0.2, 1.08, 0.78], target: [0.2, 1.06, 0.12] },
  music: { pos: [-0.5, 1.8, 1.5], target: [-0.45, 1.8, 0] },
  collection: { pos: [-0.28, 1.64, 1.22], target: [-0.28, 1.62, 0.05] },
  games: { pos: [0.9, 1.7, 1.15], target: [1.08, 1.72, 0] },
  football: { pos: [0.5, 1.88, 1.15], target: [1.45, 1.9, 0.55] },
  gym: { pos: [0.85, 1.12, 0.95], target: [1.12, 0.86, 0.2] },
};

const tmpPos = new THREE.Vector3();
const tmpTgt = new THREE.Vector3();
const tmpOff = new THREE.Vector3();
const tmpTmp = new THREE.Vector3();
const UP_AXIS = new THREE.Vector3(0, 1, 0);

/* Free look in the overview: orbit around a target, zoom toward the cursor, double-click to face a surface. */
type Free = { on: boolean; target: THREE.Vector3; yaw: number; pitch: number; dist: number };
const YAW = [-1.62, 1.1] as const;
const PITCH = [-0.55, 0.95] as const;
const MIN_DIST = 0.32;
const ROOM_MIN = new THREE.Vector3(-4.3, 0.22, 0.2);
const ROOM_MAX = new THREE.Vector3(1.36, 2.55, 6);
const TARGET_MIN = new THREE.Vector3(-1.7, 0.3, 0);
const TARGET_MAX = new THREE.Vector3(1.45, 2.45, 1.4);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tmpN = new THREE.Vector3();
const homeTgt = new THREE.Vector3();
const homeOff = new THREE.Vector3();

/** Shared with the click targets so a drag that ends on a hotspot doesn't open it. */
export const dragState = { moved: false, pending: 0 as ReturnType<typeof setTimeout> | 0 };

function offsetOf(f: Free, out: THREE.Vector3) {
  const c = Math.cos(f.pitch);
  return out.set(Math.sin(f.yaw) * c, Math.sin(f.pitch), Math.cos(f.yaw) * c).multiplyScalar(f.dist);
}

function clampFree(f: Free, maxDist: number) {
  f.yaw = THREE.MathUtils.clamp(f.yaw, YAW[0], YAW[1]);
  f.pitch = THREE.MathUtils.clamp(f.pitch, PITCH[0], PITCH[1]);
  f.dist = THREE.MathUtils.clamp(f.dist, MIN_DIST, maxDist);
  f.target.clamp(TARGET_MIN, TARGET_MAX);
}

function Rig({ phase }: { phase: Phase }) {
  const { camera, size, pointer, invalidate, gl, scene } = useThree();
  const look = useRef(new THREE.Vector3(...VIEWS.intro.target));
  const first = useRef(true);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const free = useRef<Free>({ on: false, target: new THREE.Vector3(), yaw: 0, pitch: 0, dist: 1 });
  const home = useRef({ yaw: 0, pitch: 0, dist: 1, maxDist: 3 });
  const keys = useRef(new Set<string>());

  // Leaving or re-entering the overview starts from the framed home view again.
  useEffect(() => {
    free.current.on = false;
  }, [phase]);

  useEffect(() => {
    if (phase !== "overview") return;
    const el = gl.domElement;
    const f = free.current;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    let travel = 0;

    const begin = () => {
      if (f.on) return;
      f.on = true;
      f.target.copy(homeTgt);
      f.yaw = home.current.yaw;
      f.pitch = home.current.pitch;
      f.dist = home.current.dist;
    };
    const hit = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObjects(scene.children, true).find((h) => h.face && (h.object as THREE.Mesh).isMesh);
    };
    /** Zoom by `ratio`, keeping the point under the cursor fixed; zooming out drifts back home. */
    const zoom = (ratio: number, cx?: number, cy?: number) => {
      begin();
      const old = f.dist;
      const next = THREE.MathUtils.clamp(old * ratio, MIN_DIST, home.current.maxDist);
      if (next < old && cx !== undefined && cy !== undefined) {
        const h = hit(cx, cy);
        if (h) f.target.lerp(h.point, 1 - next / old);
      } else if (next > old) {
        const t = (next - old) / Math.max(home.current.maxDist - old, 1e-3);
        f.target.lerp(homeTgt, t);
        f.yaw += (home.current.yaw - f.yaw) * t;
        f.pitch += (home.current.pitch - f.pitch) * t;
      }
      f.dist = next;
      clampFree(f, home.current.maxDist);
      invalidate();
    };
    const rotate = (dx: number, dy: number) => {
      begin();
      const s = 2.4 / Math.max(size.height, 1);
      f.yaw -= dx * s;
      f.pitch += dy * s;
      clampFree(f, home.current.maxDist);
      invalidate();
    };

    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        travel = 0;
        dragState.moved = false;
      }
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      travel += Math.abs(dx) + Math.abs(dy);
      if (travel > 6) dragState.moved = true;
      if (pts.size === 1 && dragState.moved) rotate(dx, dy);
      else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0 && d > 0) zoom(pinch / d, (a.x + b.x) / 2, (a.y + b.y) / 2);
        pinch = d;
      }
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoom(Math.exp(THREE.MathUtils.clamp(px, -120, 120) * 0.0022), e.clientX, e.clientY);
    };
    /** Double-click a poster (or any surface) to fly up and face it. */
    const dbl = (e: MouseEvent) => {
      if (dragState.pending) clearTimeout(dragState.pending);
      dragState.pending = 0;
      const h = hit(e.clientX, e.clientY);
      if (!h?.face) return;
      begin();
      tmpN.copy(h.face.normal).transformDirection(h.object.matrixWorld);
      if (tmpN.dot(ray.ray.direction) > 0) tmpN.negate();
      f.target.copy(h.point);
      f.yaw = Math.atan2(tmpN.x, tmpN.z);
      f.pitch = Math.asin(THREE.MathUtils.clamp(tmpN.y, -1, 1)) * 0.5 + 0.05;
      f.dist = 0.62;
      clampFree(f, home.current.maxDist);
      invalidate();
    };
    const keyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "r" || k === "home") {
        f.on = false;
        invalidate();
        return;
      }
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", "q", "e", "+", "-", "="].includes(k)) {
        if (k.startsWith("arrow")) e.preventDefault();
        keys.current.add(k);
        invalidate();
      }
    };
    const keyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dblclick", dbl);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dblclick", dbl);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
      keys.current.clear();
      dragState.moved = false;
    };
  }, [phase, gl, camera, scene, size.height, invalidate]);

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    const fov = portrait ? 65 : 50;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const v = VIEWS[phase];
    tmpTgt.set(...v.target);
    tmpOff.set(...v.pos).sub(tmpTgt);
    // Narrow screens drop the far-left frames to keep the right-hand corner in view.
    if (portrait && (phase === "intro" || phase === "overview")) tmpTgt.x += 0.25;
    if (phase === "intro" || phase === "overview") {
      // Pull back until the whole corner fits the viewport.
      const tan = 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2);
      const fit = portrait ? 3.0 / (tan * aspect) : Math.max(3.5 / (tan * aspect), 2.55 / tan);
      tmpOff.setLength(Math.max(tmpOff.length(), fit) * (phase === "intro" ? (portrait ? 1.2 : 1.7) : 1));
    } else if (portrait) {
      tmpOff.multiplyScalar(1.7);
    } else if (phase !== "pc") {
      // The info panel covers the right ~third; slide the view so the subject sits left of it.
      const visible = 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * aspect * tmpOff.length();
      const right = tmpTmp.crossVectors(tmpOff, UP_AXIS).normalize().multiplyScalar(-visible * 0.16);
      tmpTgt.add(right);
    }
    const f = free.current;
    if (phase === "overview") {
      const len = tmpOff.length();
      homeTgt.copy(tmpTgt);
      homeOff.copy(tmpOff);
      home.current = { yaw: Math.atan2(homeOff.x, homeOff.z), pitch: Math.asin(homeOff.y / len), dist: len, maxDist: len * 1.1 };
      const held = keys.current;
      if (held.size) {
        if (!f.on) {
          f.on = true;
          f.target.copy(homeTgt);
          Object.assign(f, { yaw: home.current.yaw, pitch: home.current.pitch, dist: home.current.dist });
        }
        const step = Math.min(dt, 0.05);
        const has = (...ks: string[]) => ks.some((k) => held.has(k));
        // Arrows / A-D turn, W-S / +- walk closer or back, Q-E slide sideways along the wall.
        if (has("arrowleft", "a")) f.yaw += step * 1.1;
        if (has("arrowright", "d")) f.yaw -= step * 1.1;
        if (has("arrowup", "w", "+", "=")) f.dist *= Math.exp(-step * 1.4);
        if (has("arrowdown", "s", "-")) f.dist *= Math.exp(step * 1.4);
        if (has("q", "e")) {
          tmpTmp.crossVectors(UP_AXIS, offsetOf(f, tmpN)).normalize();
          f.target.addScaledVector(tmpTmp, (has("e") ? 1 : -1) * step * 0.9);
        }
        clampFree(f, home.current.maxDist);
        invalidate();
      }
      if (f.on) {
        tmpTgt.copy(f.target);
        offsetOf(f, tmpOff);
      }
    }
    tmpPos.copy(tmpTgt).add(tmpOff);
    if (phase === "overview" && !f.on) {
      tmpPos.x += pointer.x * 0.14;
      tmpPos.y += pointer.y * 0.06;
    }
    // Never let the camera slip through a wall or the floor.
    tmpPos.clamp(ROOM_MIN, ROOM_MAX);
    // dt is capped so the first frame after an idle stretch doesn't snap the camera.
    const rate = phase === "overview" && f.on ? 7 : 2.6;
    const k = first.current || reduced ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * rate);
    first.current = false;
    cam.position.lerp(tmpPos, k);
    look.current.lerp(tmpTgt, k);
    cam.lookAt(look.current);
    // The canvas renders on demand: ask for another frame until the camera has settled.
    if (cam.position.distanceToSquared(tmpPos) > 1e-8 || look.current.distanceToSquared(tmpTgt) > 1e-8) invalidate();
  });

  // New target view, or the pointer moved the overview parallax: wake the render loop.
  useEffect(() => invalidate(), [phase, invalidate]);
  useEffect(() => {
    if (phase !== "overview") return;
    const wake = () => invalidate();
    window.addEventListener("pointermove", wake);
    return () => window.removeEventListener("pointermove", wake);
  }, [phase, invalidate]);
  return null;
}

function Shelf({ p, w }: { p: [number, number]; w: number }) {
  return <B p={[p[0], p[1], 0.065]} s={[w, 0.025, 0.13]} c="#4a2f1f" rough={0.7} />;
}

function Controller({ p, c }: { p: V3; c: string }) {
  return (
    <group position={p} rotation={[0.25, 0, 0]}>
      <B p={[0, 0.01, 0]} s={[0.11, 0.055, 0.035]} c={c} rough={0.5} />
      <Ball p={[-0.055, -0.015, 0]} rad={0.03} c={c} s={[1, 1.5, 0.8]} />
      <Ball p={[0.055, -0.015, 0]} rad={0.03} c={c} s={[1, 1.5, 0.8]} />
      <Cyl p={[-0.03, 0.02, 0.02]} rad={0.009} h={0.012} c="#0a0a0a" r={[Math.PI / 2, 0, 0]} />
      <Cyl p={[0.025, 0.005, 0.02]} rad={0.009} h={0.012} c="#0a0a0a" r={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

/** Gaming chair: five-star base on casters, gas lift, bucket seat and a tall back with red bolsters. */
function Chair({ p, ry }: { p: V3; ry: number }) {
  const shell = "#16161a";
  const accent = "#b3262a";
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        const x = Math.sin(a) * 0.3;
        const z = Math.cos(a) * 0.3;
        return (
          <group key={i}>
            <Tube a={[0, 0.1, 0]} b={[x, 0.065, z]} rad={0.018} c="#0c0c0e" />
            <Ball p={[x, 0.03, z]} rad={0.028} c="#0c0c0e" s={[0.8, 1, 1.2]} />
          </group>
        );
      })}
      <Cyl p={[0, 0.1, 0]} rad={0.045} h={0.05} c="#0c0c0e" />
      <Cyl p={[0, 0.2, 0]} rad={0.032} h={0.16} c="#1d1d21" rough={0.4} />
      <Cyl p={[0, 0.34, 0]} rad={0.02} h={0.14} c="#8d8f94" rough={0.25} />
      <B p={[0, 0.41, 0]} s={[0.22, 0.03, 0.22]} c="#0c0c0e" />
      {/* Seat */}
      <B p={[0, 0.47, 0]} s={[0.5, 0.08, 0.5]} c={shell} rough={0.75} />
      <B p={[-0.2, 0.505, 0]} s={[0.08, 0.06, 0.48]} c={accent} rough={0.75} />
      <B p={[0.2, 0.505, 0]} s={[0.08, 0.06, 0.48]} c={accent} rough={0.75} />
      {/* Arms */}
      {[-0.29, 0.29].map((x) => (
        <group key={x}>
          <B p={[x, 0.58, 0.02]} s={[0.035, 0.2, 0.05]} c="#0c0c0e" />
          <B p={[x, 0.69, -0.01]} s={[0.075, 0.03, 0.26]} c="#0c0c0e" rough={0.6} />
        </group>
      ))}
      {/* Back, leaning slightly away from the desk */}
      <group position={[0, 0.5, 0.24]} rotation={[0.12, 0, 0]}>
        <B p={[0, 0.36, 0]} s={[0.44, 0.68, 0.08]} c={shell} rough={0.75} />
        <B p={[-0.19, 0.3, -0.03]} s={[0.08, 0.52, 0.08]} c={accent} rough={0.75} />
        <B p={[0.19, 0.3, -0.03]} s={[0.08, 0.52, 0.08]} c={accent} rough={0.75} />
        <B p={[0, 0.6, -0.055]} s={[0.22, 0.09, 0.05]} c="#0c0c0e" rough={0.8} />
        <B p={[0, 0.2, -0.05]} s={[0.24, 0.12, 0.05]} c="#0c0c0e" rough={0.8} />
        <B p={[0, 0.36, 0.041]} s={[0.06, 0.5, 0.004]} c={accent} rough={0.75} />
      </group>
    </group>
  );
}

/** Sneaker box with a lid lip and a white end label, stacked under the desk. */
function ShoeBox({ p, ry = 0, c = "#e0662a", lid = "#ec7a3c" }: { p: V3; ry?: number; c?: string; lid?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B p={[0, 0.055, 0]} s={[0.34, 0.11, 0.22]} c={c} rough={0.8} />
      <B p={[0, 0.112, 0]} s={[0.346, 0.03, 0.226]} c={lid} rough={0.8} />
      <B p={[0.1, 0.05, 0.111]} s={[0.1, 0.05, 0.002]} c="#f2f0ea" rough={0.9} />
    </group>
  );
}

/* ---------- Room ---------- */

type SpotApi = {
  interactive: boolean;
  hover: SpotId | null;
  setHover: React.Dispatch<React.SetStateAction<SpotId | null>>;
  onSelect: (id: SpotId) => void;
  labels: Record<SpotId, string>;
};

/** Invisible click target covering a group of props. */
function Hit({ api, spot, p, s }: { api: SpotApi; spot: SpotId; p: V3; s: V3 }) {
  return (
    <mesh
      position={p}
      onPointerOver={(ev: ThreeEvent<PointerEvent>) => {
        if (!api.interactive) return;
        ev.stopPropagation();
        api.setHover(spot);
      }}
      onPointerOut={() => api.setHover((h) => (h === spot ? null : h))}
      onClick={(ev: ThreeEvent<MouseEvent>) => {
        if (!api.interactive || dragState.moved) return;
        ev.stopPropagation();
        // Wait a beat: a second click turns this into a double-click close-up instead.
        if (dragState.pending) clearTimeout(dragState.pending);
        dragState.pending = setTimeout(() => {
          dragState.pending = 0;
          api.onSelect(spot);
        }, 260);
      }}
    >
      <boxGeometry args={s} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

const DOTS: [SpotId, V3][] = [
  ["pc", [0.2, 1.31, 0.14]],
  ["music", [-0.62, 1.97, 0.06]],
  ["collection", [-0.62, 1.56, 0.12]],
  ["games", [1.08, 1.7, 0.14]],
  ["football", [1.4, 2.12, 0.5]],
  ["gym", [1.25, 1.02, 0.16]],
];

type DotRefs = React.RefObject<Partial<Record<SpotId, HTMLButtonElement | null>>>;
const tmpDot = new THREE.Vector3();

/** Keeps the DOM hotspot markers glued to their 3D anchors. */
function DotTracker({ refs }: { refs: DotRefs }) {
  useFrame(({ camera, size }) => {
    // Rig moved the camera this frame; refresh its matrices so the dots don't trail a frame behind.
    camera.updateMatrixWorld();
    for (const [spot, p] of DOTS) {
      const el = refs.current[spot];
      if (!el) continue;
      tmpDot.set(...p).project(camera);
      // Hide markers behind the camera or off-screen while looking around up close.
      el.style.visibility = tmpDot.z > 1 || Math.abs(tmpDot.x) > 1.1 || Math.abs(tmpDot.y) > 1.1 ? "hidden" : "";
      const x = (tmpDot.x * 0.5 + 0.5) * size.width;
      const y = (-tmpDot.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  });
  return null;
}

type RoomProps = {
  interactive: boolean;
  labels: Record<SpotId, string>;
  screenTitle: string;
  screenIcons: string[];
  onSelect: (id: SpotId) => void;
};

type HoverProps = { hover: SpotId | null; setHover: React.Dispatch<React.SetStateAction<SpotId | null>> };

function Room({ interactive, labels, screenTitle, screenIcons, onSelect, hover, setHover, lowShadows }: RoomProps & HoverProps & { lowShadows: boolean }) {
  const wood = useMemo(() => {
    const t = photo("wood");
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    t.repeat.set(1, 3);
    return t;
  }, []);
  const rootRef = useRef<THREE.Group>(null);

  // Every lit, opaque mesh casts and receives shadows; click targets and glowing parts stay out.
  useEffect(() => {
    rootRef.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material & { toneMapped?: boolean };
      const lit = !(mat instanceof THREE.MeshBasicMaterial) && !mat.transparent && mat.toneMapped !== false;
      // Flat planes (walls, ceiling, prints) only receive: the ceiling sits between the key light and the room.
      m.castShadow = lit && !(m.geometry instanceof THREE.PlaneGeometry);
      m.receiveShadow = lit || m.receiveShadow;
    });
  }, []);

  useEffect(() => {
    document.body.style.cursor = hover && interactive ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, interactive]);

  useEffect(() => {
    if (!interactive) setHover(null);
  }, [interactive, setHover]);

  const api: SpotApi = { interactive, hover, setHover, onSelect, labels };

  const bolt: [number, number][] = [
    [0.05, 0.26],
    [-0.07, 0.02],
    [0.0, 0.02],
    [-0.05, -0.26],
    [0.08, 0.07],
    [0.01, 0.07],
  ];

  return (
    <group ref={rootRef}>
      {/* Shell: walls, floor, ceiling */}
      <mesh position={[-1.5, 1.35, 0]} receiveShadow>
        <planeGeometry args={[6, 2.7]} />
        <meshStandardMaterial color="#e6e3dd" roughness={0.95} bumpMap={plasterTexture()} bumpScale={0.6} />
      </mesh>
      <mesh position={[1.5, 1.35, 5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 2.7]} />
        <meshStandardMaterial color="#dedbd5" roughness={0.95} bumpMap={plasterTexture()} bumpScale={0.6} />
      </mesh>
      <mesh position={[-4.5, 1.35, 5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 2.7]} />
        <meshStandardMaterial color="#dedbd5" roughness={0.95} bumpMap={plasterTexture()} bumpScale={0.6} />
      </mesh>
      <mesh position={[-1.5, 0, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial map={tileTexture()} roughness={0.32} bumpMap={tileRoughTexture()} bumpScale={1.2} />
      </mesh>
      <mesh position={[-1.5, 2.7, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color="#cfccc6" roughness={1} />
      </mesh>
      <B p={[-1.5, 2.63, 0.04]} s={[6, 0.12, 0.08]} c="#f1efea" />
      <B p={[1.46, 2.63, 5]} s={[0.08, 0.12, 10]} c="#f1efea" />
      <B p={[1.45, 1.25, 1.35]} s={[0.07, 2.5, 0.95]} c="#141017" rough={1} />

      {/* Wall: frames */}
      <CarFrame
        p={[-1.38, 1.72]}
        w={0.24}
        kind="parking"
        cars={[
          { x: -0.12, y: 0.3, c: "#efefef" },
          { x: 0.12, y: 0.3, c: "#f6f6f6" },
          { x: -0.12, y: 0.0, c: "#e9e9e9" },
          { x: 0.12, y: -0.02, c: "#f2f2f2", a: 0.08 },
          { x: 0.18, y: -0.24, c: "#f4f4f4", a: Math.PI / 2 },
        ]}
      />
      <CarFrame
        p={[-1.1, 1.99]}
        w={0.2}
        kind="road"
        cars={[
          { x: 0.22, y: 0.22, c: "#e8e8e8", f1: true },
          { x: -0.22, y: -0.2, c: "#b6c93a" },
          { x: 0.22, y: -0.2, c: "#3d4a33" },
        ]}
      />
      <Poster p={[-1.08, 1.56]} w={0.26} img="slowrush" aspect={0.721} />
      <Poster p={[-0.62, 1.98]} w={0.39} img="ram" aspect={0.75} />
      <Poster p={[-0.08, 2.16]} w={0.25} img="currents" aspect={0.633} />
      <Poster p={[-0.05, 1.5]} w={0.31} img="astroworld" aspect={2 / 3} />
      <Poster p={[0.3, 1.56]} w={0.17} img="comic" aspect={0.72} />
      <Poster p={[1.02, 2.3]} w={0.28} img="arctic" aspect={0.675} />
      <Tube a={[0.43, 2.0, 0.008]} b={[0.43, 1.2, 0.008]} rad={0.006} c="#efece6" />
      <B p={[0.43, 2.02, 0.012]} s={[0.07, 0.07, 0.015]} c="#efe9d8" />

      {/* Top shelf: sneakers and hanging plant */}
      <Shelf p={[-0.67, 2.29]} w={0.6} />
      {[-0.82, -0.64].map((x, i) => (
        <group key={x} position={[x, 2.33, 0.07]} rotation={[0, i ? 0.25 : -0.1, 0]}>
          <B p={[0, 0, 0]} s={[0.17, 0.05, 0.07]} c="#d9b21c" rough={0.6} />
          <B p={[-0.045, 0.03, 0]} s={[0.07, 0.04, 0.065]} c="#c9a416" rough={0.6} />
          <B p={[0, -0.03, 0]} s={[0.175, 0.012, 0.072]} c="#1a1a1a" />
        </group>
      ))}
      <HangingPlant p={[-0.42, 2.33, 0.07]} />

      {/* Spider-Man shelf */}
      <Shelf p={[0.07, 1.84]} w={0.58} />
      <Hero p={[-0.19, 1.8525, 0.075]} h={0.13} look={SPIDEY} ry={0.15} />
      <VinylBox p={[-0.1, 1.8525, 0.055]} look={SPIDEY} />
      <Hero p={[-0.025, 1.8525, 0.08]} h={0.105} look={MILES} ry={-0.1} />
      <VinylBox p={[0.05, 1.8525, 0.05]} look={MILES} ry={-0.08} />
      <Hero p={[0.12, 1.8525, 0.095]} h={0.09} look={SPIDEY} pose="crouch" ry={-0.2} />
      <Hero p={[0.18, 1.8525, 0.06]} h={0.085} look={SYMBIOTE} ry={-0.25} />
      <KnitMask p={[0.27, 1.8525, 0.065]} />
      <Hero p={[-0.06, 1.8525, 0.118]} h={0.05} look={SPIDEY} pose="crouch" ry={0.3} />
      <Hero p={[0.215, 1.8525, 0.12]} h={0.045} look={MILES} ry={-0.4} />
      <Hero p={[-0.15, 1.8275, 0.1]} h={0.06} look={SPIDEY} pose="hang" />
      <Tube a={[-0.15, 1.8275, 0.1]} b={[-0.15, 1.808, 0.1]} rad={0.0008} c="#e6e6e6" />

      {/* Star Wars shelf */}
      <Shelf p={[-0.62, 1.36]} w={0.6} />
      <GreenAlien p={[-0.85, 1.3725, 0.07]} s={1.05} />
      <Trooper p={[-0.75, 1.3725, 0.08]} s={1.1} ry={0.2} />
      <DarkLord p={[-0.67, 1.3725, 0.07]} s={1.2} />
      <Droid p={[-0.585, 1.3725, 0.085]} s={1.05} ry={-0.3} />
      <Trooper p={[-0.525, 1.3725, 0.105]} s={0.85} ry={-0.35} />
      <Poinsettia p={[-0.43, 1.3725, 0.07]} />
      <Car p={[-0.36, 1.3725, 0.095]} r={[-Math.PI / 2, 0, Math.PI / 2 + 0.3]} c="#f2f2f2" />

      {/* Desk */}
      <B p={[-0.1, 0.75, 0.33]} s={[1.8, 0.035, 0.62]} map={wood} c="#ffffff" rough={0.45} gloss={0.35} />
      {[-0.97, -0.6].flatMap((x) => [0.06, 0.6].map((z) => <B key={`${x}${z}`} p={[x, 0.366, z]} s={[0.025, 0.733, 0.025]} c="#151515" rough={0.4} />))}
      <B p={[-0.785, 0.12, 0.33]} s={[0.37, 0.02, 0.56]} map={wood} c="#ffffff" />
      <B p={[-0.785, 0.42, 0.33]} s={[0.37, 0.02, 0.56]} map={wood} c="#ffffff" />
      <B p={[-0.8, 0.5, 0.33]} s={[0.27, 0.13, 0.3]} c="#b3262a" />
      <B p={[-0.82, 0.2, 0.33]} s={[0.2, 0.14, 0.28]} c="#3f8f4a" />
      <ShoeBox p={[-0.38, 0, 0.36]} ry={0.06} />
      <ShoeBox p={[-0.39, 0.125, 0.35]} ry={-0.05} c="#22252b" lid="#2f333b" />
      <B p={[0.79, 0.366, 0.33]} s={[0.02, 0.733, 0.6]} c="#f3f2ef" />

      {/* PC tower */}
      <group position={[0.5, 0.3, 0.36]}>
        <B p={[0, 0, 0]} s={[0.24, 0.5, 0.46]} c="#f2f2f4" rough={0.35} gloss={0.8} />
        {[-0.09, 0.09].flatMap((x) =>
          [-0.19, 0.19].map((z) => <Cyl key={`${x}${z}`} p={[x, -0.275, z]} rad={0.02} h={0.05} c="#1a1a1c" rough={0.6} />),
        )}
        <B p={[0, 0.01, 0.232]} s={[0.2, 0.44, 0.004]} c="#0d0a14" rough={0.08} gloss={1} />
        {[
          [0.055, 0.13, "#ff5fd2"],
          [0.055, 0.0, "#6fe3ff"],
          [0.055, -0.13, "#a47bff"],
          [-0.045, 0.08, "#dfe9ff"],
        ].map(([x, y, col], i) => (
          <mesh key={i} position={[x as number, y as number, 0.236]}>
            <torusGeometry args={[i === 3 ? 0.04 : 0.034, 0.007, 16, 48]} />
            <meshBasicMaterial color={col as string} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* White cabinet */}
      <B p={[1.125, 0.725, 0.3]} s={[0.65, 0.03, 0.56]} c="#f3f2ef" rough={0.5} />
      <B p={[1.44, 0.366, 0.3]} s={[0.02, 0.733, 0.56]} c="#f3f2ef" />
      <B p={[1.12, 0.5, 0.3]} s={[0.62, 0.02, 0.54]} c="#f3f2ef" />
      <B p={[1.12, 0.2, 0.33]} s={[0.6, 0.38, 0.5]} c="#b3a999" rough={0.7} />
      <B p={[1.12, 0.3, 0.585]} s={[0.26, 0.012, 0.012]} c="#c9c9cc" metal={0.8} rough={0.3} />
      <B p={[1.12, 0.11, 0.585]} s={[0.26, 0.012, 0.012]} c="#c9c9cc" metal={0.8} rough={0.3} />
      <group position={[1.15, 0.525, 0.4]} rotation={[0, -0.15, 0]}>
        <B p={[0, 0, 0]} s={[0.34, 0.022, 0.12]} c="#e6e2f2" />
        <mesh position={[0, 0.0115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.33, 0.11]} />
          <meshStandardMaterial map={keyboardTexture()} color="#d9cdf5" />
        </mesh>
      </group>

      {/* Monitors */}
      <B p={[0.2, 0.8, 0.14]} s={[0.66, 0.06, 0.12]} c="#101012" rough={0.5} />
      <B p={[0.2, 0.86, 0.1]} s={[0.07, 0.07, 0.04]} c="#0c0c0e" />
      <B p={[0.2, 1.065, 0.12]} s={[0.64, 0.38, 0.025]} c="#0c0c0e" rough={0.35} gloss={0.6} />
      <mesh position={[0.2, 1.07, 0.1335]}>
        <planeGeometry args={[0.615, 0.35]} />
        <meshBasicMaterial map={mainScreenTexture(screenTitle, screenIcons)} toneMapped={false} />
      </mesh>
      <Tube a={[-0.18, 0.77, 0.05]} b={[-0.18, 1.12, 0.05]} rad={0.013} c="#0c0c0e" />
      <Tube a={[-0.18, 1.08, 0.05]} b={[-0.48, 1.04, 0.14]} rad={0.011} c="#0c0c0e" />
      <group position={[-0.52, 1.02, 0.2]} rotation={[0, 0.38, 0]}>
        <B p={[0, 0, 0]} s={[0.56, 0.34, 0.025]} c="#0c0c0e" rough={0.35} gloss={0.6} />
        <mesh position={[0, 0.005, 0.0135]}>
          <planeGeometry args={[0.54, 0.315]} />
          <meshBasicMaterial map={blossomTexture()} toneMapped={false} />
        </mesh>
      </group>

      {/* Desk top items */}
      <group position={[0.0, 0.781, 0.43]} rotation={[0, 0.04, 0]}>
        <B p={[0, 0, 0]} s={[0.36, 0.026, 0.125]} c="#ece9f1" rough={0.5} />
        <mesh position={[0, 0.0135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 0.115]} />
          <meshStandardMaterial map={keyboardTexture()} roughness={0.6} />
        </mesh>
      </group>
      <B p={[0.5, 0.77, 0.43]} s={[0.42, 0.004, 0.28]} c="#121214" rough={1} />
      <Ball p={[0.38, 0.787, 0.44]} rad={0.03} c="#0d0d0f" s={[1, 0.55, 1.6]} />
      <Cyl p={[-0.3, 0.82, 0.3]} rad={0.05} h={0.1} c="#f4f3ee" />
      <B p={[-0.6, 0.778, 0.52]} s={[0.09, 0.02, 0.13]} c="#3b2a22" r={[0, 0.3, 0]} />
      <Cyl p={[-0.72, 0.805, 0.4]} rad={0.025} h={0.07} c="#2356c7" rough={0.3} />
      <Cyl p={[0.72, 0.785, 0.22]} rad={0.032} h={0.035} c="#f1f1f1" />
      <SucculentBox p={[0.7, 0.768, 0.47]} />

      {/* Cabinet top: plant, router, whey */}
      <KalanchoePot p={[0.94, 0.74, 0.43]} />
      <B p={[1.03, 0.82, 0.24]} s={[0.05, 0.16, 0.18]} c="#18181a" r={[0, -0.5, 0]} rough={0.4} />
      <Cyl p={[1.25, 0.84, 0.14]} rad={0.085} h={0.2} map={labelTexture("WHEY", "#f4f4f2", "#1b2550", "PROTEIN")} rough={0.4} r={[0, 2.95, 0]} />
      <Cyl p={[1.25, 0.95, 0.14]} rad={0.088} h={0.03} c="#ecebe8" />

      {/* Headphones on a wall hook, and the neon bolt */}
      <B p={[0.86, 1.29, 0.008]} s={[0.035, 0.05, 0.012]} c="#1a1a1c" rough={0.4} />
      <Tube a={[0.86, 1.285, 0.01]} b={[0.86, 1.285, 0.1]} rad={0.006} c="#1a1a1c" />
      <Tube a={[0.86, 1.285, 0.1]} b={[0.86, 1.305, 0.106]} rad={0.006} c="#1a1a1c" />
      <group position={[0.86, 1.205, 0.07]}>
        <mesh>
          <torusGeometry args={[0.09, 0.013, 16, 48, Math.PI]} />
          <meshStandardMaterial color="#141416" roughness={0.5} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <group key={x} position={[x, -0.05, 0]}>
            <Cyl p={[0, 0, 0]} rad={0.05} h={0.035} c="#151517" r={[0, 0, Math.PI / 2]} />
            <Cyl p={[0, 0, 0]} rad={0.035} h={0.04} c="#b3262a" r={[0, 0, Math.PI / 2]} />
          </group>
        ))}
      </group>
      <group position={[1.08, 1.1, 0.03]}>
        {/* Clear acrylic backplate with standoffs, like a real neon sign. */}
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[0.24, 0.6]} />
          <meshPhysicalMaterial transparent opacity={0.12} roughness={0.1} clearcoat={1} color="#ffffff" />
        </mesh>
        {[[-0.1, 0.27], [0.1, 0.27], [-0.1, -0.27], [0.1, -0.27]].map(([x, y]) => (
          <Cyl key={`${x}${y}`} p={[x, y, -0.02]} rad={0.006} h={0.02} c="#c9c9cc" r={[Math.PI / 2, 0, 0]} />
        ))}
        {bolt.map((pt, i) => {
          const n = bolt[(i + 1) % bolt.length];
          return <Tube key={i} a={[pt[0], pt[1], 0]} b={[n[0], n[1], 0]} rad={0.011} c="#ff9d1c" e="#ff9416" ei={1.15} />;
        })}
      </group>
      <pointLight position={[1.08, 1.1, 0.16]} color="#ff9a2e" intensity={0.9} distance={1.1} decay={2} />

      {/* Pegboard with controllers */}
      <group position={[1.1, 1.74, 0.025]}>
        {Array.from({ length: 11 }, (_, i) => (
          <group key={i}>
            <Tube a={[-0.31 + i * 0.062, -0.31, 0]} b={[-0.31 + i * 0.062, 0.31, 0]} rad={0.0028} c="#0e0e10" />
            <Tube a={[-0.31, -0.31 + i * 0.062, 0]} b={[0.31, -0.31 + i * 0.062, 0]} rad={0.0028} c="#0e0e10" />
          </group>
        ))}
        {CARDS.map((card, i) => (
          <BlisterCard key={card.label} p={[-0.21 + i * 0.14, 0.2, 0.012]} {...card} />
        ))}
        <B p={[-0.02, -0.1, 0.05]} s={[0.5, 0.008, 0.09]} c="#0e0e10" />
        <Controller p={[-0.17, -0.04, 0.07]} c="#17171a" />
        <Controller p={[0.14, -0.04, 0.07]} c="#a3202a" />
        <B p={[0.14, -0.27, 0.05]} s={[0.26, 0.008, 0.09]} c="#0e0e10" />
        <B p={[0.14, -0.24, 0.05]} s={[0.16, 0.05, 0.05]} c="#1c1c20" />
      </group>

      {/* Football boots hanging on the side wall */}
      <group position={[1.47, 1.98, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <Tube a={[-0.03, 0.17, 0.0]} b={[-0.05, 0.12, 0.05]} rad={0.0015} c="#f4f4f4" />
        <Tube a={[-0.03, 0.17, 0.0]} b={[0.06, 0.11, 0.045]} rad={0.0015} c="#f4f4f4" />
        <Cyl p={[-0.03, 0.17, 0.005]} rad={0.005} h={0.02} c="#bbb" r={[Math.PI / 2, 0, 0]} />
        <group position={[-0.085, 0.13, 0.05]} rotation={[0, Math.PI / 2, 0]}>
          <Boot p={[0, 0, 0]} r={[0, 0, -Math.PI / 2 + 0.12]} />
        </group>
        <group position={[0.085, 0.115, 0.05]} rotation={[0, 0, 0.05]}>
          <Boot p={[0, 0, 0]} r={[0, 0, -Math.PI / 2 - 0.2]} />
        </group>
      </group>

      {/* Gaming chair, pushed back from the desk and turned a little */}
      <Chair p={[-0.6, 0, 0.98]} ry={-1.2} />

      {/* Click targets */}
      <Hit api={api} spot="pc" p={[0.2, 1.065, 0.13]} s={[0.66, 0.4, 0.08]} />
      <Hit api={api} spot="music" p={[-0.62, 1.97, 0.03]} s={[0.42, 0.56, 0.05]} />
      <Hit api={api} spot="music" p={[-0.08, 2.14, 0.03]} s={[0.3, 0.4, 0.05]} />
      <Hit api={api} spot="music" p={[-0.05, 1.5, 0.03]} s={[0.34, 0.46, 0.05]} />
      <Hit api={api} spot="music" p={[-1.08, 1.56, 0.03]} s={[0.3, 0.4, 0.05]} />
      <Hit api={api} spot="music" p={[1.02, 2.32, 0.03]} s={[0.32, 0.43, 0.05]} />
      <Hit api={api} spot="music" p={[0.86, 1.2, 0.07]} s={[0.24, 0.22, 0.1]} />
      <Hit api={api} spot="collection" p={[-0.62, 1.45, 0.07]} s={[0.62, 0.2, 0.16]} />
      <Hit api={api} spot="collection" p={[0.07, 1.93, 0.07]} s={[0.52, 0.2, 0.16]} />
      <Hit api={api} spot="collection" p={[-0.67, 2.35, 0.07]} s={[0.62, 0.12, 0.16]} />
      <Hit api={api} spot="collection" p={[-1.38, 1.72, 0.03]} s={[0.27, 0.36, 0.05]} />
      <Hit api={api} spot="collection" p={[-1.1, 1.99, 0.03]} s={[0.23, 0.3, 0.05]} />
      <Hit api={api} spot="games" p={[1.1, 1.74, 0.06]} s={[0.64, 0.64, 0.14]} />
      <Hit api={api} spot="games" p={[0.5, 0.3, 0.4]} s={[0.26, 0.5, 0.42]} />
      <Hit api={api} spot="football" p={[1.42, 1.93, 0.5]} s={[0.12, 0.4, 0.36]} />
      <Hit api={api} spot="gym" p={[1.25, 0.86, 0.14]} s={[0.19, 0.26, 0.19]} />


      {/* Light: a soft key from the room, a warm lamp glow, and the purple/neon practicals. */}
      <hemisphereLight intensity={0.25} color="#dfe3ff" groundColor="#4a4642" />
      <directionalLight
        position={[-1.2, 3.2, 3.2]}
        intensity={1.1}
        color="#fff0dc"
        castShadow
        shadow-mapSize={lowShadows ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-1.2}
        shadow-camera-near={1}
        shadow-camera-far={9}
      />
      <pointLight position={[0.5, 0.35, 0.9]} color="#8f6bff" intensity={2.4} distance={2.8} decay={1.5} />
      <pointLight position={[0.2, 1.08, 0.45]} color="#9fd8ff" intensity={0.7} distance={1.4} decay={2} />
      <pointLight position={[-0.9, 1.6, 1.8]} color="#ffc48a" intensity={1.1} distance={3.5} decay={1.8} />
      <ContactShadows position={[-0.1, 0.7685, 0.33]} scale={[1.8, 0.62]} far={0.5} blur={1.6} opacity={0.4} resolution={512} frames={1} />
      <ContactShadows position={[-0.1, 0.003, 0.9]} scale={4} far={1.2} blur={2.4} opacity={0.35} resolution={512} frames={1} />
    </group>
  );
}

/** Reports once the first frames are on screen (shader compile can take a moment). */
function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(({ invalidate }) => {
    n.current += 1;
    if (n.current === 2) onReady();
    else if (n.current < 2) invalidate();
  });
  return null;
}

/** Phones, tablets and low-core machines start on the light settings; the monitor can still drop a desktop to them. */
function startsLow() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  return coarse || cores <= 4 || Math.min(window.innerWidth, window.innerHeight) < 600;
}

export default function Scene(props: RoomProps & { phase: Phase; onReady: () => void }) {
  const { phase, onReady, ...room } = props;
  const [hover, setHover] = useState<SpotId | null>(null);
  const dotRefs: DotRefs = useRef({});
  // The shadow map is allocated once, so its size follows the starting tier only.
  const [initialLow] = useState(startsLow);
  const [low, setLow] = useState(initialLow);
  const maxDpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2);
  const [dpr, setDpr] = useState(maxDpr);
  return (
    <>
      <Canvas
        dpr={Math.min(dpr, maxDpr)}
        shadows
        flat
        frameloop="demand"
        camera={{ fov: 50, near: 0.05, far: 30, position: [0.8, 1.7, 4.5] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) => setDpr(Math.round((1 + (maxDpr - 1) * factor) * 4) / 4)}
          onDecline={() => setLow(true)}
          onFallback={() => setLow(true)}
        />
        <color attach="background" args={["#0a0a0c"]} />
        {!low && <SoftShadows size={18} samples={12} focus={0.6} />}
        <Environment resolution={256} frames={1} environmentIntensity={0.55}>
          {/* A soft "room" for reflections: big window light, ceiling panel, warm bounce. */}
          <Lightformer form="rect" intensity={3} color="#fff4e6" position={[-2, 2, 4]} scale={[4, 2, 1]} target={[0, 1, 0]} />
          <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[3, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#a68bff" position={[2, 0.6, 2]} scale={[2, 1, 1]} target={[0, 1, 0]} />
          <Lightformer form="ring" intensity={2} color="#ffbe6b" position={[1, 1.2, -1]} scale={1} target={[0, 1, 0]} />
        </Environment>
        <Rig phase={phase} />
        <Room {...room} hover={hover} setHover={setHover} lowShadows={initialLow} />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <N8AO aoRadius={0.12} distanceFalloff={0.6} intensity={2.2} quality={low ? "performance" : "high"} halfRes />
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.45} radius={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.25} darkness={0.55} />
          <SMAA />
        </EffectComposer>
        <DotTracker refs={dotRefs} />
        <Ready onReady={onReady} />
      </Canvas>
      {room.interactive && (
        <div className="desk-dots">
          {DOTS.map(([spot]) => (
            <button
              key={spot}
              type="button"
              ref={(el) => {
                dotRefs.current[spot] = el;
              }}
              className={`desk-dot${hover === spot ? " is-hover" : ""}`}
              onClick={() => room.onSelect(spot)}
              onMouseEnter={() => setHover(spot)}
              onMouseLeave={() => setHover((h) => (h === spot ? null : h))}
            >
              <span className="desk-dot-pulse" aria-hidden="true" />
              <span className="desk-dot-label">{room.labels[spot]}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
