import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { DESK_Y } from "./Room";
import { keyboardTex, labelTex, stickyTex } from "./textures";
import { RetroOS } from "../os/RetroOS";
import { sfx } from "../sfx";
import { useLang } from "../i18n";

// Ekranın dünya koordinatları — kamera bunlara göre yakınlaşıyor.
export const SCREEN = {
  pos: new THREE.Vector3(0, 1.1, 0.0815),
  w: 0.48,
  h: 0.36,
};
// DOM ekranı 1024x768 px; drei Html transform'da 1 birim = 40px.
const DOM_W = 1024;
const DOM_H = 768;
const HTML_SCALE = SCREEN.w / (DOM_W / 40);

const BEIGE = "#cbc1a6";
const BEIGE_DARK = "#b3a88b";

function Monitor({ zoomed, onZoom }: { zoomed: boolean; onZoom: () => void }) {
  const [hover, setHover] = useState(false);
  const label = useMemo(() => labelTex("Makara"), []);
  const lang = useLang();
  const sticky = useMemo(() => stickyTex(lang === "en" ? ["password:", "1234", "(secret)"] : ["şifre:", "1234", "(gizli)"]), [lang]);
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 0.35 + Math.sin(clock.elapsedTime * 60) * 0.02;
  });

  return (
    <group>
      {/* ayak */}
      <mesh castShadow position={[0, DESK_Y + 0.02, -0.18]}>
        <cylinderGeometry args={[0.16, 0.19, 0.04, 32]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, DESK_Y + 0.055, -0.18]}>
        <boxGeometry args={[0.14, 0.04, 0.14]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.6} />
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
        {/* tüp gövdesi (arkaya doğru daralan) */}
        <mesh castShadow position={[0, 1.08, -0.24]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.2, 0.28, 0.38, 4, 1]} />
          <meshStandardMaterial color={BEIGE_DARK} roughness={0.6} />
        </mesh>
        {/* ön kasa */}
        <mesh castShadow receiveShadow position={[0, 1.08, -0.02]}>
          <boxGeometry args={[0.62, 0.52, 0.2]} />
          <meshStandardMaterial
            color={BEIGE}
            roughness={0.55}
            emissive="#7af0ff"
            emissiveIntensity={hover && !zoomed ? 0.08 : 0}
          />
        </mesh>
        {/* ekran çevresi koyu iç çerçeve */}
        <mesh position={[0, SCREEN.pos.y, 0.0805]}>
          <planeGeometry args={[SCREEN.w + 0.03, SCREEN.h + 0.03]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
        </mesh>
        {/* marka etiketi */}
        <mesh position={[-0.2, 0.865, 0.081]}>
          <planeGeometry args={[0.1, 0.025]} />
          <meshStandardMaterial map={label} />
        </mesh>
        {/* düğmeler */}
        <mesh position={[0.24, 0.865, 0.085]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
          <meshStandardMaterial color="#9e957c" />
        </mesh>
        <mesh position={[0.205, 0.865, 0.083]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshStandardMaterial color="#5cff7a" emissive="#5cff7a" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        {/* post-it */}
        <mesh position={[0.29, 0.97, 0.082]} rotation-z={-0.12}>
          <planeGeometry args={[0.07, 0.07]} />
          <meshStandardMaterial map={sticky} roughness={0.9} />
        </mesh>
      </group>

      {/* ekranın yaydığı ışık */}
      <pointLight ref={glow} position={[0, 1.1, 0.35]} distance={1.6} decay={2} color="#8fd8ff" />

      {/* gerçek DOM ekran */}
      <group position={SCREEN.pos} scale={HTML_SCALE}>
        <Html
          transform
          occlude={false}
          zIndexRange={[5, 0]}
          pointerEvents={zoomed ? "auto" : "none"}
          style={{ width: DOM_W, height: DOM_H }}
        >
          <RetroOS active={zoomed} />
        </Html>
      </group>

      <Duck />
    </group>
  );
}

function Duck() {
  const g = useRef<THREE.Group>(null);
  const squish = useRef(0);
  useFrame((_, dt) => {
    squish.current = Math.max(0, squish.current - dt * 4);
    if (g.current) {
      const s = 1 - Math.sin(squish.current * Math.PI) * 0.25;
      g.current.scale.set(1 + (1 - s) * 0.5, s, 1 + (1 - s) * 0.5);
    }
  });
  return (
    <group
      ref={g}
      position={[0.16, 1.34, -0.08]}
      rotation-y={-0.6}
      onClick={(e) => {
        e.stopPropagation();
        squish.current = 1;
        sfx.beep();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <mesh castShadow position={[0, 0.035, 0]} scale={[1.3, 0.9, 1]}>
        <sphereGeometry args={[0.04, 20, 16]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.035, 0.085, 0]}>
        <sphereGeometry args={[0.027, 20, 16]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.35} />
      </mesh>
      <mesh position={[0.065, 0.08, 0]} rotation-z={-Math.PI / 2} scale={[1, 1, 0.6]}>
        <coneGeometry args={[0.012, 0.025, 12]} />
        <meshStandardMaterial color="#f77f00" roughness={0.4} />
      </mesh>
      {[-0.012, 0.012].map((z, i) => (
        <mesh key={i} position={[0.055, 0.095, z]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[-0.05, 0.05, 0]} rotation-z={0.6}>
        <coneGeometry args={[0.015, 0.03, 8]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Tower() {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (led.current) led.current.emissiveIntensity = Math.random() < 0.15 + Math.sin(clock.elapsedTime) * 0.1 ? 4 : 0.3;
  });
  return (
    <group position={[0.62, DESK_Y, -0.2]}>
      <mesh castShadow receiveShadow position={[0, 0.23, 0]}>
        <boxGeometry args={[0.2, 0.46, 0.44]} />
        <meshStandardMaterial color={BEIGE} roughness={0.6} />
      </mesh>
      {/* disket yuvası */}
      <mesh position={[0, 0.36, 0.221]}>
        <planeGeometry args={[0.12, 0.012]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 0.3, 0.221]}>
        <planeGeometry args={[0.15, 0.04]} />
        <meshStandardMaterial color={BEIGE_DARK} />
      </mesh>
      {/* havalandırma */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.08 + i * 0.02, 0.221]}>
          <planeGeometry args={[0.12, 0.006]} />
          <meshStandardMaterial color="#a39a80" />
        </mesh>
      ))}
      <mesh position={[0.05, 0.2, 0.222]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#9e957c" />
      </mesh>
      <mesh position={[-0.05, 0.2, 0.222]}>
        <circleGeometry args={[0.005, 12]} />
        <meshStandardMaterial ref={led} color="#ffae00" emissive="#ffae00" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Keyboard() {
  const tex = useMemo(keyboardTex, []);
  return (
    <group position={[0, DESK_Y, 0.2]} rotation-x={0.06}>
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.48, 0.025, 0.17]} />
        <meshStandardMaterial attach="material-0" color={BEIGE_DARK} />
        <meshStandardMaterial attach="material-1" color={BEIGE_DARK} />
        <meshStandardMaterial attach="material-2" map={tex} roughness={0.7} />
        <meshStandardMaterial attach="material-3" color={BEIGE_DARK} />
        <meshStandardMaterial attach="material-4" color={BEIGE_DARK} />
        <meshStandardMaterial attach="material-5" color={BEIGE_DARK} />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    <group position={[0.36, DESK_Y, 0.2]}>
      <mesh receiveShadow position={[0, 0.002, 0]}>
        <boxGeometry args={[0.2, 0.004, 0.17]} />
        <meshStandardMaterial color="#3d348b" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 0.018, 0.01]} scale={[0.6, 0.35, 1]}>
        <sphereGeometry args={[0.05, 20, 16]} />
        <meshStandardMaterial color={BEIGE} roughness={0.5} />
      </mesh>
      {/* kablo */}
      <mesh position={[0, 0.006, -0.12]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.003, 0.003, 0.18, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
}

export function Computer({ zoomed, onZoom }: { zoomed: boolean; onZoom: () => void }) {
  return (
    <group>
      <Monitor zoomed={zoomed} onZoom={onZoom} />
      <Tower />
      <Keyboard />
      <Mouse />
    </group>
  );
}
