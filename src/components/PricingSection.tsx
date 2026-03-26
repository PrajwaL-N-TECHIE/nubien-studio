import { useRef, useMemo, useState, Suspense } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Search, Lightbulb, Code, TestTube, Rocket, RefreshCw,
  Sparkles, ArrowRight, Cpu, Zap
} from "lucide-react";

// The "Buttery" Apple-tier easing curve
const customEase = [0.22, 1, 0.36, 1] as any;

// --------------------------------------------------------------------------
// DATA
// --------------------------------------------------------------------------
const steps = [
  {
    icon: Search,
    title: "Discovery",
    description: "Deep dive into business logic to uncover high-impact AI opportunities.",
    duration: "1-2 weeks",
  },
  {
    icon: Lightbulb,
    title: "Strategy",
    description: "Tailored roadmaps designed for scalability and measurable ROI.",
    duration: "2-3 weeks",
  },
  {
    icon: Code,
    title: "Development",
    description: "Agile neural architecture construction with continuous feedback loops.",
    duration: "4-12 weeks",
  },
  {
    icon: TestTube,
    title: "Testing",
    description: "Multi-layered stress testing to ensure peak reliability and precision.",
    duration: "2-4 weeks",
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "Zero-downtime integration into your existing cloud infrastructure.",
    duration: "1-2 weeks",
  },
  {
    icon: RefreshCw,
    title: "Optimization",
    description: "Continuous self-learning updates to maintain the competitive edge.",
    duration: "Ongoing",
  },
];

// --------------------------------------------------------------------------
// THREE.JS BACKGROUND
// --------------------------------------------------------------------------
const DataWave = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 3000;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      positions[i3 + 2] += Math.sin(t + x * 0.5 + y * 0.5) * 0.01;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = Math.sin(t * 0.1) * 0.2;
    pointsRef.current.rotation.x = Math.cos(t * 0.1) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#a855f7"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// --------------------------------------------------------------------------
// SUPER-SMOOTH SPOTLIGHT CARD
// --------------------------------------------------------------------------
const ProcessCard = ({ step, index, isInView }: { step: any, index: number, isInView: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Spring-loaded Spotlight Coordinates (No more harsh snapping)
  const spotX = useSpring(0, { stiffness: 150, damping: 25, mass: 0.5 });
  const spotY = useSpring(0, { stiffness: 150, damping: 25, mass: 0.5 });

  // 2. Softened 3D Tilt Mechanics
  const rotateX = useSpring(0, { stiffness: 100, damping: 30, mass: 0.5 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 30, mass: 0.5 });
  const scale = useSpring(1, { stiffness: 150, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Fluidly update spotlight
    spotX.set(x);
    spotY.set(y);

    // Fluidly update tilt
    const rX = (y - rect.height / 2) / 25;
    const rY = -(x - rect.width / 2) / 25;
    rotateX.set(rX);
    rotateY.set(rY);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${spotX}px ${spotY}px, rgba(168, 85, 247, 0.15), transparent 80%)`;
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.15, ease: customEase }}
      style={{ perspective: 1000 }}
      className="group h-full relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="relative p-8 rounded-[32px] h-full flex flex-col bg-[#0C0C12]/80 backdrop-blur-xl border border-white/5 transition-colors duration-500 hover:border-purple-500/30 shadow-2xl"
      >
        {/* Spring-Loaded Spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
          style={{ background: spotlight }}
        />

        {/* Giant Watermark Number */}
        <div className="absolute bottom-4 right-6 text-[8rem] font-black text-white/[0.02] leading-none z-0 transition-all duration-700 group-hover:text-purple-500/[0.05] group-hover:scale-110 group-hover:-rotate-3 font-mono">
          0{index + 1}
        </div>

        {/* Icon Container */}
        <div className="relative z-10 w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-[#13131A] border border-white/10 group-hover:border-purple-500/40 transition-colors duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
            className="absolute inset-2 blur-xl rounded-full bg-purple-600"
          />
          <Icon size={24} className="text-zinc-400 relative z-10 group-hover:scale-110 group-hover:text-white transition-all duration-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-grow">
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-purple-400 transition-colors duration-300">
            {step.title}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed font-medium">
            {step.description}
          </p>
        </div>

        {/* Metadata Dock */}
        <div className="relative z-10 flex items-center gap-3 pt-8 mt-auto border-t border-white/5 group-hover:border-purple-500/20 transition-colors duration-500">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-300 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 group-hover:text-purple-300 transition-colors duration-500">
            <Cpu size={12} />
            {step.duration}
          </div>
          <Zap size={14} className="text-zinc-600 ml-auto group-hover:text-purple-400 transition-colors duration-500" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// --------------------------------------------------------------------------
// MAIN SECTION
// --------------------------------------------------------------------------
const ProcessSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smoother Parallax Scroll
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const titleY = useTransform(smoothProgress, [0, 1], [80, -80]);

  const title1 = "From Concept".split("");
  const title2 = "to Continuous".split("");
  const title3 = "Deployment.".split("");

  // Buttery Letter Reveal Variant
  const letterVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)", rotateX: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      rotateX: 0,
      transition: { delay: i * 0.03, duration: 1, ease: customEase },
    }),
  };

  return (
    <section ref={containerRef} id="process" className="relative py-40 px-6 bg-[#050507] overflow-hidden">

      {/* 3D BACKGROUND (Optimized dpr for sharp/smooth rendering) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
            <DataWave />
          </Canvas>
        </Suspense>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#050507_100%)] opacity-90" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <motion.div style={{ y: titleY }} className="text-center mb-24 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: customEase }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-xl mb-8 shadow-xl"
          >
            <Sparkles size={12} className="text-purple-500" />
            <span className="text-[11px] font-bold tracking-widest text-zinc-300 uppercase font-['DM_Mono']">Our Path Forward</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-[7.5rem] font-bold tracking-tighter mb-8 leading-[1.05] font-['Syne'] text-white"
          >
            From Idea <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent italic opacity-90 pb-2 inline-block">
              to Continuous Launch.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: customEase }}
            className="text-zinc-400 max-w-xl mx-auto text-lg font-medium leading-relaxed"
          >
            A simple and proven approach designed to help you build and scale your products with confidence.
          </motion.p>
        </motion.div>

        {/* PROCESS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((step, i) => (
            <ProcessCard key={i} step={step} index={i} isInView={isInView} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProcessSection;