"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import models from "@/content/models.json";
import type { V3 } from "./prims";

export type ModelSlug = keyof typeof models;

type Anchor = "bottom" | "center" | "top";

type ModelProps = {
  slug: ModelSlug;
  p: V3;
  r?: V3;
  /** Longest side of the model in metres, whatever units the file uses. */
  size: number;
  /** Which point of the bounding box sits at `p`: bottom for things on shelves, top for things hanging. */
  anchor?: Anchor;
  /** Recolor: light and mid tones shift to this color, darks (soles, logos, seams) are kept. */
  tint?: string;
  /** 0–1, how strongly the tint replaces the original color. */
  tintAmount?: number;
  /** Luminance below which pixels keep their original color. */
  tintFloor?: number;
  mirror?: boolean;
};

const fileOf = (slug: ModelSlug) => (models[slug] as { file: string }).file;

/**
 * Tint by luminance instead of multiplying the color: a scanned texture keeps its
 * stitching, creases and shading, only the hue changes.
 */
function tinted(src: THREE.Material, tint: THREE.Color, amount: number, floor: number) {
  const m = src.clone();
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTint = { value: tint };
    shader.uniforms.uTintAmt = { value: amount };
    shader.uniforms.uTintFloor = { value: floor };
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uTint;\nuniform float uTintAmt;\nuniform float uTintFloor;\nvoid main() {")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        {
          float l = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          float mask = smoothstep(uTintFloor, uTintFloor + 0.08, l) * uTintAmt;
          vec3 recolored = uTint * clamp(l * 2.2, 0.0, 1.4);
          diffuseColor.rgb = mix(diffuseColor.rgb, recolored, mask);
        }`,
      );
  };
  m.customProgramCacheKey = () => `tint:${tint.getHexString()}:${amount}:${floor}`;
  return m;
}

export function Model({ slug, p, r, size, anchor = "bottom", tint, tintAmount = 1, tintFloor = 0.04, mirror }: ModelProps) {
  const { scene } = useGLTF(fileOf(slug));

  const { object, scale, offset } = useMemo(() => {
    const object = scene.clone(true);
    const tintColor = tint ? new THREE.Color(tint) : null;
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (tintColor) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((mm) => tinted(mm, tintColor, tintAmount, tintFloor))
          : tinted(mesh.material, tintColor, tintAmount, tintFloor);
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    const dim = box.getSize(new THREE.Vector3());
    const scale = size / Math.max(dim.x, dim.y, dim.z, 1e-6);
    const c = box.getCenter(new THREE.Vector3());
    const y = anchor === "bottom" ? box.min.y : anchor === "top" ? box.max.y : c.y;
    return { object, scale, offset: [-c.x, -y, -c.z] as V3 };
  }, [scene, size, anchor, tint, tintAmount, tintFloor]);

  return (
    <group position={p} rotation={r}>
      <group scale={[mirror ? -scale : scale, scale, scale]}>
        <primitive object={object} position={offset} />
      </group>
    </group>
  );
}

/** Start fetching every imported model as soon as the scene module loads. */
for (const slug of Object.keys(models) as ModelSlug[]) useGLTF.preload(fileOf(slug));
