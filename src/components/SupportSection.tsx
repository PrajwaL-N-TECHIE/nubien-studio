import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { MessageSquare, CheckCircle2, Sparkles, ArrowRight, LifeBuoy, ShieldAlert } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import { audio } from "@/utils/audio";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

// High-quality placeholder portraits for the support team
const teamImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
];

// Calculated positions for a perfect spreading fan
const fanCards = [
  { rotate: -25, x: -160, y: 40 },
  { rotate: -15, x: -90, y: 15 },
  { rotate: -5, x: -20, y: 0 },
  { rotate: 5, x: 50, y: 0 },
  { rotate: 15, x: 120, y: 15 },
  { rotate: 25, x: 190, y: 40 },
];

// --------------------------------------------------------------------------
// 3D GLITCH SPHERE
// --------------------------------------------------------------------------
const GlitchSphere = () => {
  return (
    <Sphere args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#A855F7"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0}
        metalness={1}
        opacity={0.15}
        transparent
      />
    </Sphere>
  );
};

// --------------------------------------------------------------------------
// MAGNETIC BUTTON (Solid Purple)
// --------------------------------------------------------------------------
const MagneticButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
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
      className="relative px-8 py-4 rounded-full text-sm font-semibold bg-purple-600 text-white flex items-center gap-2 transition-colors border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:bg-purple-500 group mx-auto mb-20 md:mb-32"
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

// --------------------------------------------------------------------------
// MAIN SUPPORT SECTION
// --------------------------------------------------------------------------
const SupportSection = () => {
  const sectionRef = useRef(null);
  const fanRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const fanInView = useInView(fanRef, { once: true, margin: "-50px" });

  // Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const xSpring = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const ySpring = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleParallax = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) * 0.05);
    mouseY.set((clientY - innerHeight / 2) * 0.05);
  };

  return (
    <section
      id="support"
      ref={sectionRef}
      onMouseMove={handleParallax}
      className="relative py-32 px-6 bg-[#050507] text-white overflow-hidden flex flex-col items-center min-h-screen justify-center"
    >
      {/* Cinematic Atmospheric Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay" style={{
        backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
      }} />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02]" style={{
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 118, 0.06))',
        backgroundSize: '100% 2px, 3px 100%'
      }} />

      {/* 3D Glitch Sphere Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <GlitchSphere />
        </Canvas>
      </div>

      {/* Parallax 404 Watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center font-black text-[25vw] text-white/[0.02] pointer-events-none select-none z-0 tracking-tighter"
        style={{ x: xSpring, y: ySpring }}
      >
        CORE
      </motion.div>
      {/* Deep Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* High-End Technical Dot Grid */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
      }} />

      <div className="max-w-4xl mx-auto text-center relative z-10 w-full">

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: customEase as any }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-xl mb-8 shadow-xl"
        >
          <div className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[11px] font-bold tracking-widest text-white uppercase">24/7 Apex Support</span>
        </motion.div>

        {/* Cinematic Typography */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: customEase as any }}
          className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter mb-2 text-white leading-tight"
        >
          We’ve Got Your Back
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: customEase as any }}
          className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter mb-8 text-zinc-600 leading-tight"
        >
          Anytime, Anywhere.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4, ease: customEase as any }}
          className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed"
        >
          Our team is powered by human-centric intelligence to help you launch, grow, and manage your business.
        </motion.p>

        {/* Premium Magnetic Button removed upon user request to declutter Company flow */}

        {/* Interactive "Hand of Cards" Team Fan */}
        <div ref={fanRef} className="relative h-[250px] md:h-[350px] w-full flex items-end justify-center perspective-1200 mt-10">

          {/* Glassmorphic Speech Bubble 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -50, y: 20 }}
            animate={fanInView ? { opacity: 1, scale: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1, type: "spring", bounce: 0.4 }}
            className="absolute top-0 md:top-10 left-4 md:left-[15%] z-30 px-5 py-3 rounded-[20px] rounded-bl-sm text-sm font-bold tracking-wide bg-[#12121A]/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center gap-3 scale-90 md:scale-100 origin-bottom-left"
            style={{ transform: "rotate(-4deg)" }}
          >
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <LifeBuoy size={12} className="text-purple-400" />
            </div>
            <span className="text-white">How can we help?</span>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>

          {/* Glassmorphic Speech Bubble 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50, y: 20 }}
            animate={fanInView ? { opacity: 1, scale: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2, type: "spring", bounce: 0.4 }}
            className="absolute top-12 md:top-0 right-4 md:right-[15%] z-30 px-5 py-3 rounded-[20px] rounded-br-sm text-sm font-bold tracking-wide bg-purple-600 text-white shadow-[0_10px_40px_rgba(168,85,247,0.4)] flex items-center gap-2 scale-90 md:scale-100 origin-bottom-right border border-purple-500/50"
            style={{ transform: "rotate(6deg)" }}
          >
            <CheckCircle2 size={16} className="text-white" />
            Problem Solved ⚡

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>

          {/* FIX: THE RESPONSIVE FAN WRAPPER
            Scale down on mobile (scale-[0.65]) to prevent overlap, scale up to normal on desktop 
          */}
          <div className="relative w-full h-full flex justify-center items-end bottom-0 transform scale-[0.65] sm:scale-[0.8] md:scale-100 origin-bottom">
            {fanCards.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 200, rotate: 0, x: 0 }}
                animate={fanInView ? { opacity: 1, y: pos.y, rotate: pos.rotate, x: pos.x } : {}}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.1,
                  ease: customEase as any
                }}
                whileHover={{
                  y: pos.y - 40,
                  rotate: pos.rotate,
                  scale: 1.15,
                  zIndex: 50,
                  transition: { duration: 0.4, type: "spring", bounce: 0.5 }
                }}
                onMouseEnter={() => audio.playHover()}
                whileTap={{
                  y: pos.y - 40,
                  scale: 1.15,
                  zIndex: 50,
                }}
                className="absolute bottom-0 rounded-[24px] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 bg-[#1A1A1E]"
                style={{
                  width: "140px",
                  height: "190px",
                  transformOrigin: "bottom center",
                  left: "calc(50% - 70px)",
                  zIndex: i + 10,
                }}
              >
                {/* Team Image */}
                <img
                  src={teamImages[i]}
                  alt={`Support Team Member ${i + 1}`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />

                {/* Deep Inner Glass Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-black/20 to-transparent pointer-events-none opacity-80" />

                {/* Sparkle Icon on Hover */}
                <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Sparkles size={16} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SupportSection;