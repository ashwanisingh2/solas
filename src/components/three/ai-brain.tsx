"use client";
import { Float, Line, OrbitControls, Sphere, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function NeuralBrain() {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    return Array.from({ length: 52 }, (_, index) => {
      const angle = index * 0.72;
      const radius = 1.1 + Math.sin(index) * 0.35;
      return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(index * 1.7) * 0.8, Math.sin(angle) * radius);
    });
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.12;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.65}>
      <group ref={group}>
        {points.map((point, index) => (
          <Sphere key={index} position={point} args={[0.045, 16, 16]}>
            <meshStandardMaterial color={index % 3 === 0 ? "#00FFB3" : "#00E5FF"} emissive="#00E5FF" emissiveIntensity={1.2} />
          </Sphere>
        ))}
        {points.slice(0, 36).map((point, index) => {
          const next = points[(index * 7) % points.length];
          return <Line key={`line-${index}`} points={[point, next]} color="#7C3AED" transparent opacity={0.45} lineWidth={1} />;
        })}
        <Sphere args={[0.82, 48, 48]}>
          <meshStandardMaterial color="#10152f" emissive="#7C3AED" emissiveIntensity={0.35} roughness={0.22} metalness={0.65} transparent opacity={0.42} />
        </Sphere>
      </group>
    </Float>
  );
}

export function AiBrainScene() {
  return (
    <div className="h-[360px] w-full md:h-[520px]">
      <Canvas camera={{ position: [0, 0, 4.8], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[3, 2, 4]} intensity={3} color="#00E5FF" />
        <pointLight position={[-3, -2, 2]} intensity={2} color="#7C3AED" />
        <Stars radius={40} depth={18} count={900} factor={3} fade speed={0.45} />
        <NeuralBrain />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
    </div>
  );
}
