import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FloatingCard = ({ position, color, scale, speed, rotSpeed }: { position: [number, number, number]; color: string; scale: number; speed: number; rotSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * rotSpeed * 0.5) * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * rotSpeed * 0.3;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * rotSpeed * 0.4) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1.2, 0.05]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
};

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#7c3aed" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const cards = [
  { position: [-2.5, 1.2, -1] as [number, number, number], color: "#7c3aed", scale: 0.6, speed: 0.8, rotSpeed: 0.4 },
  { position: [-1.2, 0.5, 0] as [number, number, number], color: "#a855f7", scale: 0.75, speed: 1.0, rotSpeed: 0.5 },
  { position: [0, 1.5, -0.5] as [number, number, number], color: "#6d28d9", scale: 0.5, speed: 0.9, rotSpeed: 0.6 },
  { position: [0.5, -0.2, 0.5] as [number, number, number], color: "#c084fc", scale: 0.65, speed: 1.1, rotSpeed: 0.35 },
  { position: [1.8, 0.8, -0.3] as [number, number, number], color: "#8b5cf6", scale: 0.7, speed: 0.7, rotSpeed: 0.45 },
  { position: [2.8, 0, 0.2] as [number, number, number], color: "#a78bfa", scale: 0.55, speed: 1.2, rotSpeed: 0.55 },
  { position: [-0.8, -1, 0.3] as [number, number, number], color: "#9333ea", scale: 0.5, speed: 0.85, rotSpeed: 0.5 },
  { position: [1, -0.8, -0.8] as [number, number, number], color: "#d8b4fe", scale: 0.45, speed: 1.05, rotSpeed: 0.6 },
];

const ThreeScene = () => {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#7c3aed" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a78bfa" />
        {cards.map((card, i) => (
          <FloatingCard key={i} {...card} />
        ))}
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
