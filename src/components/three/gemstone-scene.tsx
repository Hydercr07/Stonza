"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Mesh } from "three";

function Gemstone() {
  const meshRef = useRef<Mesh>(null);
  const geometryArgs = useMemo(() => [0.85, 1] as const, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.28}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={geometryArgs} />
        <MeshTransmissionMaterial
          thickness={1.2}
          roughness={0.18}
          anisotropy={0.2}
          chromaticAberration={0.02}
          distortion={0.2}
          distortionScale={0.15}
          transmission={1}
          ior={1.4}
          color="#d4cab7"
          backside
        />
      </mesh>
    </Float>
  );
}

export function GemstoneScene() {
  return (
    <div className="stone-glow h-[320px] w-full overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,#1b1d1d_0%,#0f1010_100%)] md:h-[520px]">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} color="#f7e5c7" />
        <pointLight position={[-3, -2, -1]} intensity={1.6} color="#99a0b8" />
        <Suspense fallback={null}>
          <Gemstone />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.55} />
      </Canvas>
    </div>
  );
}
