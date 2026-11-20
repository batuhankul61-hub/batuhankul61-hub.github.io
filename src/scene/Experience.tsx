import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Room, BOOMBOX } from "./Room";
import { Computer, SCREEN } from "./Computer";

export type Phase = "boot" | "room" | "screen" | "player";

const ROOM_POS = new THREE.Vector3(1.45, 1.55, 2.45);
const ROOM_LOOK = new THREE.Vector3(-0.05, 1.0, -0.15);
const START_POS = new THREE.Vector3(3.6, 2.6, 5.8);

function CameraRig({ phase }: { phase: Phase }) {
  const { camera, size, pointer } = useThree();
  const look = useRef(ROOM_LOOK.clone());
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.copy(START_POS);
    camera.lookAt(ROOM_LOOK);
  }, [camera]);

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const p = tmpPos.current;
    const l = tmpLook.current;
    if (phase === "screen") {
      // ekranı görüş alanına sığdıracak mesafe
      const vFov = THREE.MathUtils.degToRad(cam.fov);
      const aspect = size.width / size.height;
      const fill = 0.94;
      const dH = SCREEN.h / fill / (2 * Math.tan(vFov / 2));
      const dW = SCREEN.w / fill / (2 * Math.tan(vFov / 2) * aspect);
      const d = Math.max(dH, dW);
      p.set(SCREEN.pos.x, SCREEN.pos.y, SCREEN.pos.z + d);
      l.copy(SCREEN.pos);
    } else if (phase === "player") {
      // radyo-teype yakınlaş; geniş ekranda sağda pencere var, cihaz solda kalsın
      const aspect = size.width / size.height;
      const wide = aspect > 1.1;
      const face = new THREE.Vector3(Math.sin(BOOMBOX.rot), 0, Math.cos(BOOMBOX.rot));
      const right = new THREE.Vector3(Math.cos(BOOMBOX.rot), 0, -Math.sin(BOOMBOX.rot));
      const c = BOOMBOX.pos.clone();
      c.y += 0.08 * BOOMBOX.scale;
      l.copy(c);
      if (wide) l.addScaledVector(right, 0.15);
      else l.y -= 0.16;
      p.copy(c).addScaledVector(face, wide ? 0.66 : 1.0).addScaledVector(right, wide ? 0.15 : 0);
      p.y += wide ? 0.1 : 0.18;
    } else if (phase === "room") {
      // dar/dikey ekranlarda biraz geri çekil
      const aspect = size.width / size.height;
      const back = THREE.MathUtils.clamp(1.35 / aspect, 0.85, 1.9);
      p.copy(ROOM_POS).sub(ROOM_LOOK).multiplyScalar(back).add(ROOM_LOOK);
      p.x += pointer.x * 0.35;
      p.y += pointer.y * 0.18;
      l.copy(ROOM_LOOK);
    } else {
      p.copy(START_POS);
      l.copy(ROOM_LOOK);
    }
    const k = 1 - Math.exp(-dt * (phase === "screen" || phase === "player" ? 3.2 : 1.8));
    cam.position.lerp(p, k);
    look.current.lerp(l, k);
    cam.lookAt(look.current);
  });
  return null;
}

export function Experience({ phase, onZoom, onPlayer }: { phase: Phase; onZoom: () => void; onPlayer: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.01, far: 40, position: START_POS.toArray() }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <color attach="background" args={["#0b0d1a"]} />
      <fog attach="fog" args={["#0b0d1a", 6, 14]} />
      <ambientLight intensity={0.35} color="#7c8fc7" />
      <hemisphereLight args={["#8fa3ff", "#3a2412", 0.35]} />
      {/* pencereden ay ışığı */}
      <directionalLight position={[-4, 3, 1.2]} intensity={0.6} color="#8aa2ff" castShadow shadow-mapSize={[1024, 1024]} />
      {/* odayı dolduran sıcak tavan ışığı */}
      <pointLight position={[0.5, 2.8, 1.5]} intensity={2.2} distance={6} decay={1.2} color="#ffb98a" />
      <CameraRig phase={phase} />
      <Room playerActive={phase === "player"} onPlayer={onPlayer} />
      <Computer zoomed={phase === "screen"} onZoom={onZoom} />
    </Canvas>
  );
}
