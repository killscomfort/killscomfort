"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Scroll,
  ScrollControls,
  useScroll,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { SITE } from "@/lib/constants";

function LogoPlaque() {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const texture = useTexture("/logo-chrome.png");

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useFrame(() => {
    if (!group.current) return;
    const t = scroll.offset;

    group.current.rotation.y = THREE.MathUtils.lerp(-0.55, Math.PI * 1.65, t);
    group.current.rotation.x = THREE.MathUtils.lerp(0.12, -0.35, t);
    group.current.position.y = THREE.MathUtils.lerp(0.4, -0.15, t);
    group.current.position.z = THREE.MathUtils.lerp(-1.2, 1.8, t);
    group.current.scale.setScalar(THREE.MathUtils.lerp(1.35, 0.55, t));
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[3.2, 2.15, 0.12]} />
        <meshStandardMaterial
          color="#101012"
          metalness={0.85}
          roughness={0.28}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[2.85, 1.9]} />
        <meshStandardMaterial
          map={texture}
          transparent
          metalness={0.55}
          roughness={0.22}
          envMapIntensity={1.4}
        />
      </mesh>
    </group>
  );
}

function VinylDisc() {
  const mesh = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const t = scroll.offset;
    mesh.current.rotation.z += delta * (0.35 + t * 1.4);
    mesh.current.position.x = THREE.MathUtils.lerp(2.6, -2.2, t);
    mesh.current.position.y = THREE.MathUtils.lerp(-1.1, 0.9, t);
    mesh.current.position.z = THREE.MathUtils.lerp(-2.4, 0.4, t);
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(0.7, 1.35, t));
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh ref={mesh} rotation={[Math.PI / 2.4, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.05, 64]} />
        <meshStandardMaterial
          color="#1a1a1c"
          metalness={0.7}
          roughness={0.35}
          envMapIntensity={0.9}
        />
      </mesh>
    </Float>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial
        color="#070708"
        metalness={0.4}
        roughness={0.85}
        envMapIntensity={0.35}
      />
    </mesh>
  );
}

function SceneRig() {
  const scroll = useScroll();

  useFrame(({ camera }) => {
    const t = scroll.offset;
    camera.position.x = THREE.MathUtils.lerp(0, 0.55, t);
    camera.position.y = THREE.MathUtils.lerp(0.35, 0.05, t);
    camera.position.z = THREE.MathUtils.lerp(6.2, 3.4, t);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 6, 16]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.35}
        color="#f2f2f5"
      />
      <pointLight position={[-3, 2, 2]} intensity={0.55} color="#8ecae6" />
      <Ground />
      <Suspense fallback={null}>
        <LogoPlaque />
      </Suspense>
      <VinylDisc />
      <Environment preset="city" environmentIntensity={0.45} />
    </>
  );
}

function OverlayCopy() {
  return (
    <Scroll html style={{ width: "100%" }}>
      <section className="flex h-[100dvh] w-screen flex-col justify-end px-6 pb-20 sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
          KillsComfort · Miami
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-pt-serif)] text-5xl font-bold leading-[0.95] text-white sm:text-7xl">
          Kill comfort.
          <br />
          <span className="text-white/55">Find the signal.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
          Scroll through the brand — music, movement, and the warehouse waiting
          on the other side.
        </p>
      </section>

      <section className="flex h-[100dvh] w-screen flex-col justify-center px-6 sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
          01 · Music
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-pt-serif)] text-4xl font-bold text-white sm:text-5xl">
          Built in the trenches. Played for the room.
        </h2>
        <p className="mt-4 max-w-md text-white/55">
          Originals, remixes, and sets shaped by Miami heat — SAE-trained
          engineering with street grit.
        </p>
        <Link
          href="/music"
          className="mt-8 inline-flex w-fit border border-white/25 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          Hear the work
        </Link>
      </section>

      <section className="flex h-[100dvh] w-screen flex-col justify-center px-6 sm:px-10 md:items-end md:text-right">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
          02 · Movement
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-pt-serif)] text-4xl font-bold text-white sm:text-5xl">
          Wear the refusal.
        </h2>
        <p className="mt-4 max-w-md text-white/55 md:ml-auto">
          Chrome on black. Comfort killed where it counts — shorts, crops,
          sweats printed on demand.
        </p>
        <Link
          href="/merch"
          className="mt-8 inline-flex w-fit border border-white/25 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          Shop merch
        </Link>
      </section>

      <section className="flex h-[100dvh] w-screen flex-col justify-center px-6 sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
          03 · Enter
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-pt-serif)] text-4xl font-bold text-white sm:text-6xl">
          Growth lives on the other side.
        </h2>
        <p className="mt-4 max-w-lg text-white/55">
          {SITE.tagline}. Book a set, or step into the warehouse ride.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="inline-flex bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
          >
            Book Me
          </Link>
          <Link
            href="/warehouse"
            className="inline-flex border border-white/30 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:border-white"
          >
            Enter the warehouse
          </Link>
          <Link
            href="/"
            className="inline-flex px-4 py-3.5 text-xs uppercase tracking-[0.2em] text-white/45 transition hover:text-white"
          >
            Main site →
          </Link>
        </div>
      </section>
    </Scroll>
  );
}

function ReducedMotionFallback() {
  return (
    <main className="min-h-screen bg-[#050506] px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
          KillsComfort · Miami
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-pt-serif)] text-5xl font-bold">
          Kill comfort. Find the signal.
        </h1>
        <p className="mt-5 text-white/55">{SITE.tagline}.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/music"
            className="border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.25em]"
          >
            Music
          </Link>
          <Link
            href="/merch"
            className="border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.25em]"
          >
            Merch
          </Link>
          <Link
            href="/book"
            className="bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black"
          >
            Book Me
          </Link>
          <Link
            href="/warehouse"
            className="border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.25em]"
          >
            Enter the warehouse
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ScrollLandExperience() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduced) return <ReducedMotionFallback />;

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#050506]">
      <div className="pointer-events-none absolute left-6 top-6 z-20 sm:left-10">
        <Link
          href="/site"
          className="pointer-events-auto text-[11px] uppercase tracking-[0.35em] text-white/40 transition hover:text-white"
        >
          {SITE.name}
        </Link>
      </div>

      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, 6.2], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <ScrollControls pages={4} damping={0.18}>
          <SceneRig />
          <OverlayCopy />
        </ScrollControls>
      </Canvas>

      <p className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/35">
        Scroll
      </p>
    </div>
  );
}
