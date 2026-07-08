"use client";

/**
 * GarmentViewer3D — rotating 3D merch on a dark chrome stage.
 *
 * Procedural garment meshes (no GLB files to host) with the KillsComfort
 * logo applied as a curved decal. Black garments get the raw chrome logo,
 * white garments get the dark-outlined variant so it stays legible.
 *
 * Deps: three @react-three/fiber @react-three/drei
 */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Decal,
  useTexture,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import type { MerchColor, MerchSlug } from "@/config/merch.config";

const FABRIC = {
  black: "#141416",
  white: "#f1f0ec",
} as const;

function logoUrl(color: MerchColor) {
  return color === "white" ? "/merch/logo-chrome-outline.png" : "/merch/logo-chrome.png";
}

function fabricMaterialProps(color: MerchColor) {
  return {
    color: FABRIC[color],
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.6,
    sheenColor: color === "black" ? "#2a2a30" : "#ffffff",
  };
}

/** Slightly irregular cylinder = soft fabric silhouette instead of hard geometry */
function useClothCylinder(
  rTop: number,
  rBottom: number,
  height: number,
  flatten = 0.62,
  wobble = 0.02
) {
  return useMemo(() => {
    const geo = new THREE.CylinderGeometry(rTop, rBottom, height, 48, 24, true);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const noise =
        Math.sin(v.y * 9 + v.x * 5) * wobble + Math.cos(v.x * 11 + v.y * 3) * wobble * 0.6;
      const len = Math.hypot(v.x, v.z) || 1;
      pos.setX(i, v.x + (v.x / len) * noise);
      pos.setZ(i, (v.z + (v.z / len) * noise) * flatten); // flatten front-to-back
    }
    geo.computeVertexNormals();
    return geo;
  }, [rTop, rBottom, height, flatten, wobble]);
}

function LogoDecal({
  color,
  position,
  scale,
  back = false,
}: {
  color: MerchColor;
  position: [number, number, number];
  scale: [number, number, number];
  back?: boolean;
}) {
  const texture = useTexture(logoUrl(color));
  texture.anisotropy = 8;
  return (
    <Decal
      position={position}
      rotation={[0, back ? Math.PI : 0, 0]}
      scale={scale}
      map={texture}
      polygonOffsetFactor={-4}
    />
  );
}

// ---------------------------------------------------------------------------
// Garments
// ---------------------------------------------------------------------------

function CropTop({ color }: { color: MerchColor }) {
  const torso = useClothCylinder(0.62, 0.58, 1.05);
  const sleeve = useClothCylinder(0.19, 0.22, 0.42, 1, 0.015);
  const mat = fabricMaterialProps(color);
  return (
    <group position={[0, 0.25, 0]}>
      <mesh geometry={torso}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
        <LogoDecal color={color} position={[0, 0.02, 0.38]} scale={[0.95, 0.62, 0.6]} />
      </mesh>
      {/* hem band */}
      <mesh position={[0, -0.53, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.62, 1]}>
        <torusGeometry args={[0.585, 0.035, 12, 48]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* collar */}
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.62, 0.42, 1]}>
        <torusGeometry args={[0.42, 0.04, 12, 48]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* sleeves */}
      <mesh geometry={sleeve} position={[-0.72, 0.32, 0]} rotation={[0, 0, 0.9]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={sleeve} position={[0.72, 0.32, 0]} rotation={[0, 0, -0.9]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function BootyShorts({ color }: { color: MerchColor }) {
  const hips = useClothCylinder(0.55, 0.62, 0.55, 0.72);
  const leg = useClothCylinder(0.3, 0.32, 0.3, 0.8, 0.015);
  const mat = fabricMaterialProps(color);
  return (
    <group position={[0, 0.15, 0]}>
      <mesh geometry={hips}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
        {/* logo on BACK */}
        <LogoDecal color={color} position={[0, -0.02, -0.36]} scale={[0.8, 0.5, 0.6]} back />
      </mesh>
      {/* waistband */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]}>
        <torusGeometry args={[0.55, 0.045, 12, 48]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* legs */}
      <mesh geometry={leg} position={[-0.28, -0.38, 0]} rotation={[0, 0, 0.12]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={leg} position={[0.28, -0.38, 0]} rotation={[0, 0, -0.12]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Sweatpants({ color }: { color: MerchColor }) {
  const hips = useClothCylinder(0.52, 0.58, 0.5, 0.72);
  const leg = useClothCylinder(0.26, 0.17, 1.35, 0.9, 0.02);
  const mat = fabricMaterialProps(color);
  return (
    <group position={[0, 0.7, 0]}>
      <mesh geometry={hips}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
        {/* logo on FRONT of hip/thigh */}
        <LogoDecal color={color} position={[0, -0.05, 0.34]} scale={[0.72, 0.46, 0.6]} />
      </mesh>
      {/* drawstring waistband */}
      <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]}>
        <torusGeometry args={[0.52, 0.05, 12, 48]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* legs */}
      <mesh geometry={leg} position={[-0.27, -0.85, 0]} rotation={[0, 0, 0.05]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={leg} position={[0.27, -0.85, 0]} rotation={[0, 0, -0.05]}>
        <meshPhysicalMaterial {...mat} side={THREE.DoubleSide} />
      </mesh>
      {/* cuffs */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.9, 1]}>
          <torusGeometry args={[0.165, 0.035, 10, 40]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

function Garment({ slug, color }: { slug: MerchSlug; color: MerchColor }) {
  const group = useRef<THREE.Group>(null);
  // gentle idle float
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.03;
  });
  return (
    <group ref={group}>
      {slug === "crop-top" && <CropTop color={color} />}
      {slug === "booty-shorts" && <BootyShorts color={color} />}
      {slug === "sweatpants" && <Sweatpants color={color} />}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Viewer
// ---------------------------------------------------------------------------

export default function GarmentViewer3D({
  slug,
  color,
  className,
}: {
  slug: MerchSlug;
  color: MerchColor;
  className?: string;
}) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className} style={{ touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 0.4, 3.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          {/* cold steel key + rim — matches the chrome logo language */}
          <directionalLight position={[3, 4, 2]} intensity={1.1} color="#dfe6f2" />
          <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#8fa3c4" />
          <Garment slug={slug} color={color} />
          <ContactShadows position={[0, -1.35, 0]} opacity={0.55} scale={7} blur={2.6} far={2.5} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!reducedMotion}
            autoRotateSpeed={2.2}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
