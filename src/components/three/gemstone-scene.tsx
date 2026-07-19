"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { getConsoleFunction, setConsoleFunction } from "three";
import type { Mesh } from "three";

const threeConsole = getConsoleFunction();

setConsoleFunction((type, message, ...args) => {
  if (type === "warn" && typeof message === "string" && message.startsWith("THREE.Clock:")) {
    return;
  }

  if (typeof threeConsole === "function") {
    threeConsole(type, message, ...args);
    return;
  }

  const fallback =
    type === "error" ? console.error : type === "warn" ? console.warn : console.log;
  fallback(message, ...args);
});

function Gemstone() {
  const meshRef = useRef<Mesh>(null);
  const geometryArgs = useMemo(() => [0.85, 1] as const, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.12;
    meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.12) * 0.06;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={geometryArgs} />
      <meshPhysicalMaterial
        color="#d8cfbe"
        roughness={0.12}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.08}
        reflectivity={1}
        iridescence={0.24}
        iridescenceIOR={1.25}
        sheen={0.2}
      />
    </mesh>
  );
}

export function GemstoneScene() {
  return (
    <div className="stone-glow h-[320px] w-full overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,#1b1d1d_0%,#0f1010_100%)] md:h-[520px]">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.75} color="#f4eee5" />
        <directionalLight position={[3, 4, 4]} intensity={2.2} color="#f7e5c7" />
        <pointLight position={[-3, -2, -1]} intensity={1.1} color="#a6b3cb" />
        <pointLight position={[0, 2, 2]} intensity={0.7} color="#ffffff" />
        <Suspense fallback={null}>
          <Gemstone />
        </Suspense>
      </Canvas>
    </div>
  );
}
