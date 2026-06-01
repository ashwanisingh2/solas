"use client";
import { Float, Line, Sphere, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const planets = [
  { name: "Linux", pos: [-2.4, 0.7, 0], color: "#00FFB3", status: "Mastered" },
  { name: "Docker", pos: [-0.9, -0.8, 0.4], color: "#00E5FF", status: "Open" },
  { name: "AWS", pos: [0.9, 0.9, -0.2], color: "#00E5FF", status: "Open" },
  { name: "K8s", pos: [2.4, -0.55, 0.2], color: "#FF4D6D", status: "Locked" },
  { name: "Terraform", pos: [0.2, 1.95, 0.1], color: "#7C3AED", status: "Next" },
] as const;

function Galaxy() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.24) * 0.16;
  });
  return (
    <group ref={group}>
      {planets.map((planet, index) => (
        <Float key={planet.name} speed={1 + index * 0.12} floatIntensity={0.35}>
          <group position={planet.pos}>
            <Sphere args={[0.22 + index * 0.025, 32, 32]}>
              <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.8} roughness={0.28} metalness={0.4} />
            </Sphere>
            <Text position={[0, -0.46, 0]} fontSize={0.13} color="#ffffff" anchorX="center">
              {planet.name}
            </Text>
            <Text position={[0, -0.64, 0]} fontSize={0.08} color={planet.color} anchorX="center">
              {planet.status}
            </Text>
          </group>
        </Float>
      ))}
      {planets.slice(0, -1).map((planet, index) => (
        <Line key={planet.name} points={[planet.pos, planets[index + 1].pos]} color="#00E5FF" transparent opacity={0.32} lineWidth={1} />
      ))}
    </group>
  );
}

export function SkillGalaxyScene() {
  return (
    <div className="h-[420px] w-full">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 48 }}>
        <ambientLight intensity={1.4} />
        <pointLight position={[2, 3, 4]} intensity={3} color="#00E5FF" />
        <pointLight position={[-3, 0, 3]} intensity={2} color="#7C3AED" />
        <Stars radius={35} depth={15} count={650} factor={3} fade speed={0.55} />
        <Galaxy />
      </Canvas>
    </div>
  );
}
