import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, useInView } from "framer-motion";
import { Sparkles, ArrowRight, Play, Zap, Globe, Star, Circle } from "lucide-react";

const ThreeScene = lazy(() => import("@/components/ThreeScene"));
import Magnetic from "@/components/Magnetic";
import { usePerformance } from "@/context/PerformanceContext";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1] as const;

// --------------------------------------------------------------------------
// FLOATING PARTICLES (Solid Purple)
// --------------------------------------------------------------------------
const FloatingParticles = () => {
  const { isLowEnd } = usePerformance();
  if (isLowEnd) return null; // Save CPU/GPU on potato
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
          style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2 }}
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0
          }}
          animate={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 12 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// --------------------------------------------------------------------------
// SMOOTH COUNTER
// --------------------------------------------------------------------------
const SmoothCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

// --------------------------------------------------------------------------
// MAIN SECTION
// --------------------------------------------------------------------------
const HeroSection = ({ onContactClick }: { onContactClick: () => void }) => {
  const [index, setIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const swapWords = ["Growth", "Evolution", "Success", "Solutions", "Impact"];

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % swapWords.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  // Premium Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 60, damping: 30, mass: 1 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-4, 4]), springConfig);

  const { isLowEnd } = usePerformance();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isLowEnd) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - (rect.left + rect.width / 2)) * 0.8);
    mouseY.set((e.clientY - (rect.top + rect.height / 2)) * 0.8);
  };

  // Variants for paragraph text reveal
  const paragraphVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.9, // Wait for card to load
      },
    },
  };

  const lineVariants = {
    hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: customEase },
    },
  };

  if (!isMounted) return null;

  return (
    <section
      ref={containerRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#050507]"
    >
      <FloatingParticles />

      <Suspense fallback={<div className="absolute inset-0 bg-[#050507]" />}>
        <motion.div className="absolute inset-0 z-0" style={{ opacity }}>
          <ThreeScene />
        </motion.div>
      </Suspense>

      {/* Heavy vignette to guarantee crisp text readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#050507_100%)] opacity-90" />

      <motion.div
        style={{ rotateX, rotateY, perspective: 1200, scale, y }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8 my-auto pt-32 pb-16"
      >
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: customEase }}
          className="inline-flex items-center gap-3 px-2 py-1.5 pr-5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-2xl shadow-xl"
        >
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-[#050507] font-['DM_Mono']">
            <SmoothCounter value={2026} duration={1} />
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-white flex items-center gap-2 uppercase font-['DM_Mono']">
            <Sparkles size={14} className="text-purple-500" /> Next-Gen AI Studio
          </span>
        </motion.div>

        {/* -------------------------------------------------------------------------- */}
        {/* CINEMATIC HEADLINE WITH GRID STACKING */}
        {/* -------------------------------------------------------------------------- */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: customEase }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-bold leading-[1.05] tracking-tight text-white flex flex-col items-center w-full z-20 font-['Syne']"
        >
          {/* Flex container managing the layout */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 w-full">
            <span className="drop-shadow-sm whitespace-nowrap">AI-Driven</span>

            {/* GRID STACKING: Forces words into the same physical cell - Increased height to prevent clipping */}
            <div className="grid place-items-center relative h-[1.3em] overflow-visible py-2">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={index}
                  className="col-start-1 row-start-1 text-purple-500 flex items-center justify-center whitespace-nowrap"
                  initial={{ opacity: 0, y: "60%", rotateX: -90, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: "-60%", rotateX: 90, filter: "blur(12px)" }}
                  transition={{ duration: 0.8, ease: customEase }}
                >
                  <span className="block relative z-20" style={{ textShadow: "0 0 30px rgba(168,85,247,0.3)" }}>
                    {swapWords[index]}
                  </span>

                  {/* Phantom Expanding Glow */}
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1, filter: "blur(0px)" }}
                    animate={{ opacity: 0, scale: 1.6, filter: "blur(30px)" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 -z-10 bg-purple-500 pointer-events-none select-none"
                    aria-hidden="true"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* FIX: WHITE + GREY GRADIENT SECOND LINE */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: customEase }}
            // Gradient applied here using bg-clip-text
            className="block mt-2 whitespace-nowrap bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm font-['Syne'] italic"
          >
            Redefining the Future.
          </motion.span>
        </motion.h1>

        {/* -------------------------------------------------------------------------- */}
        {/* FIX: HIGH VISIBILITY GLASSMORPHIC CARD WITH TEXT REVEAL */}
        {/* -------------------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.7, ease: customEase }}
          className="relative px-8 py-6 rounded-[32px] max-w-2xl mt-4 z-10 shadow-2xl overflow-hidden noise-overlay"
        >
          {/* FIX: Darker background and significantly heavier blur for visibility */}
          <div className="absolute inset-0 bg-[#050507]/80 backdrop-blur-[40px] rounded-[32px] -z-10" />
          {/* Sharper border */}
          <div className="absolute inset-0 border border-white/20 rounded-[32px] -z-10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />

          {/* FIX: Staggered Text Reveal Animation */}
          <motion.p
            variants={paragraphVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl leading-relaxed text-zinc-300 font-medium relative z-10 drop-shadow-md"
          >
            <motion.span variants={lineVariants} className="block">
              Creating cutting-edge solutions that <span className="text-white font-bold">redefine technology</span>.
            </motion.span>
            <motion.span variants={lineVariants} className="block mt-2 md:mt-0">
              Stay ahead with intelligent engineering built for tomorrow.
            </motion.span>
          </motion.p>
        </motion.div>

        {/* -------------------------------------------------------------------------- */}
        {/* SOLID CTA BUTTONS */}
        {/* -------------------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: customEase }}
          className="flex flex-col sm:flex-row items-center gap-6 mt-6 z-20"
        >
          <Magnetic strength={0.3} scale={1.02}>
            <div className="relative group">
              {/* Click-Triggered Glow */}
              <AnimatePresence>
                {isConnecting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1.4 }}
                    exit={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 bg-purple-500 blur-[30px] rounded-full -z-10"
                  />
                )}
              </AnimatePresence>

              <button
                onMouseDown={() => {
                  setIsConnecting(true);
                  onContactClick();
                }}
                onMouseUp={() => setTimeout(() => setIsConnecting(false), 600)}
                className="relative px-10 py-5 rounded-full text-base font-bold bg-purple-600 text-white flex items-center gap-3 transition-all border border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:bg-purple-500 active:scale-95"
              >
                Connect With Us <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Magnetic>

          <Magnetic strength={0.2} scale={1.02}>
            <button
              className="px-10 py-5 rounded-full text-base font-bold border border-white/10 text-white bg-white/[0.03] backdrop-blur-[40px] flex items-center gap-4 transition-colors shadow-xl group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                <Play size={12} className="fill-[#050507] text-[#050507] ml-0.5" />
              </div>
              What is Buildicy?
            </button>
          </Magnetic>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1.1, ease: customEase }}
          className="flex flex-wrap justify-center gap-4 mt-6 z-20"
        >
          {[{ icon: Zap, value: "10x", label: "Faster" }, { icon: Star, value: "98%", label: "Accuracy" }, { icon: Globe, value: "30+", label: "Countries" }].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#12121A]/60 border border-white/5 backdrop-blur-md shadow-xl transition-all hover:border-purple-500/30">
              <stat.icon size={12} className="text-purple-500" />
              <span className="text-[10px] font-bold text-white font-['DM_Mono']">{stat.value}</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold font-['DM_Mono']">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>


      {/* Bottom section */}
      <div className="relative z-20 w-full mt-auto">
        <div className="h-px w-full bg-white/5" />
        <div className="flex flex-col items-center justify-center py-8 bg-[#050507]">
          <span className="text-[10px] font-black tracking-[0.4em] text-zinc-600 mb-6 uppercase font-['DM_Mono']">Trusted by industry leaders</span>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-24 px-6">
            {["FLUX", "ORACLE", "VERTEX", "NEXUS", "AETHER"].map((brand) => (
              <Magnetic key={brand} strength={0.2} scale={1.1}>
                <span className="text-sm md:text-base font-black tracking-[0.2em] text-white/40 hover:text-purple-400 transition-colors cursor-pointer uppercase font-['Syne']">
                  {brand}
                </span>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;