import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --------------------------------------------------------------------------
// GLOW TEXTURE GENERATOR
// --------------------------------------------------------------------------
const createGlowTexture = (size = 256, color = "#a855f7", intensity = 3.0) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  
  const colorObj = new THREE.Color(color);
  const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  gradient.addColorStop(0.3, `rgba(255, 255, 255, ${intensity * 0.9})`);
  gradient.addColorStop(0.6, `rgba(${colorObj.r * 255}, ${colorObj.g * 255}, ${colorObj.b * 255}, ${intensity * 0.7})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// --------------------------------------------------------------------------
// EASING FUNCTIONS
// --------------------------------------------------------------------------
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutElastic = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// --------------------------------------------------------------------------
// REFINED MORPHING PARTICLE SYSTEM
// --------------------------------------------------------------------------
const MorphingCore = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 8000; 

  const { chaosPos, spherePos, wavePos, colors, baseSizes } = useMemo(() => {
    const cPos = new Float32Array(particleCount * 3);
    const sPos = new Float32Array(particleCount * 3);
    const wPos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    
    const colorPalette = [
      new THREE.Color("#a855f7"),
      new THREE.Color("#3b82f6"),
      new THREE.Color("#e879f9"),
      new THREE.Color("#ffffff"),
    ];

    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // 1. CHAOS
      const cRadius = Math.random() * 20;
      const cAngle = Math.random() * Math.PI * 2;
      cPos[i3] = Math.cos(cAngle) * cRadius;
      cPos[i3 + 1] = (Math.random() - 0.5) * 30;
      cPos[i3 + 2] = Math.sin(cAngle) * cRadius;

      // 2. SPHERE
      const y = 1 - (i / (particleCount - 1)) * 2;
      const sRadius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const sphereScale = 4.5;
      sPos[i3] = Math.cos(theta) * sRadius * sphereScale;
      sPos[i3 + 1] = y * sphereScale;
      sPos[i3 + 2] = Math.sin(theta) * sRadius * sphereScale;

      // 3. WAVE
      wPos[i3] = (Math.random() - 0.5) * 60;
      wPos[i3 + 1] = 0; 
      wPos[i3 + 2] = (Math.random() - 0.5) * 60;

      const isHotspot = Math.random() > 0.95;
      const mixedColor = isHotspot ? colorPalette[3] : colorPalette[Math.floor(Math.random() * 3)];
      cols[i3] = mixedColor.r;
      cols[i3 + 1] = mixedColor.g;
      cols[i3 + 2] = mixedColor.b;

      sz[i] = isHotspot ? 1.2 : 0.6 + Math.random() * 0.8;
    }

    return { chaosPos: cPos, spherePos: sPos, wavePos: wPos, colors: cols, baseSizes: sz };
  }, []);

  const glowTexture = useMemo(() => createGlowTexture(256, "#a855f7", 3.0), []);
  const currentPos = useMemo(() => new Float32Array(particleCount * 3), []);
  const currentSizes = useMemo(() => new Float32Array(particleCount), []);

  useFrame((state) => {
    if (!pointsRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Animation Timings
    let stage1Progress = THREE.MathUtils.clamp((t - 1.5) / 2.0, 0, 1);
    let ease1 = easeOutElastic(stage1Progress);

    let stage2Progress = THREE.MathUtils.clamp((t - 5.0) / 2.5, 0, 1);
    let ease2 = easeInOutCubic(stage2Progress);

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      const cx = chaosPos[i3];
      const cy = chaosPos[i3 + 1] + Math.sin(t * 2 + cx) * 2;
      const cz = chaosPos[i3 + 2];

      const breathing = 1 + Math.sin(t * 2 + spherePos[i3 + 1]) * 0.05;
      const sx = spherePos[i3] * breathing;
      const sy = spherePos[i3 + 1] * breathing;
      const sz = spherePos[i3 + 2] * breathing;

      const wx = wavePos[i3];
      const wz = wavePos[i3 + 2];
      const wy = Math.sin(wx * 0.15 + t * 0.8) * Math.cos(wz * 0.15 + t * 0.6) * 2.5 - 2;

      // Smooth interpolation between all 3 states
      const tempX = THREE.MathUtils.lerp(cx, sx, ease1);
      const finalX = THREE.MathUtils.lerp(tempX, wx, ease2);

      const tempY = THREE.MathUtils.lerp(cy, sy, ease1);
      const finalY = THREE.MathUtils.lerp(tempY, wy, ease2);

      const tempZ = THREE.MathUtils.lerp(cz, sz, ease1);
      const finalZ = THREE.MathUtils.lerp(tempZ, wz, ease2);

      positions[i3] = finalX;
      positions[i3 + 1] = finalY;
      positions[i3 + 2] = finalZ;

      sizes[i] = THREE.MathUtils.lerp(baseSizes[i], baseSizes[i] * 0.85, ease2);
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;

    // Interaction rotation
    const targetRotX = (state.pointer.y * Math.PI) / 8;
    const targetRotY = (state.pointer.x * Math.PI) / 8 + (t * 0.05);
    
    groupRef.current.rotation.x += 0.02 * (targetRotX - groupRef.current.rotation.x);
    groupRef.current.rotation.y += 0.02 * (targetRotY - groupRef.current.rotation.y);
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={currentPos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={particleCount} array={currentSizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

// --------------------------------------------------------------------------
// MAIN SCENE
// --------------------------------------------------------------------------
const ThreeScene = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none", background: "#050507" }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "auto", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#3b82f6" />
        
        <MorphingCore />
        
        {/* Subtle background depth */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#050507" transparent opacity={0.5} />
        </mesh>
      </Canvas>

      {/* Finishing gradient to blend with the UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-transparent to-[#050507] pointer-events-none" />
    </div>
  );
};

export default ThreeScene;