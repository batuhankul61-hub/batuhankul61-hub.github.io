import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { make, rand } from "../scene/textures";
import { StudioOS } from "./StudioOS";
import { sfx } from "../sfx";
import { tx, useLang } from "../i18n";
import { useYt } from "../player/yt";
import { FoodBowl, catFood, feedLine, racePrintStudioTex, colorFieldTex, useThumbTex } from "../scene/props";

export type StudioPhase = "intro" | "room" | "screen" | "player";

const DESK_Y = 0.74;

// Ekran: 16:10, DOM 1280x800 px (drei Html transform: 1 birim = 40px)
export const SCREEN = { pos: new THREE.Vector3(0, 1.142, -0.2128), w: 0.62, h: 0.3875 };
const DOM_W = 1280;
const DOM_H = 800;
const HTML_SCALE = SCREEN.w / (DOM_W / 40);

const ROOM_POS = new THREE.Vector3(1.2, 1.45, 1.9);
/** Masadaki hoparlör (müzik çalar) */
const SPEAKER = { pos: new THREE.Vector3(0.5, 0.74 + 0.085, -0.36), rot: 0.45 };
const ROOM_LOOK = new THREE.Vector3(-0.08, 1.0, -0.3);
const START_POS = new THREE.Vector3(0.2, 1.35, 4.2);

/* ---------- dokular ---------- */
function oakTex() {
  const r = rand(11);
  const t = make(1024, 1024, (c, w, h) => {
    const rows = 8;
    const rh = h / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * 400;
      while (x < w) {
        const len = 380 + r() * 380;
        c.fillStyle = `hsl(${33 + r() * 4}, ${30 + r() * 8}%, ${70 + r() * 6}%)`;
        c.fillRect(x, i * rh, len, rh);
        c.strokeStyle = "rgba(120,80,40,.07)";
        for (let k = 0; k < 9; k++) {
          const yy = i * rh + r() * rh;
          c.beginPath();
          c.moveTo(x, yy);
          c.bezierCurveTo(x + len * 0.3, yy + 3, x + len * 0.7, yy - 3, x + len, yy);
          c.stroke();
        }
        c.fillStyle = "rgba(90,60,30,.18)";
        c.fillRect(x, i * rh, 2, rh);
        x += len;
      }
      c.fillStyle = "rgba(90,60,30,.22)";
      c.fillRect(0, i * rh, w, 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2.5, 2.5);
  return t;
}

function deskTex() {
  const r = rand(5);
  return make(1024, 512, (c, w, h) => {
    c.fillStyle = "#d9c3a2";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(130,90,50,.08)";
    c.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const y = r() * h;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(w * 0.3, y + r() * 14 - 7, w * 0.6, y + r() * 14 - 7, w, y + r() * 10 - 5);
      c.stroke();
    }
  });
}

function skyTex() {
  const r = rand(3);
  return make(512, 640, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#a9d2f5");
    g.addColorStop(0.65, "#e8f3fb");
    g.addColorStop(1, "#f7f2e6");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // yumuşak bulutlar
    c.filter = "blur(18px)";
    c.fillStyle = "rgba(255,255,255,.9)";
    for (let i = 0; i < 7; i++) {
      c.beginPath();
      c.ellipse(r() * w, 60 + r() * 220, 60 + r() * 80, 20 + r() * 20, 0, 0, Math.PI * 2);
      c.fill();
    }
    // uzaktaki ağaçlar
    c.filter = "blur(6px)";
    for (let i = 0; i < 26; i++) {
      c.fillStyle = `hsl(${105 + r() * 30}, ${25 + r() * 15}%, ${48 + r() * 14}%)`;
      c.beginPath();
      c.arc(r() * w, h - 40 - r() * 120, 40 + r() * 50, 0, Math.PI * 2);
      c.fill();
    }
    c.filter = "none";
  });
}

function keysTex() {
  return make(1024, 340, (c, w, h) => {
    c.fillStyle = "#d4d6da";
    c.fillRect(0, 0, w, h);
    const rows = [14, 14, 13, 12, 10];
    rows.forEach((n, ri) => {
      const kw = (w - 30) / n;
      const y = 14 + ri * 64;
      for (let i = 0; i < n; i++) {
        let ww = kw - 8;
        let x = 15 + i * kw;
        if (ri === 4 && i === 4) ww = kw * 3 - 8;
        if (ri === 4 && i > 4) x += kw * 2;
        if (ri === 4 && i > 7) continue;
        c.fillStyle = "#fbfbfd";
        c.beginPath();
        c.roundRect(x, y, ww, 54, 9);
        c.fill();
      }
    });
  });
}

/* ---------- yardımcılar ---------- */
const hoverCursor = {
  onPointerOver: () => (document.body.style.cursor = "pointer"),
  onPointerOut: () => (document.body.style.cursor = ""),
};

/* ---------- oda ---------- */
function Shell() {
  const floor = useMemo(oakTex, []);
  const sky = useMemo(skyTex, []);
  const wall = "#efece6";
  // sol duvar pencere boşluğu: z -0.6..1.0, y 0.55..2.45
  const WX = -2.2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial map={floor} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.6, -1]} receiveShadow>
        <planeGeometry args={[9, 3.2]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      {/* sol duvar parçaları (pencerenin etrafı) */}
      {[
        // [zMerkez, yMerkez, genişlik(z), yükseklik]
        [-0.8, 1.6, 0.4, 3.2],
        [2.75, 1.6, 3.5, 3.2],
        [0.2, 0.275, 1.6, 0.55],
        [0.2, 2.825, 1.6, 0.75],
      ].map(([z, y, ww, hh], i) => (
        <mesh key={i} position={[WX, y, z]} rotation-y={Math.PI / 2} castShadow receiveShadow>
          <boxGeometry args={[ww, hh, 0.12]} />
          <meshStandardMaterial color={wall} roughness={0.95} />
        </mesh>
      ))}
      {/* pencere çerçevesi */}
      {[
        [0.2, 2.45, 1.6, 0.03],
        [0.2, 0.55, 1.6, 0.03],
        [-0.6, 1.5, 0.03, 1.9],
        [1.0, 1.5, 0.03, 1.9],
        [0.2, 1.5, 0.02, 1.9],
      ].map(([z, y, ww, hh], i) => (
        <mesh key={i} position={[WX + 0.02, y, z]} rotation-y={Math.PI / 2} castShadow>
          <boxGeometry args={[ww, hh, 0.05]} />
          <meshStandardMaterial color="#2b2b2d" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[WX - 0.25, 1.5, 0.2]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[2.2, 2.4]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {/* tavan */}
      <mesh position={[0, 3.2, 1.5]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#f4f2ee" />
      </mesh>
      {/* süpürgelik */}
      <mesh position={[0, 0.04, -0.995]}>
        <boxGeometry args={[9, 0.08, 0.01]} />
        <meshStandardMaterial color="#e6e2da" />
      </mesh>
      {/* yün halı */}
      <mesh rotation-x={-Math.PI / 2} position={[0.1, 0.006, 0.75]} receiveShadow>
        <circleGeometry args={[1.15, 64]} />
        <meshStandardMaterial color="#e4ddd0" roughness={1} />
      </mesh>
    </group>
  );
}

function Desk() {
  const top = useMemo(deskTex, []);
  return (
    <group>
      <RoundedBox args={[1.7, 0.035, 0.78]} radius={0.012} smoothness={4} position={[0, DESK_Y - 0.0175, -0.16]} castShadow receiveShadow>
        <meshStandardMaterial map={top} roughness={0.45} />
      </RoundedBox>
      {[-0.8, 0.8].map((x) => (
        <group key={x} position={[x, 0, -0.16]}>
          <mesh castShadow position={[0, (DESK_Y - 0.035) / 2, 0.33]}>
            <boxGeometry args={[0.025, DESK_Y - 0.035, 0.025]} />
            <meshStandardMaterial color="#f5f5f7" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh castShadow position={[0, (DESK_Y - 0.035) / 2, -0.33]}>
            <boxGeometry args={[0.025, DESK_Y - 0.035, 0.025]} />
            <meshStandardMaterial color="#f5f5f7" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[0.025, 0.025, 0.69]} />
            <meshStandardMaterial color="#f5f5f7" roughness={0.35} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Yakınlaşınca 3D (matrix3d) içindeki DOM, tarayıcıda bitmap olarak gerilir ve bulanık görünür.
   Kamera durunca aynı DOM düğümünü düz bir 2D katmana taşıyoruz: React örneği aynı kalır, metin keskinleşir. */
type Crisp = { x: number; y: number; s: number } | null;

function ScreenSlot({ active, crisp }: { active: boolean; crisp: Crisp }) {
  const slot = useRef<HTMLDivElement>(null);
  const [host] = useState(() => document.createElement("div"));
  const [overlay] = useState(() => {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: DOM_W + "px",
      height: DOM_H + "px",
      transformOrigin: "0 0",
      zIndex: "10",
      display: "none",
      fontFamily: '-apple-system, BlinkMacSystemFont, Inter, "Segoe UI", sans-serif',
      color: "#1d1d1f",
    });
    return d;
  });

  useLayoutEffect(() => {
    document.body.appendChild(overlay);
    return () => overlay.remove();
  }, [overlay]);

  useLayoutEffect(() => {
    if (crisp) {
      overlay.style.transform = `translate(${crisp.x}px, ${crisp.y}px) scale(${crisp.s})`;
      overlay.style.display = "block";
      if (host.parentNode !== overlay) overlay.appendChild(host);
    } else {
      if (slot.current && host.parentNode !== slot.current) slot.current.appendChild(host);
      overlay.style.display = "none";
    }
  }, [crisp, host, overlay]);

  return <div ref={slot} style={{ width: DOM_W, height: DOM_H }}>{createPortal(<StudioOS active={active} />, host)}</div>;
}

const corner = new THREE.Vector3();
function useCrispScreen(zoomed: boolean): Crisp {
  const { camera, gl } = useThree();
  const [crisp, setCrisp] = useState<Crisp>(null);
  const cur = useRef<Crisp>(null);
  const last = useRef(new THREE.Vector3());
  const still = useRef(0);
  const set = (c: Crisp) => {
    const a = cur.current;
    if (a === c || (a && c && a.x === c.x && a.y === c.y && Math.abs(a.s - c.s) < 1e-4)) return;
    cur.current = c;
    setCrisp(c);
  };
  useFrame(() => {
    const moved = last.current.distanceTo(camera.position);
    last.current.copy(camera.position);    if (!zoomed) {
      still.current = 0;
      set(null);
      return;
    }
    still.current = moved < 1e-5 ? still.current + 1 : 0;
    if (still.current < 3) {
      if (moved > 1e-4) set(null);
      return;
    }
    const r = gl.domElement.getBoundingClientRect();
    const px = (x: number, y: number) => {
      corner.set(SCREEN.pos.x + x, SCREEN.pos.y + y, SCREEN.pos.z).project(camera);
      return [r.left + ((corner.x + 1) / 2) * r.width, r.top + ((1 - corner.y) / 2) * r.height];
    };
    const [x0, y0] = px(-SCREEN.w / 2, SCREEN.h / 2);
    const [x1] = px(SCREEN.w / 2, SCREEN.h / 2);
    set({ x: Math.round(x0), y: Math.round(y0), s: (x1 - x0) / DOM_W });
  });
  return crisp;
}

function Display({ zoomed, onZoom }: { zoomed: boolean; onZoom: () => void }) {
  const [hover, setHover] = useState(false);
  const crisp = useCrispScreen(zoomed);
  const back = "#9fbfe0";
  const alu = "#d6d8dc";
  return (
    <group>
      {/* ayak */}
      <mesh castShadow receiveShadow position={[0, DESK_Y + 0.004, -0.3]}>
        <boxGeometry args={[0.18, 0.008, 0.17]} />
        <meshStandardMaterial color={alu} metalness={0.45} roughness={0.32} />
      </mesh>
      <mesh castShadow position={[0, 0.93, -0.3]} rotation-x={-0.12}>
        <boxGeometry args={[0.16, 0.36, 0.012]} />
        <meshStandardMaterial color={alu} metalness={0.45} roughness={0.32} />
      </mesh>

      <group
        onClick={(e) => {
          if (zoomed) return;
          e.stopPropagation();
          onZoom();
        }}
        onPointerOver={() => {
          if (zoomed) return;
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        <RoundedBox args={[0.68, 0.4925, 0.014]} radius={0.006} smoothness={4} position={[0, 1.12, -0.22]} castShadow receiveShadow>
          <meshStandardMaterial color={back} roughness={0.35} metalness={0.25} emissive="#ffffff" emissiveIntensity={hover && !zoomed ? 0.06 : 0} />
        </RoundedBox>
        {/* beyaz ön çerçeve */}
        <mesh position={[0, 1.157, -0.2129]}>
          <planeGeometry args={[0.68, 0.4175]} />
          <meshStandardMaterial color="#f5f5f7" roughness={0.3} />
        </mesh>
        {/* çene */}
        <mesh position={[0, 0.911, -0.2129]}>
          <planeGeometry args={[0.68, 0.075]} />
          <meshStandardMaterial color="#c6dbef" roughness={0.3} metalness={0.15} />
        </mesh>
        <mesh position={[0, 1.142, -0.21285]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>

      <group position={SCREEN.pos} scale={HTML_SCALE}>
        <Html transform occlude={false} zIndexRange={[5, 0]} pointerEvents={zoomed ? "auto" : "none"} style={{ width: DOM_W, height: DOM_H }}>
          <ScreenSlot active={zoomed} crisp={crisp} />
        </Html>
      </group>
      <pointLight position={[0, 1.15, 0.15]} intensity={0.25} distance={1.2} color="#dfefff" />
    </group>
  );
}

function Keyboard() {
  const keys = useMemo(keysTex, []);
  return (
    <group>
      <mesh castShadow receiveShadow position={[-0.04, DESK_Y + 0.004, 0.06]} rotation-x={0.03}>
        <boxGeometry args={[0.36, 0.008, 0.115]} />
        <meshStandardMaterial attach="material-0" color="#d6d8dc" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-1" color="#d6d8dc" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-2" map={keys} roughness={0.5} />
        <meshStandardMaterial attach="material-3" color="#d6d8dc" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-4" color="#d6d8dc" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-5" color="#d6d8dc" metalness={0.8} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.14, 0.005, 0.11]} radius={0.002} smoothness={3} position={[0.25, DESK_Y + 0.003, 0.06]} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e8ed" roughness={0.15} metalness={0.1} />
      </RoundedBox>
    </group>
  );
}

function Mug() {
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    steam.current?.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.4 + i / 3) % 1;
      c.position.set(Math.sin(t * 6 + i) * 0.012, 0.1 + t * 0.16, 0);
      c.scale.setScalar(0.6 + t);
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.25 * (1 - t);
    });
  });
  return (
    <group position={[-0.42, DESK_Y, 0.1]}>
      <mesh castShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.038, 0.034, 0.09, 32]} />
        <meshStandardMaterial color="#fafafa" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.088, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.034, 32]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.15} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Lamp() {
  const [on, setOn] = useState(true);
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <group
      position={[-0.68, DESK_Y, -0.38]}
      onClick={(e) => {
        e.stopPropagation();
        sfx.tap();
        setOn((v) => !v);
      }}
      {...hoverCursor}
    >
      <mesh castShadow position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.012, 40]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 12]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.12, 0.5, 0.06]} rotation={[0, -0.45, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.27, 12]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.24, 0.49, 0.12]}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 32]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.3} />
      </mesh>
      <mesh position={[0.24, 0.474, 0.12]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[0.03, 32]} />
        <meshStandardMaterial color="#fff" emissive="#ffe2b0" emissiveIntensity={on ? 4 : 0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <primitive object={target} position={[0.24, 0, 0.2]} />
      <spotLight position={[0.24, 0.46, 0.12]} target={target} angle={0.9} penumbra={1} intensity={on ? 3 : 0} distance={2} decay={1.5} color="#ffd9a0" />
    </group>
  );
}

function Cat() {
  const body = useRef<THREE.Group>(null);
  const [talk, setTalk] = useState<string | null>(null);
  const lines = () =>
    tx(
      "Bildirimleri kapat lütfen.|Bu bir özellik.|miyav.|Toplantı bir e-posta olabilirdi.|Tasarım: 9/10. Mama: 2/10.",
      "Please turn off notifications.|That's a feature.|meow.|This meeting could have been an email.|Design: 9/10. Food: 2/10."
    ).split("|");
  // mama kabına tıklanınca konuş
  useEffect(() => {
    let t: number | undefined;
    const off = catFood.onFeed(({ full, fed }) => {
      sfx.purr();
      setTalk(feedLine(full, fed));
      window.clearTimeout(t);
      t = window.setTimeout(() => setTalk(null), 2400);
    });
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, []);
  useFrame(({ clock }) => {
    if (body.current) body.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.035;
  });
  const fur = "#9a9a9f";
  return (
    <group
      position={[-0.66, DESK_Y, 0.02]}
      rotation-y={-0.9}
      onClick={(e) => {
        e.stopPropagation();
        sfx.meow();
        const l = lines();
        setTalk(l[Math.floor(Math.random() * l.length)]);
        window.setTimeout(() => setTalk(null), 2400);
      }}
      {...hoverCursor}
    >
      {/* keçe minder */}
      <mesh receiveShadow position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.012, 48]} />
        <meshStandardMaterial color="#d97757" roughness={1} />
      </mesh>
      <group ref={body} position={[0, 0.012, 0]}>
        <mesh castShadow position={[0, 0.055, 0]} scale={[1.3, 0.6, 1]}>
          <sphereGeometry args={[0.095, 32, 24]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
      </group>
      <group position={[0.11, 0.07, 0.045]}>
        <mesh castShadow>
          <sphereGeometry args={[0.055, 32, 24]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        {[-0.026, 0.026].map((z) => (
          <mesh key={z} position={[0.005, 0.052, z]} rotation-z={-0.25}>
            <coneGeometry args={[0.022, 0.045, 16]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>
        ))}
        {[-0.018, 0.018].map((z) => (
          <mesh key={z} position={[0.05, 0.008, z]} scale={talk ? [1, 1, 1] : [1, 0.22, 1.4]}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
      <mesh castShadow position={[-0.06, 0.03, 0.075]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.075, 0.015, 12, 24, Math.PI]} />
        <meshStandardMaterial color={fur} roughness={0.9} />
      </mesh>
      <Html position={[0.1, 0.22, 0]} center distanceFactor={1.4} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        {talk ? <div className="s-bubble">{talk}</div> : <div className="s-zzz">z z z</div>}
      </Html>
    </group>
  );
}

function Shelf() {
  const lang = useLang();
  const print = useMemo(() => racePrintStudioTex(lang === "en"), [lang]);
  const colorField = useMemo(colorFieldTex, []);
  const squish = useRef(0);
  const duck = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    squish.current = Math.max(0, squish.current - dt * 4);
    const s = 1 - Math.sin(squish.current * Math.PI) * 0.25;
    duck.current?.scale.set(1 + (1 - s) * 0.5, s, 1 + (1 - s) * 0.5);
  });
  return (
    <group>
      {/* çerçeveli baskı */}
      <group position={[0.75, 1.75, -0.985]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.65, 0.02]} />
          <meshStandardMaterial color="#1d1d1f" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.46, 0.61]} />
          <meshStandardMaterial map={print} roughness={0.7} />
        </mesh>
      </group>
      {/* rafın üstünde ince çerçeveli renk alanı baskısı: bordo-mavi, logosuz */}
      <group position={[-0.45, 2.1, -0.988]}>
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.32, 0.016]} />
          <meshStandardMaterial color="#f5f5f7" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={[0.43, 0.29]} />
          <meshStandardMaterial map={colorField} roughness={0.8} />
        </mesh>
      </group>
      {/* yüzen raf */}
      <mesh castShadow receiveShadow position={[-0.45, 1.62, -0.9]}>
        <boxGeometry args={[0.8, 0.03, 0.2]} />
        <meshStandardMaterial color="#d9c3a2" roughness={0.5} />
      </mesh>
      {[
        ["#1d1d1f", 0.22],
        ["#f5f5f7", 0.2],
        ["#d97757", 0.24],
        ["#86868b", 0.19],
      ].map(([c, h], i) => (
        <mesh key={i} castShadow position={[-0.75 + i * 0.045, 1.635 + (h as number) / 2, -0.9]}>
          <boxGeometry args={[0.04, h as number, 0.15]} />
          <meshStandardMaterial color={c as string} roughness={0.6} />
        </mesh>
      ))}
      {/* seramik vazo */}
      <mesh castShadow position={[-0.35, 1.71, -0.9]}>
        <sphereGeometry args={[0.07, 32, 24]} />
        <meshStandardMaterial color="#f2efe9" roughness={0.6} />
      </mesh>
      {/* seramik ördek: tıkla */}
      <group
        ref={duck}
        position={[-0.15, 1.635, -0.9]}
        rotation-y={-0.4}
        onClick={(e) => {
          e.stopPropagation();
          squish.current = 1;
          sfx.pop();
        }}
        {...hoverCursor}
      >
        <mesh castShadow position={[0, 0.035, 0]} scale={[1.3, 0.9, 1]}>
          <sphereGeometry args={[0.04, 32, 24]} />
          <meshStandardMaterial color="#fbfbfb" roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0.035, 0.085, 0]}>
          <sphereGeometry args={[0.027, 32, 24]} />
          <meshStandardMaterial color="#fbfbfb" roughness={0.2} />
        </mesh>
        <mesh position={[0.064, 0.08, 0]} rotation-z={-Math.PI / 2} scale={[1, 1, 0.6]}>
          <coneGeometry args={[0.011, 0.024, 16]} />
          <meshStandardMaterial color="#ffb340" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- akıllı hoparlör: tıklayınca kamera yaklaşır, şarkılar yandaki pencereden seçilir ---------- */
function Speaker({ active, onOpen }: { active: boolean; onOpen: () => void }) {
  const { playing, track } = useYt();
  const [hover, setHover] = useState(false);
  const cover = useThumbTex(track.id);
  const grille = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    // YouTube sesine erişemiyoruz; çalarken ~100 BPM'lik yumuşak bir nabız
    const p = playing ? Math.pow(Math.max(0, Math.sin(clock.elapsedTime * Math.PI * 1.66)), 8) : 0;
    grille.current?.scale.setScalar(1 + p * 0.06);
    if (glow.current) glow.current.opacity = playing ? 0.45 + p * 0.55 : 0;
  });
  const fabric = "#e9e4dc";
  return (
    <group
      position={[SPEAKER.pos.x, DESK_Y, SPEAKER.pos.z]}
      rotation-y={SPEAKER.rot}
      onClick={(e) => {
        if (active) return;
        e.stopPropagation();
        sfx.unlock();
        onOpen();
      }}
      onPointerOver={(e) => {
        if (active) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      <RoundedBox args={[0.11, 0.16, 0.085]} radius={0.014} smoothness={4} position={[0, 0.08, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={fabric} roughness={0.95} emissive="#ffffff" emissiveIntensity={hover && !active ? 0.05 : 0} />
      </RoundedBox>
      {/* kapak ekranı */}
      <mesh position={[0, 0.115, 0.0431]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial map={cover} roughness={0.3} emissive="#ffffff" emissiveMap={cover} emissiveIntensity={playing ? 0.35 : 0.12} />
      </mesh>
      {/* ızgara */}
      <mesh ref={grille} position={[0, 0.042, 0.0431]}>
        <circleGeometry args={[0.026, 40]} />
        <meshStandardMaterial color="#d8d2c8" roughness={1} />
      </mesh>
      {/* üstte çalma ışığı */}
      <mesh position={[0, 0.1605, 0.01]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.009, 24]} />
        <meshBasicMaterial ref={glow} color="#d97757" transparent opacity={0} toneMapped={false} />
      </mesh>
      {!active && (
        <Html position={[0, 0.28, 0]} center distanceFactor={1.4} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
          {hover || playing ? (
            <div className="s-prop-tip">
              {playing ? `♪ ${track.title} · ${track.artist}` : tx("Müzik çalar", "Music player")}
              {hover && <small>{tx("tıkla: yakınlaş ve şarkı seç", "click: zoom in and pick a song")}</small>}
            </div>
          ) : null}
        </Html>
      )}
    </group>
  );
}

function Plants() {
  const leaves = useMemo(() => {
    const r = rand(9);
    return Array.from({ length: 26 }, () => ({
      y: 0.55 + r() * 1.0,
      a: r() * Math.PI * 2,
      d: 0.08 + r() * 0.22,
      s: 0.07 + r() * 0.05,
    }));
  }, []);
  const grp = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (grp.current) grp.current.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.01;
  });
  return (
    <group>
      {/* köşedeki büyük bitki */}
      <group position={[1.35, 0, -0.65]}>
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.17, 0.14, 0.4, 40]} />
          <meshStandardMaterial color="#f2efe9" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.012, 0.018, 1.1, 8]} />
          <meshStandardMaterial color="#6b5440" />
        </mesh>
        <group ref={grp}>
          {leaves.map((l, i) => (
            <mesh
              key={i}
              castShadow
              position={[Math.cos(l.a) * l.d, l.y, Math.sin(l.a) * l.d]}
              rotation={[Math.sin(l.a) * 0.6, l.a, 0.5]}
              scale={[l.s, l.s * 0.25, l.s * 0.8]}
            >
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color={i % 3 ? "#4e7d4a" : "#5f9459"} roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>
      {/* masadaki küçük saksı */}
      <group position={[0.66, DESK_Y, -0.38]}>
        <mesh castShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.08, 32]} />
          <meshStandardMaterial color="#1d1d1f" roughness={0.5} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} castShadow position={[Math.cos(a) * 0.02, 0.1, Math.sin(a) * 0.02]} rotation={[Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4]} scale={[0.6, 1, 0.6]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial color="#7fa36f" roughness={0.5} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Rig({ phase }: { phase: StudioPhase }) {
  const { camera, size, pointer } = useThree();
  const look = useRef(ROOM_LOOK.clone());
  const p = useRef(new THREE.Vector3());
  const l = useRef(new THREE.Vector3());
  useEffect(() => {
    camera.position.copy(START_POS);
    camera.lookAt(ROOM_LOOK);
  }, [camera]);
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    if (phase === "screen") {
      const t = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      const fill = 0.95;
      const d = Math.max(SCREEN.h / fill / t, SCREEN.w / fill / (t * aspect));
      p.current.set(SCREEN.pos.x, SCREEN.pos.y, SCREEN.pos.z + d);
      l.current.copy(SCREEN.pos);
    } else if (phase === "player") {
      // hoparlöre yakınlaş; masaüstünde hoparlör solda kalsın (sağda panel var), dar ekranda üstte
      const wide = aspect > 1.1;
      const face = new THREE.Vector3(Math.sin(SPEAKER.rot), 0, Math.cos(SPEAKER.rot));
      const right = new THREE.Vector3(Math.cos(SPEAKER.rot), 0, -Math.sin(SPEAKER.rot));
      const d = wide ? 0.62 : 0.95;
      l.current.copy(SPEAKER.pos);
      if (wide) l.current.addScaledVector(right, 0.13);
      else l.current.y -= 0.17;
      p.current.copy(SPEAKER.pos).addScaledVector(face, d).addScaledVector(right, wide ? 0.13 : 0);
      p.current.y += wide ? 0.12 : 0.2;
    } else if (phase === "room") {
      const back = THREE.MathUtils.clamp(1.75 / aspect, 1.05, 2.1);
      p.current.copy(ROOM_POS).sub(ROOM_LOOK).multiplyScalar(back).add(ROOM_LOOK);
      p.current.x += pointer.x * 0.25;
      p.current.y += pointer.y * 0.12;
      l.current.copy(ROOM_LOOK);
    } else {
      p.current.copy(START_POS);
      l.current.copy(ROOM_LOOK);
    }
    // yumuşak, "ease-out" his veren sönümleme
    const k = 1 - Math.exp(-dt * (phase === "screen" || phase === "player" ? 3 : 1.6));
    cam.position.lerp(p.current, k);
    look.current.lerp(l.current, k);
    cam.lookAt(look.current);
  });
  return null;
}

export function StudioScene({ phase, onZoom, onPlayer }: { phase: StudioPhase; onZoom: () => void; onPlayer: () => void }) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.01, far: 40, position: START_POS.toArray() }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
      }}
    >
      <color attach="background" args={["#f2efe9"]} />
      {/* çevre ışığı: dosya indirmeden, ışık panelleriyle */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff6ea" position={[-4, 2, 0.2]} rotation-y={Math.PI / 2} scale={[3, 2.5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#dfe9ff" position={[3, 1.5, 3]} rotation-y={-Math.PI / 3} scale={[4, 2, 1]} />
      </Environment>
      <ambientLight intensity={0.55} />
      {/* pencereden giren güneş */}
      <directionalLight
        position={[-5, 3.6, 1.4]}
        intensity={3.2}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[0.8, 2.6, 1.6]} intensity={1.2} distance={6} decay={1.2} color="#fff4e6" />
      <Rig phase={phase} />
      <Shell />
      <Desk />
      <Display zoomed={phase === "screen"} onZoom={onZoom} />
      <Keyboard />
      <Mug />
      <Lamp />
      <Cat />
      <Speaker active={phase === "player"} onOpen={onPlayer} />
      <FoodBowl position={[-0.55, 0.008, 0.4]} color="#f5f5f7" inner="#d97757" tipClass="s-prop-tip" />
      <Shelf />
      <Plants />
    </Canvas>
  );
}
