import { useRef, useMemo, useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformance } from "@/context/PerformanceContext";

// --------------------------------------------------------------------------
// GLOW TEXTURE GENERATOR
// --------------------------------------------------------------------------
const createGlowTexture = (size = 256, color = "#a855f7", intensity = 3.0) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// --------------------------------------------------------------------------
// GPGPU MORPHING PARTICLE SYSTEM
// --------------------------------------------------------------------------
const MorphingCore = ({ isVisible }: { isVisible: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { level } = usePerformance();

  // Granular particle counts based on device tier
  const particleCount = useMemo(() => {
    switch (level) {
      case "potato": return 8000;
      case "ultra": return 45000;
      default: return 20000;
    }
  }, [level]);

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
      const yStr = 1 - (i / (particleCount - 1)) * 2;
      const sRadius = Math.sqrt(1 - yStr * yStr);
      const theta = phi * i;
      const sphereScale = 4.5;
      sPos[i3] = Math.cos(theta) * sRadius * sphereScale;
      sPos[i3 + 1] = yStr * sphereScale;
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

      sz[i] = isHotspot ? 1.5 : 0.8 + Math.random() * 1.0;
    }

    return { chaosPos: cPos, spherePos: sPos, wavePos: wPos, colors: cols, baseSizes: sz };
  }, [particleCount]);

  const glowTexture = useMemo(() => createGlowTexture(256, "#a855f7", 3.0), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress1: { value: 0 },
    uProgress2: { value: 0 },
    uTexture: { value: glowTexture },
    uPointerX: { value: 0 },
    uPointerY: { value: 0 },
  }), [glowTexture]);

  const [inViewport, setInViewport] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      // If we've scrolled past the hero (roughly 1200px), pause everything
      if (latest > 1200 && inViewport) setInViewport(false);
      if (latest <= 1200 && !inViewport) setInViewport(true);
    });
  }, [scrollY, inViewport]);

  const finalVisible = isVisible && inViewport;

  useFrame((state) => {
    if (!materialRef.current || !finalVisible) return;
    const t = state.clock.elapsedTime;

    materialRef.current.uniforms.uTime.value = t;
    materialRef.current.uniforms.uProgress1.value = THREE.MathUtils.clamp((t - 1.5) / 2.0, 0, 1);
    materialRef.current.uniforms.uProgress2.value = THREE.MathUtils.clamp((t - 5.0) / 2.5, 0, 1);
    materialRef.current.uniforms.uPointerX.value = state.pointer.x;
    materialRef.current.uniforms.uPointerY.value = state.pointer.y;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={chaosPos} itemSize={3} />
          <bufferAttribute attach="attributes-aPosSphere" count={particleCount} array={spherePos} itemSize={3} />
          <bufferAttribute attach="attributes-aPosWave" count={particleCount} array={wavePos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" count={particleCount} array={baseSizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={uniforms}
          vertexColors={true}
          vertexShader={`
            uniform float uTime;
            uniform float uProgress1;
            uniform float uProgress2;
            uniform float uPointerX;
            uniform float uPointerY;
            
            attribute vec3 aPosSphere;
            attribute vec3 aPosWave;
            attribute float aSize;
            varying vec3 vColor;
            
            float easeOutElastic(float t) {
              float c4 = (2.0 * 3.14159) / 3.0;
              return t == 0.0 ? 0.0 : t == 1.0 ? 1.0 : pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * c4) + 1.0;
            }
            
            float easeInOutCubic(float t) {
              return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
            }

            void main() {
              vColor = color;
              
              float e1 = easeOutElastic(uProgress1);
              float e2 = easeInOutCubic(uProgress2);
              
              vec3 cPos = position;
              cPos.y += sin(uTime * 2.0 + position.x) * 2.0;
              
              float breathing = 1.0 + sin(uTime * 2.0 + aPosSphere.y) * 0.05;
              vec3 sPos = aPosSphere * breathing;
              
              vec3 wPos = aPosWave;
              wPos.y = sin(wPos.x * 0.15 + uTime * 0.8) * cos(wPos.z * 0.15 + uTime * 0.6) * 2.5 - 2.0;
              
              vec3 tempPos = mix(cPos, sPos, e1);
              vec3 finalPos = mix(tempPos, wPos, e2);

              finalPos.x += uPointerX * 0.5;
              finalPos.y += uPointerY * 0.5;

              vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
              gl_PointSize = aSize * (300.0 / -mvPosition.z) * mix(1.0, 0.85, e2);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform sampler2D uTexture;
            varying vec3 vColor;
            void main() {
              gl_FragColor = vec4(vColor, 1.0) * texture2D(uTexture, gl_PointCoord);
            }
          `}
        />
      </points>
    </group>
  );
};

const ThreeScene = () => {
  const [mounted, setMounted] = useState(false);
  const { isLowEnd } = usePerformance();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none", background: "#050507" }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{
          antialias: !isLowEnd,
          alpha: true,
          powerPreference: "high-performance",
          precision: isLowEnd ? "mediump" : "highp"
        }}
        style={{ pointerEvents: "auto", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#3b82f6" />

        <MorphingCore isVisible={true} />

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
