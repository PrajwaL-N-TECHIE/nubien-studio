import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, Suspense, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Cpu, TerminalSquare, AlertTriangle, Ghost } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

// --------------------------------------------------------------------------
// 3D GLITCH SPHERE (Premium Visual)
// --------------------------------------------------------------------------
const GlitchSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#a855f7"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#6d28d9"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

// --------------------------------------------------------------------------
// PARTICLE FIELD (Star-like Background)
// --------------------------------------------------------------------------
const ParticleField = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

// --------------------------------------------------------------------------
// MAGNETIC BUTTON (Solid Purple)
// --------------------------------------------------------------------------
const MagneticButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * 0.4);
    y.set((clientY - (top + height / 2)) * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative px-10 py-5 rounded-full text-sm font-bold bg-purple-600 text-white flex items-center gap-3 transition-all border border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:bg-purple-500 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

// --------------------------------------------------------------------------
// MAIN 404 COMPONENT
// --------------------------------------------------------------------------
const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 50);
    mouseY.set((clientY / innerHeight - 0.5) * 50);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center bg-[#050507] overflow-hidden px-6"
    >

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
          <Suspense fallback={null}>
            <GlitchSphere />
            <ParticleField />
          </Suspense>
        </Canvas>
      </div>

      {/* Interactive Watermark */}
      <motion.div
        style={{ x: useTransform(smoothX, x => x * -0.5), y: useTransform(smoothY, y => y * -0.5) }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <h1 className="text-[40vw] font-black text-white/[0.03] tracking-tighter filter blur-[2px]">
          404
        </h1>
      </motion.div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: customEase }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full"
      >
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl"
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
          <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase font-['DM_Mono']">Reality Distortion Detected</span>
        </motion.div>

        <div className="space-y-6 mb-12">
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter font-['Syne'] leading-none">
            Lost in <span className="italic bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Space.</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto text-lg md:text-xl font-medium leading-relaxed">
            The page you're looking for has drifted beyond our digital horizon.
            <br />
            <span className="text-zinc-600 font-mono text-sm mt-4 block">Path: {location.pathname}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <MagneticButton onClick={() => navigate("/")}>
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Safety
          </MagneticButton>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-full text-sm font-bold border border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Cpu size={18} className="text-purple-400" />
            Reboot Reality
          </motion.button>
        </div>
      </motion.div>

      {/* Corner Accents */}
      <div className="absolute top-10 left-10 pointer-events-none opacity-20">
        <div className="text-[10px] text-zinc-500 font-mono space-y-1">
          <div>SIGNAL: LOST</div>
          <div>STRENGTH: 0%</div>
          <div>ORIGIN: {location.pathname}</div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 pointer-events-none opacity-20">
        <div className="text-[10px] text-zinc-500 font-mono text-right space-y-1">
          <div>ENV: PRODUCTION</div>
          <div>VER: 2.1.0-BUILDICY</div>
          <div>CORE: SYSTEM_ERR_404</div>
        </div>
      </div>

    </section>
  );
};

export default NotFound;