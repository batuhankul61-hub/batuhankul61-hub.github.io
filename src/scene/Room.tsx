import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { floorTex, wallpaperTex, windowTex, floppyTex } from "./textures";
import { sfx } from "../sfx";
import { tx, useLang } from "../i18n";
import { useYt } from "../player/yt";
import { Scarf, FoodBowl, catFood, feedLine, racePosterRetroTex, messiPosterTex, useThumbTex } from "./props";

export const DESK_Y = 0.75;

function Box(props: JSX.IntrinsicElements["mesh"] & { size: [number, number, number]; color: string; rough?: number; metal?: number }) {
  const { size, color, rough = 0.8, metal = 0, ...rest } = props;
  return (
    <mesh castShadow receiveShadow {...rest}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Walls() {
  const floor = useMemo(floorTex, []);
  const paper = useMemo(wallpaperTex, []);
  const paperSide = useMemo(() => {
    const t = wallpaperTex();
    t.repeat.set(4, 2);
    return t;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={floor} roughness={0.7} />
      </mesh>
      {/* arka duvar */}
      <mesh position={[0, 1.6, -1]} receiveShadow>
        <planeGeometry args={[8, 3.2]} />
        <meshStandardMaterial map={paper} roughness={0.95} />
      </mesh>
      {/* sol duvar */}
      <mesh position={[-2.4, 1.6, 1.5]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[5, 3.2]} />
        <meshStandardMaterial map={paperSide} roughness={0.95} />
      </mesh>
      {/* süpürgelikler */}
      <Box size={[8, 0.12, 0.03]} position={[0, 0.06, -0.985]} color="#e9dfc6" />
      <Box size={[0.03, 0.12, 5]} position={[-2.385, 0.06, 1.5]} color="#e9dfc6" />
      {/* tavan (ışığı kapatsın diye) */}
      <mesh position={[0, 3.2, 1.5]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#1c2a2b" />
      </mesh>
      {/* halı */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0.9]} receiveShadow>
        <circleGeometry args={[1.05, 48]} />
        <meshStandardMaterial color="#8c2f3a" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.9]}>
        <ringGeometry args={[0.85, 0.92, 48]} />
        <meshStandardMaterial color="#e3b75a" roughness={1} />
      </mesh>
    </group>
  );
}

function Window() {
  const tex = useMemo(windowTex, []);
  return (
    <group position={[-2.39, 1.75, 0.3]} rotation-y={Math.PI / 2}>
      <mesh>
        <planeGeometry args={[1.1, 1.35]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* çerçeve */}
      <Box size={[1.22, 0.06, 0.06]} position={[0, 0.7, 0.02]} color="#efe6cf" />
      <Box size={[1.22, 0.06, 0.06]} position={[0, -0.7, 0.02]} color="#efe6cf" />
      <Box size={[0.06, 1.4, 0.06]} position={[-0.58, 0, 0.02]} color="#efe6cf" />
      <Box size={[0.06, 1.4, 0.06]} position={[0.58, 0, 0.02]} color="#efe6cf" />
      <Box size={[0.04, 1.35, 0.04]} position={[0, 0, 0.02]} color="#efe6cf" />
      <Box size={[1.1, 0.04, 0.04]} position={[0, 0.05, 0.02]} color="#efe6cf" />
      <Box size={[1.35, 0.05, 0.16]} position={[0, -0.74, 0.07]} color="#efe6cf" />
      {/* perde */}
      <mesh position={[-0.72, 0.05, 0.1]} castShadow>
        <boxGeometry args={[0.22, 1.6, 0.04]} />
        <meshStandardMaterial color="#c9583e" roughness={1} />
      </mesh>
      <mesh position={[0.72, 0.05, 0.1]} castShadow>
        <boxGeometry args={[0.22, 1.6, 0.04]} />
        <meshStandardMaterial color="#c9583e" roughness={1} />
      </mesh>
    </group>
  );
}

function Posters() {
  const lang = useLang();
  const p1 = useMemo(messiPosterTex, []);
  const p2 = useMemo(() => racePosterRetroTex(lang === "en"), [lang]);
  return (
    <group>
      <mesh position={[-1.05, 1.75, -0.99]} rotation-z={0.03}>
        <planeGeometry args={[0.55, 0.77]} />
        <meshStandardMaterial map={p1} roughness={0.6} />
      </mesh>
      <mesh position={[1.1, 1.8, -0.99]} rotation-z={-0.04}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshStandardMaterial map={p2} roughness={0.6} />
      </mesh>
      {/* bordo-mavi atkı */}
      <Scarf position={[-1.05, 2.27, -0.975]} rotation-z={0.02} width={0.74} />
      {/* raf */}
      <Box size={[0.9, 0.03, 0.22]} position={[0.1, 2.05, -0.88]} color="#7a5233" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          size={[0.045, 0.2 + (i % 3) * 0.03, 0.15]}
          position={[-0.25 + i * 0.05, 2.17 + (i % 3) * 0.015, -0.88]}
          rotation-z={i === 5 ? -0.25 : 0}
          color={["#b23a48", "#2a6f97", "#e9c46a", "#3a5a40", "#6d597a", "#f4a261"][i]}
        />
      ))}
      {/* raftaki kupa */}
      <mesh position={[0.35, 2.12, -0.88]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 2.2, -0.88]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Desk() {
  const wood = "#8a5a36";
  return (
    <group>
      <Box size={[2.0, 0.05, 0.9]} position={[0, DESK_Y - 0.025, -0.1]} color={wood} rough={0.55} />
      {[
        [-0.95, -0.5],
        [-0.95, 0.3],
      ].map(([x, z], i) => (
        <Box key={i} size={[0.05, DESK_Y - 0.05, 0.05]} position={[x, (DESK_Y - 0.05) / 2, z]} color="#5e3d24" />
      ))}
      {/* çekmece ünitesi */}
      <Box size={[0.5, DESK_Y - 0.05, 0.8]} position={[0.72, (DESK_Y - 0.05) / 2, -0.1]} color="#7c5131" />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0.72, 0.13 + i * 0.22, 0.305]}>
          <Box size={[0.44, 0.18, 0.02]} color="#93633f" />
          <Box size={[0.12, 0.02, 0.03]} position={[0, 0.03, 0.02]} color="#d8c39a" metal={0.6} rough={0.3} />
        </group>
      ))}
      {/* arka panel */}
      <Box size={[1.9, 0.5, 0.02]} position={[-0.05, 0.42, -0.53]} color="#6a4429" />
    </group>
  );
}

function Lamp() {
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  const [on, setOn] = useState(true);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.35, DESK_Y, 0.05);
    return o;
  }, []);
  return (
    <group
      position={[-0.82, DESK_Y, -0.38]}
      onClick={(e) => {
        e.stopPropagation();
        sfx.click();
        setOn((v) => !v);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <mesh castShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.03, 24]} />
        <meshStandardMaterial color="#1e5f74" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.05, 0.22, 0.03]} rotation-z={-0.35}>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
        <meshStandardMaterial color="#cfd2d4" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.2, 0.46, 0.08]} rotation-z={0.9}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        <meshStandardMaterial color="#cfd2d4" metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[0.33, 0.5, 0.12]} rotation={[0.35, 0, -0.9]}>
        <mesh castShadow>
          <coneGeometry args={[0.1, 0.16, 24, 1, true]} />
          <meshStandardMaterial color="#1e5f74" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            ref={bulb}
            color="#fff2c4"
            emissive="#ffcf7a"
            emissiveIntensity={on ? 3 : 0}
            toneMapped={false}
          />
        </mesh>
      </group>
      <primitive object={target} position={[0.47, 0, 0.43]} />
      <spotLight
        ref={spot}
        position={[0.33, 0.46, 0.12]}
        target={target}
        angle={0.95}
        penumbra={0.8}
        intensity={on ? 6 : 0}
        distance={3}
        decay={1.5}
        color="#ffc977"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <pointLight position={[0.33, 0.46, 0.2]} intensity={on ? 0.6 : 0} distance={2.5} color="#ffbe6b" />
    </group>
  );
}

function Mug() {
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!steam.current) return;
    steam.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.5 + i / 3) % 1;
      c.position.y = 0.08 + t * 0.18;
      c.position.x = Math.sin(t * 6 + i) * 0.015;
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 * (1 - t);
      c.scale.setScalar(0.6 + t);
    });
  });
  return (
    <group position={[-0.42, DESK_Y, 0.22]}>
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.042, 0.038, 0.1, 24]} />
        <meshStandardMaterial color="#e63946" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.095, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0.048, 0.055, 0]}>
        <torusGeometry args={[0.025, 0.007, 8, 16]} />
        <meshStandardMaterial color="#e63946" roughness={0.4} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Floppies() {
  const lang = useLang();
  const data: [string, string][] = [
    ["#e63946", tx("OYUNLAR", "GAMES")],
    ["#457b9d", tx("ÖDEV_v2", "HMWRK_v2")],
    ["#2a9d8f", tx("yedek??", "backup??")],
    ["#f4a261", tx("SAKLA", "KEEP")],
  ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texs = useMemo(() => data.map(([c, l]) => floppyTex(c, l)), [lang]);
  return (
    <group position={[0.83, DESK_Y, 0.18]}>
      {texs.map((t, i) => (
        <mesh key={i} castShadow receiveShadow position={[i * 0.006, 0.004 + i * 0.008, i * 0.004]} rotation-y={i * 0.25 - 0.3}>
          <boxGeometry args={[0.09, 0.006, 0.09]} />
          <meshStandardMaterial attach="material-0" color={data[i][0]} />
          <meshStandardMaterial attach="material-1" color={data[i][0]} />
          <meshStandardMaterial attach="material-2" map={t} />
          <meshStandardMaterial attach="material-3" color={data[i][0]} />
          <meshStandardMaterial attach="material-4" color={data[i][0]} />
          <meshStandardMaterial attach="material-5" color={data[i][0]} />
        </mesh>
      ))}
    </group>
  );
}

function Plant() {
  const leaves = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (leaves.current) leaves.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.03;
  });
  return (
    <group position={[0.85, DESK_Y, -0.35]}>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#c4683f" roughness={0.9} />
      </mesh>
      <group ref={leaves} position={[0, 0.12, 0]}>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return (
            <mesh key={i} castShadow position={[Math.cos(a) * 0.03, 0.1, Math.sin(a) * 0.03]} rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]}>
              <coneGeometry args={[0.02, 0.24, 6]} />
              <meshStandardMaterial color={i % 2 ? "#3a7d44" : "#4f9d5a"} roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Cat() {
  const body = useRef<THREE.Group>(null);
  const ear = useRef<THREE.Mesh>(null);
  const [talk, setTalk] = useState<string | null>(null);
  const [awake, setAwake] = useState(false);
  const lines = () =>
    tx("miyav.|mama?|klavyeye yatacağım|bug buldum, yedim|zzz... ne?|kod review: 2/10", "meow.|food?|I'm lying on the keyboard|found a bug, ate it|zzz... what?|code review: 2/10").split("|");
  // mama kabına tıklanınca uyan ve konuş
  useEffect(() => {
    let t: number | undefined;
    const off = catFood.onFeed(({ full, fed }) => {
      sfx.purr();
      setAwake(true);
      setTalk(feedLine(full, fed));
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        setTalk(null);
        setAwake(false);
      }, 2400);
    });
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.6) * 0.04;
    if (ear.current) ear.current.rotation.z = awake ? -0.3 + Math.sin(t * 20) * 0.15 : -0.3;
  });
  const fur = "#e08a3c";
  return (
    <group
      position={[-0.7, DESK_Y, 0.08]}
      rotation-y={-0.9}
      onClick={(e) => {
        e.stopPropagation();
        sfx.meow();
        setAwake(true);
        const l = lines();
        setTalk(l[Math.floor(Math.random() * l.length)]);
        window.setTimeout(() => {
          setTalk(null);
          setAwake(false);
        }, 2200);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group ref={body}>
        <mesh castShadow position={[0, 0.06, 0]} scale={[1.35, 0.62, 1]}>
          <sphereGeometry args={[0.1, 24, 16]} />
          <meshStandardMaterial color={fur} roughness={1} />
        </mesh>
        {/* çizgiler */}
        {[-0.05, 0, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.118, 0]} scale={[0.25, 0.1, 1]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color="#b8642a" roughness={1} />
          </mesh>
        ))}
      </group>
      <group position={[0.12, 0.07, 0.05]}>
        <mesh castShadow>
          <sphereGeometry args={[0.058, 20, 16]} />
          <meshStandardMaterial color={fur} roughness={1} />
        </mesh>
        <mesh ref={ear} position={[0.005, 0.055, -0.026]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.024, 0.05, 4]} />
          <meshStandardMaterial color={fur} />
        </mesh>
        <mesh position={[0.005, 0.055, 0.026]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.024, 0.05, 4]} />
          <meshStandardMaterial color={fur} />
        </mesh>
        {/* gözler: uyurken çizgi, uyanınca nokta */}
        {[-0.018, 0.018].map((z, i) => (
          <mesh key={i} position={[0.052, 0.008, z]} scale={awake ? [1, 1, 1] : [1, 0.25, 1.4]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
        <mesh position={[0.058, -0.008, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#e07a8a" />
        </mesh>
      </group>
      <mesh castShadow position={[-0.06, 0.025, 0.08]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.08, 0.016, 8, 20, Math.PI]} />
        <meshStandardMaterial color={fur} roughness={1} />
      </mesh>
      <Html position={[0.12, 0.22, 0]} center distanceFactor={1.4} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        {talk ? <div className="bubble">{talk}</div> : <div className="zzz">z<span>z</span><span>z</span></div>}
      </Html>
    </group>
  );
}

/* ---------- radyo-teyp (kasanın üstünde): tıklayınca kamera yaklaşır, şarkılar Win98 penceresinden ---------- */
export const BOOMBOX = { pos: new THREE.Vector3(0.62, DESK_Y + 0.46, -0.16), rot: 0.3, scale: 0.75 };

function Boombox({ active, onOpen }: { active: boolean; onOpen: () => void }) {
  const { playing, track } = useYt();
  const [hover, setHover] = useState(false);
  const cover = useThumbTex(track.id);
  const cones = useRef<THREE.Group>(null);
  const reels = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    // YouTube sesine erişemiyoruz; çalarken ~120 BPM'lik nabız
    const p = playing ? Math.pow(Math.max(0, Math.sin(clock.elapsedTime * Math.PI * 2)), 10) : 0;
    cones.current?.children.forEach((c) => c.scale.setScalar(1 + p * 0.12));
    if (playing) reels.current?.children.forEach((c) => (c.rotation.z -= dt * 4));
  });
  const metal = "#b9bcc2";
  return (
    <group
      position={BOOMBOX.pos}
      rotation-y={BOOMBOX.rot}
      scale={BOOMBOX.scale}
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
      {/* gövde */}
      <Box size={[0.3, 0.15, 0.08]} position={[0, 0.075, 0]} color="#2b2d33" rough={0.5} metal={0.2} />
      <Box size={[0.3, 0.02, 0.082]} position={[0, 0.14, 0]} color={metal} rough={0.35} metal={0.6} />
      {/* sap */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <torusGeometry args={[0.09, 0.008, 8, 24, Math.PI]} />
        <meshStandardMaterial color={metal} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* hoparlörler: çalarken titrer */}
      <group ref={cones}>
        {[-0.095, 0.095].map((x) => (
          <group key={x} position={[x, 0.065, 0.041]}>
            <mesh>
              <circleGeometry args={[0.045, 32]} />
              <meshStandardMaterial color="#15161a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.001]}>
              <ringGeometry args={[0.04, 0.046, 32]} />
              <meshStandardMaterial color={metal} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.004]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshStandardMaterial color="#3a3d44" />
            </mesh>
          </group>
        ))}
      </group>
      {/* kaset penceresi: çalan şarkının albüm kapağı */}
      <mesh position={[0, 0.07, 0.0415]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshStandardMaterial map={cover} roughness={0.4} emissive="#ffffff" emissiveMap={cover} emissiveIntensity={0.3} />
      </mesh>
      <group ref={reels} position={[0, 0.035, 0.043]} visible={playing}>
        {[-0.03, 0.03].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <ringGeometry args={[0.005, 0.009, 6]} />
            <meshStandardMaterial color="#f4f1e6" />
          </mesh>
        ))}
      </group>
      {/* tuşlar */}
      <Box size={[0.03, 0.012, 0.03]} position={[-0.03, 0.155, 0.015]} color={playing ? "#e63946" : "#3ddc84"} rough={0.4} />
      <Box size={[0.03, 0.012, 0.03]} position={[0.02, 0.155, 0.015]} color="#ffd166" rough={0.4} />
      {/* ışık */}
      <mesh position={[0.13, 0.13, 0.0415]}>
        <circleGeometry args={[0.005, 12]} />
        <meshBasicMaterial color={playing ? "#ff4d4d" : "#4a1515"} toneMapped={false} />
      </mesh>
      {!active && (
        <Html position={[0, 0.3, 0]} center distanceFactor={1.4} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
          {hover || playing ? (
            <div className="prop-tip">
              {playing ? `♪ ${track.title} · ${track.artist}` : tx("Radyo-teyp", "Boombox")}
              {hover && <small>{tx("tıkla: yakınlaş ve şarkı seç", "click: zoom in and pick a song")}</small>}
            </div>
          ) : null}
        </Html>
      )}
    </group>
  );
}

function Chair() {
  return (
    <group position={[-1.35, 0, 0.75]} rotation-y={1.1}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.46, 0.07, 0.44]} />
        <meshStandardMaterial color="#2f3e46" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0.2]} rotation-x={-0.1}>
        <boxGeometry args={[0.44, 0.5, 0.06]} />
        <meshStandardMaterial color="#2f3e46" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 10]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} castShadow position={[Math.cos(a) * 0.15, 0.04, Math.sin(a) * 0.15]} rotation-y={-a}>
            <boxGeometry args={[0.3, 0.025, 0.04]} />
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Room({ playerActive, onPlayer }: { playerActive: boolean; onPlayer: () => void }) {
  return (
    <group>
      <Walls />
      <Window />
      <Posters />
      <Desk />
      <Lamp />
      <Mug />
      <Floppies />
      <Plant />
      <Cat />
      <Boombox active={playerActive} onOpen={onPlayer} />
      <FoodBowl position={[-0.52, 0.008, 0.44]} color="#e63946" />
      <Chair />
    </group>
  );
}
