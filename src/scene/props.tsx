import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { make, rand } from "./textures";
import { sfx } from "../sfx";
import { tx } from "../i18n";
import { thumb } from "../player/yt";

/* =========================================================
   İki sahnenin ortak süsleri: atkı, yarış posteri, renk alanı baskısı,
   albüm kapağı ve kedinin mama kabı. Logo ya da marka yok;
   hepsi kodla çizilen özgün tasarımlar.
   ========================================================= */

const pointer = {
  onPointerOver: () => (document.body.style.cursor = "pointer"),
  onPointerOut: () => (document.body.style.cursor = ""),
};

/* ---------- dokular ---------- */
const BORDO = "#7a1f3d";
const MAVI = "#6ec1ef";

export function scarfTex() {
  return make(1024, 160, (c, w, h) => {
    c.fillStyle = BORDO;
    c.fillRect(0, 0, w, h);
    // uç blokları ve ince şeritler
    c.fillStyle = MAVI;
    c.fillRect(0, 0, 150, h);
    c.fillRect(w - 150, 0, 150, h);
    [170, 190, w - 196, w - 176].forEach((x) => c.fillRect(x, 0, 8, h));
    c.fillRect(0, 10, w, 6);
    c.fillRect(0, h - 16, w, 6);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = MAVI;
    c.font = "900 84px Inter, 'Arial Black', sans-serif";
    c.fillText("TRABZON", w / 2, h / 2 + 4);
    c.fillStyle = BORDO;
    c.font = "900 70px Inter, 'Arial Black', sans-serif";
    c.fillText("61", 75, h / 2 + 4);
    c.fillText("61", w - 75, h / 2 + 4);
  });
}

/** Stilize, açık tekerlekli yarış arabası (yan görünüş) */
function car(c: CanvasRenderingContext2D, x: number, y: number, s: number, body: string, dark: string) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = body;
  c.beginPath();
  c.moveTo(-170, 10);
  c.lineTo(-150, -18);
  c.lineTo(-40, -26);
  c.lineTo(-10, -52);
  c.lineTo(30, -52);
  c.lineTo(60, -28);
  c.lineTo(150, -20);
  c.lineTo(175, 0);
  c.lineTo(175, 12);
  c.closePath();
  c.fill();
  // arka kanat ve ön kanat
  c.fillRect(-182, -62, 16, 70);
  c.fillRect(-196, -66, 46, 12);
  c.fillRect(150, 6, 46, 9);
  // kask
  c.fillStyle = "#ffd166";
  c.beginPath();
  c.arc(8, -50, 15, Math.PI, 0);
  c.fill();
  // tekerlekler
  [-115, 115].forEach((wx) => {
    c.fillStyle = dark;
    c.beginPath();
    c.arc(wx, 12, 32, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#9aa0a8";
    c.beginPath();
    c.arc(wx, 12, 11, 0, Math.PI * 2);
    c.fill();
  });
  c.restore();
}

export function racePosterRetroTex(en: boolean) {
  return make(512, 720, (c, w, h) => {
    c.fillStyle = "#14122b";
    c.fillRect(0, 0, w, h);
    // beş start ışığı
    for (let i = 0; i < 5; i++) {
      c.fillStyle = "#2a2a2a";
      c.fillRect(66 + i * 80, 44, 60, 60);
      c.fillStyle = "#ff2a1a";
      c.shadowColor = "#ff2a1a";
      c.shadowBlur = 18;
      c.beginPath();
      c.arc(96 + i * 80, 74, 20, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
    c.fillStyle = "#ffd166";
    c.textAlign = "center";
    c.font = "bold 92px 'Courier New', monospace";
    c.fillText(en ? "LIGHTS" : "IŞIKLAR", w / 2, 210);
    c.fillText(en ? "OUT" : "SÖNDÜ", w / 2, 296);
    // hız çizgileri
    c.fillStyle = "#ef476f";
    for (let i = 0; i < 5; i++) c.fillRect(20, 380 + i * 20, 120 - i * 18, 7);
    car(c, w / 2 + 40, 440, 0.95, "#e63946", "#0b0b0b");
    // dama bayrağı şeridi
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 ? "#f4f1e6" : "#111";
        c.fillRect(i * 32, 540 + j * 32, 32, 32);
      }
    c.fillStyle = "#f4f1e6";
    c.font = "bold 30px 'Courier New', monospace";
    c.fillText("GRAND PRIX · 1998", w / 2, h - 50);
    c.strokeStyle = "#ffd166";
    c.lineWidth = 10;
    c.strokeRect(14, 14, w - 28, h - 28);
  });
}

/** Retro bir taraftar posteri: açık mavi-beyaz çubuklar, dev "10" ve
    piktogram tarzında top süren bir oyuncu (fotoğraf ya da gerçek bir görsel değil). */
export function messiPosterTex() {
  return make(512, 720, (c, w, h) => {
    // açık mavi - beyaz dikey çubuklar
    for (let i = 0; i < 9; i++) {
      c.fillStyle = i % 2 ? "#f4f1e6" : "#75aadb";
      c.fillRect(i * (w / 9), 0, w / 9 + 1, h);
    }
    // alt kısmı karart (zemin)
    const g = c.createLinearGradient(0, h * 0.55, 0, h);
    g.addColorStop(0, "rgba(20,18,43,0)");
    g.addColorStop(1, "rgba(20,18,43,.85)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    // üst bant ve isim
    c.fillStyle = "#14122b";
    c.fillRect(0, 34, w, 104);
    c.fillStyle = "#f4f1e6";
    c.textAlign = "center";
    c.font = "bold 92px 'Courier New', monospace";
    c.fillText("MESSI", w / 2, 118);

    // dev forma numarası
    c.fillStyle = "rgba(20,18,43,.16)";
    c.font = "bold 360px 'Courier New', monospace";
    c.fillText("10", w / 2, 500);

    // piktogram oyuncu: kalın, yuvarlak uçlu uzuvlar
    c.strokeStyle = c.fillStyle = "#14122b";
    c.lineCap = c.lineJoin = "round";
    const limb = (pts: number[], wd: number) => {
      c.lineWidth = wd;
      c.beginPath();
      c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
      c.stroke();
    };
    const ox = 236;
    const oy = 200;
    c.beginPath();
    c.arc(ox + 24, oy + 22, 30, 0, Math.PI * 2); // baş
    c.fill();
    limb([ox + 14, oy + 62, ox - 8, oy + 170], 46); // gövde (öne eğik)
    limb([ox + 8, oy + 80, ox - 58, oy + 120, ox - 92, oy + 96], 22); // arka kol
    limb([ox + 14, oy + 84, ox + 70, oy + 128, ox + 110, oy + 118], 22); // ön kol
    limb([ox - 8, oy + 170, ox - 70, oy + 240, ox - 130, oy + 236], 28); // arka bacak
    limb([ox - 8, oy + 170, ox + 44, oy + 238, ox + 70, oy + 318], 28); // ön bacak
    // top
    c.fillStyle = "#f4f1e6";
    c.beginPath();
    c.arc(ox + 116, oy + 314, 30, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 5;
    c.stroke();
    c.fillStyle = "#14122b";
    c.beginPath();
    c.arc(ox + 116, oy + 314, 10, 0, Math.PI * 2);
    c.fill();
    // hız çizgileri
    c.lineWidth = 7;
    [0, 1, 2].forEach((i) => limb([ox - 190, oy + 150 + i * 34, ox - 140 + i * 14, oy + 150 + i * 34], 7));

    // GOAT: altın sarısı, büyük
    c.fillStyle = "#ffd166";
    c.shadowColor = "rgba(0,0,0,.6)";
    c.shadowBlur = 8;
    c.font = "bold 84px 'Courier New', monospace";
    c.fillText("GOAT", w / 2, h - 82);
    c.shadowBlur = 0;
    c.fillStyle = "#f4f1e6";
    c.font = "bold 24px 'Courier New', monospace";
    c.fillText("· LA PULGA ·", w / 2, h - 40);
    c.strokeStyle = "#14122b";
    c.lineWidth = 10;
    c.strokeRect(14, 14, w - 28, h - 28);
  });
}

export function racePrintStudioTex(en: boolean) {
  return make(600, 800, (c, w, h) => {
    c.fillStyle = "#f6f3ec";
    c.fillRect(0, 0, w, h);
    // beş küçük ışık
    for (let i = 0; i < 5; i++) {
      c.fillStyle = "#ff3b30";
      c.beginPath();
      c.arc(w / 2 - 80 + i * 40, 92, 11, 0, Math.PI * 2);
      c.fill();
    }
    // genel bir pist çizgisi (gerçek bir pist değil)
    c.strokeStyle = "#1d1d1f";
    c.lineWidth = 9;
    c.lineJoin = c.lineCap = "round";
    c.beginPath();
    c.moveTo(150, 520);
    c.bezierCurveTo(120, 420, 160, 300, 250, 250);
    c.bezierCurveTo(320, 210, 330, 300, 380, 300);
    c.bezierCurveTo(470, 300, 470, 190, 430, 170);
    c.bezierCurveTo(500, 170, 520, 330, 470, 420);
    c.bezierCurveTo(430, 490, 360, 430, 330, 480);
    c.bezierCurveTo(300, 540, 230, 600, 150, 520);
    c.stroke();
    // start çizgisi
    c.fillStyle = "#ff3b30";
    c.beginPath();
    c.arc(152, 470, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#1d1d1f";
    c.textAlign = "center";
    c.font = "600 34px Inter, -apple-system, 'Segoe UI', sans-serif";
    c.fillText(en ? "lights out." : "ışıklar söndü.", w / 2, h - 90);
    c.font = "400 18px Inter, -apple-system, 'Segoe UI', sans-serif";
    c.fillStyle = "#86868b";
    c.fillText(en ? "669 → 320 ms. every lap counts." : "669 → 320 ms. her tur önemli.", w / 2, h - 58);
  });
}

/** YouTube küçük resminden albüm kapağı dokusu: 16:9 görselin ortadaki karesi */
const thumbLoader = new THREE.TextureLoader();
thumbLoader.setCrossOrigin("anonymous");
export function useThumbTex(id: string) {
  const tex = useMemo(() => {
    const t = thumbLoader.load(thumb(id));
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(9 / 16, 1);
    t.offset.set((1 - 9 / 16) / 2, 0);
    return t;
  }, [id]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** Stüdyo için sakin bir renk alanı baskısı: bordo ve mavi bloklar, köşede küçük "61" */
export function colorFieldTex() {
  return make(860, 580, (c, w, h) => {
    c.fillStyle = "#f4f1ea";
    c.fillRect(0, 0, w, h);
    const pad = 70;
    c.fillStyle = BORDO;
    c.fillRect(pad, pad, w * 0.5 - pad, h - pad * 2 - 40);
    c.fillStyle = MAVI;
    c.fillRect(w * 0.5 + 18, pad, w * 0.5 - pad - 18, (h - pad * 2 - 40) * 0.62);
    c.fillStyle = "#1d1d1f";
    c.fillRect(w * 0.5 + 18, pad + (h - pad * 2 - 40) * 0.62 + 18, 120, 10);
    c.font = "600 22px Inter, -apple-system, 'Segoe UI', sans-serif";
    c.textAlign = "right";
    c.fillText("61", w - pad, h - pad + 4);
    c.textAlign = "left";
    c.fillStyle = "#86868b";
    c.font = "400 18px Inter, -apple-system, 'Segoe UI', sans-serif";
    c.fillText("bordo / mavi", pad, h - pad + 4);
  });
}

/* ---------- atkı ---------- */
export function Scarf({ width = 0.82, ...props }: JSX.IntrinsicElements["group"] & { width?: number }) {
  const tex = useMemo(scarfTex, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, width * 0.16, 32, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (width / 2);
      p.setY(i, p.getY(i) - 0.035 * (1 - u * u)); // hafif sarkma
      p.setZ(i, 0.006 * Math.sin(u * 9));
    }
    g.computeVertexNormals();
    return g;
  }, [width]);
  const h = width * 0.16;
  return (
    <group {...props}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial map={tex} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* püsküller */}
      {[-1, 1].map((sd) =>
        Array.from({ length: 6 }).map((_, i) => (
          <mesh key={sd + "-" + i} position={[sd * (width / 2 + 0.025), h / 2 - 0.012 - i * (h / 6.5), 0]}>
            <boxGeometry args={[0.05, 0.007, 0.004]} />
            <meshStandardMaterial color={i % 2 ? BORDO : MAVI} roughness={1} />
          </mesh>
        ))
      )}
      {/* iğneler */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * (width / 2 - 0.03), h / 2 - 0.01, 0.01]}>
          <sphereGeometry args={[0.009, 10, 10]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- mama ---------- */
const MAX = 24;
type Food = { count: number; fed: number };
let food: Food = { count: 0, fed: 0 };
const foodSubs = new Set<() => void>();
const feedSubs = new Set<(e: { full: boolean; fed: number }) => void>();
let eater: number | null = null;

function setFood(f: Food) {
  food = f;
  foodSubs.forEach((s) => s());
}

export const catFood = {
  add() {
    const full = food.count >= MAX;
    if (!full) setFood({ count: Math.min(MAX, food.count + 3), fed: food.fed + 1 });
    feedSubs.forEach((s) => s({ full, fed: food.fed }));
    // kedi yavaş yavaş yer
    if (!eater)
      eater = window.setInterval(() => {
        if (food.count <= 0) {
          window.clearInterval(eater!);
          eater = null;
          return;
        }
        setFood({ ...food, count: food.count - 1 });
      }, 2600);
    return full;
  },
  /** Kedi bileşeni mama gelince tepki versin */
  onFeed(f: (e: { full: boolean; fed: number }) => void) {
    feedSubs.add(f);
    return () => {
      feedSubs.delete(f);
    };
  },
};

export function useFood() {
  return useSyncExternalStore(
    (f) => {
      foodSubs.add(f);
      return () => {
        foodSubs.delete(f);
      };
    },
    () => food
  );
}

/** Kedinin tepki cümleleri: kaçıncı mama olduğuna ve kabın dolu olup olmadığına göre */
export function feedLine(full: boolean, fed: number) {
  if (full) return tx("Kap dolu. Ama yine de koy.|Doydum. Sanırım.|Bu kadar mama ile 2 sprint giderim.", "Bowl's full. Add more anyway.|I'm full. I think.|That's enough food for 2 sprints.").split("|")[fed % 3];
  if (fed === 1) return tx("MAMA!!", "FOOD!!");
  const l = tx(
    "mırrr...|İşte bu.|Bir tane daha?|En iyi geliştirici sensin.|Kod review: 10/10.|Bu PR'ı onaylıyorum.|Mama: 10/10.",
    "purrr...|Now we're talking.|One more?|You're the best developer.|Code review: 10/10.|Approving this PR.|Food: 10/10."
  ).split("|");
  return l[fed % l.length];
}

export function FoodBowl({ color = "#e63946", inner = "#f4f1e6", tipClass = "prop-tip", ...props }: JSX.IntrinsicElements["group"] & { color?: string; inner?: string; tipClass?: string }) {
  const { count } = useFood();
  const [hover, setHover] = useState(false);
  const [pop, setPop] = useState(0);
  const group = useRef<THREE.Group>(null);
  const kibbles = useMemo(() => {
    const r = rand(23);
    return Array.from({ length: MAX }, (_, i) => {
      const layer = Math.floor(i / 10);
      const a = i * 2.4 + r();
      const rr = Math.sqrt(((i % 10) + 0.5) / 10) * (0.058 - layer * 0.014);
      return { p: [Math.cos(a) * rr, 0.017 + layer * 0.011 + r() * 0.003, Math.sin(a) * rr] as [number, number, number], c: ["#8b5a2b", "#a0692f", "#6f4520"][i % 3], s: 0.8 + r() * 0.4 };
    });
  }, []);
  useEffect(() => {
    if (!pop) return;
    const t = window.setTimeout(() => setPop(0), 900);
    return () => window.clearTimeout(t);
  }, [pop]);

  return (
    <group
      ref={group}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        sfx.unlock();
        sfx.kibble();
        const full = catFood.add();
        if (!full) setPop((p) => p + 1);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        pointer.onPointerOver();
      }}
      onPointerOut={() => {
        setHover(false);
        pointer.onPointerOut();
      }}
    >
      {/* dış duvar */}
      <mesh castShadow receiveShadow position={[0, 0.022, 0]}>
        <cylinderGeometry args={[0.09, 0.075, 0.044, 40, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.044, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.09, 0.006, 10, 40]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[0.08, 40]} />
        <meshStandardMaterial color={inner} roughness={0.5} />
      </mesh>
      {/* balık şekilli etiket yerine küçük bir pati izi */}
      <mesh position={[0, 0.024, 0.0835]} rotation-x={-0.33}>
        <circleGeometry args={[0.01, 16]} />
        <meshStandardMaterial color={inner} />
      </mesh>
      {kibbles.slice(0, count).map((k, i) => (
        <mesh key={i} position={k.p} scale={k.s} castShadow>
          <sphereGeometry args={[0.0085, 8, 6]} />
          <meshStandardMaterial color={k.c} roughness={0.8} />
        </mesh>
      ))}
      <Html position={[0, 0.17, 0]} center distanceFactor={1.4} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        {pop ? (
          <div key={pop} className={tipClass + " pop"}>+3 🐟</div>
        ) : hover ? (
          <div className={tipClass}>{count >= MAX ? tx("Kap dolu", "Bowl is full") : tx("Mama ver", "Feed the cat")}</div>
        ) : null}
      </Html>
    </group>
  );
}
