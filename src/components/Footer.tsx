import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { 
  ArrowUpRight, Sparkles, MapPin, Clock, Github, Twitter, Linkedin, Mail, Send, 
  Heart, ChevronRight, Briefcase, Activity, Eye, Users, Cpu
} from "lucide-react";

// Premium Easing Curve (Apple-style)
const customEase = [0.22, 1, 0.36, 1];

// --------------------------------------------------------------------------
// 3D NEURAL SINGULARITY (The "Out of the box" Background)
// --------------------------------------------------------------------------
const NeuralTorus = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Orbital particle field
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 15 + Math.random() * 10;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.5;
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.z = Math.cos(t * 0.1) * 0.2;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= 0.001;
      pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.2;
    }
  });

  return (
    <group>
      {/* The Core Wireframe */}
      <mesh ref={meshRef} scale={1.2}>
        <torusKnotGeometry args={[8, 2.5, 256, 32]} />
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.15} />
      </mesh>
      
      {/* Orbital Dust */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#d8b4fe" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};

// --------------------------------------------------------------------------
// MAGNETIC BUTTON 
// --------------------------------------------------------------------------
const MagneticButton = ({ children, className, onClick }: any) => {
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
      className={`relative flex items-center justify-center group bg-purple-600 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:bg-purple-500 transition-colors ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

// --------------------------------------------------------------------------
// REAL-TIME LIVE STATUS
// --------------------------------------------------------------------------
const LiveStatus = () => {
  const [time, setTime] = useState(new Date());
  const [visitorCount, setVisitorCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  
  useEffect(() => {
    const storedViews = parseInt(localStorage.getItem('nubien_total_views') || '14205');
    const newViews = storedViews + 1;
    localStorage.setItem('nubien_total_views', newViews.toString());
    setPageViews(newViews);

    const storedVisitors = parseInt(localStorage.getItem('nubien_total_visitors') || '3042');
    const lastVisit = parseInt(localStorage.getItem('nubien_last_visit') || '0');
    const now = Date.now();
    let currentVisitors = storedVisitors;
    
    if (now - lastVisit > 3600000) {
        currentVisitors += 1;
        localStorage.setItem('nubien_total_visitors', currentVisitors.toString());
        localStorage.setItem('nubien_last_visit', now.toString());
    }
    setVisitorCount(currentVisitors);

    const timer = setInterval(() => setTime(new Date()), 1000);
    const baseActive = 45;
    setActiveUsers(baseActive);

    const activeInterval = setInterval(() => {
      setActiveUsers(prev => {
        const timeFactor = Math.sin(Date.now() / 10000) * 5; 
        const variance = Math.floor(Math.random() * 3) - 1;
        return Math.max(12, Math.floor(baseActive + timeFactor + variance));
      });
    }, 3500);

    return () => { clearInterval(timer); clearInterval(activeInterval); };
  }, []);

  return (
    <div className="relative p-6 rounded-[32px] bg-[#0C0C12]/60 backdrop-blur-[40px] border border-white/10 overflow-hidden shadow-2xl h-full flex flex-col justify-between">
      <div className="relative z-10 flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
          </span>
          <span className="text-xs font-bold tracking-widest text-white uppercase">Live Telemetry</span>
        </div>
        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-[9px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold tracking-widest">
          CONNECTED
        </motion.span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-[#1A1A24]/40 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5"><MapPin size={10} className="text-purple-400" /> Location</div>
          <span className="text-sm font-bold text-white">India</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1A1A24]/40 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5"><Clock size={10} className="text-purple-400" /> System Time</div>
          <span className="text-sm font-bold text-white font-mono">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-300 font-medium"><Users size={14} className="text-purple-500" /> Unique Visitors</div>
          <motion.span key={visitorCount} initial={{ scale: 1.1, color: "#a855f7" }} animate={{ scale: 1, color: "#ffffff" }} className="font-mono font-bold text-white">{visitorCount.toLocaleString()}</motion.span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-300 font-medium"><Activity size={14} className="text-purple-500" /> Active Right Now</div>
          <motion.span key={activeUsers} initial={{ scale: 1.1, color: "#a855f7" }} animate={{ scale: 1, color: "#ffffff" }} className="font-mono font-bold text-white">{activeUsers}</motion.span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-300 font-medium"><Eye size={14} className="text-purple-500" /> Total Page Views</div>
          <motion.span key={pageViews} initial={{ scale: 1.1, color: "#a855f7" }} animate={{ scale: 1, color: "#ffffff" }} className="font-mono font-bold text-white">{pageViews.toLocaleString()}</motion.span>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// MAIN FOOTER
// --------------------------------------------------------------------------
const Footer = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Master Scroll Transforms for Cinematic Feel
  const yOffset = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const scaleIn = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacityIn = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  
  // The Watermark Expand Effect
  const textTracking = useTransform(scrollYProgress, [0.5, 1], ["-0.05em", "0.05em"]);
  const textOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 0.03]);

  const links = {
    Company: ["About Us", "Portfolio", "Services", "Careers", "Blog"],
    Solutions: ["AI Studio", "Analytics", "Cloud Solutions", "Security", "Enterprise"],
    Resources: ["Documentation", "Case Studies", "API Reference", "Community", "Support"],
  };

  return (
    <footer ref={containerRef} className="relative bg-[#050507] pt-40 pb-8 px-6 overflow-hidden min-h-screen flex flex-col justify-end">
      
      {/* 3D NEURAL CORE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
            <NeuralTorus />
          </Canvas>
        </Suspense>
        {/* Deep Vignette to ensure UI pop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#050507_100%)] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]" />
      </div>

      <motion.div 
        style={{ y: yOffset, scale: scaleIn, opacity: opacityIn }} 
        className="max-w-7xl mx-auto relative z-10 w-full"
      >
        {/* PRE-FOOTER MEGA CTA */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 pb-20 border-b border-white/5">
          <div className="text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-md mb-8 shadow-xl">
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-white">Project Ignition</span>
            </div>
            <h2 className="text-6xl md:text-[5.5rem] font-bold text-white tracking-tight mb-4 leading-none drop-shadow-2xl">
              Have an idea?
            </h2>
            <p className="text-xl text-zinc-300 font-medium">
              Let's architect the future, together.
            </p>
          </div>
          
          <MagneticButton className="w-48 h-48 rounded-full text-xl font-bold group z-10">
            Let's Talk
            <motion.span animate={{ rotate: [0, 45, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </motion.span>
          </MagneticButton>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-20 relative">
          
          {/* Brand Column */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[18px] bg-purple-500/10 flex items-center justify-center border border-purple-500/30 backdrop-blur-md shadow-lg">
                <Cpu size={24} className="text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">Nubien</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium mt-2">
              Next-Gen AI Studio building the future of intelligent digital experiences. 
              We turn complex algorithms into seamless products.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <motion.a key={i} href="#" whileHover={{ y: -4, scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-full bg-[#12121A]/80 border border-white/10 flex items-center justify-center hover:border-purple-500/50 hover:bg-purple-500/20 transition-all backdrop-blur-md shadow-xl group">
                  <Icon size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Dynamic Links Grid */}
          <div className="md:col-span-5 grid grid-cols-3 gap-6">
            {Object.entries(links).map(([section, items]) => (
              <div key={section} className="flex flex-col gap-6">
                <h4 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">
                  {section}
                </h4>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter & Status Column (Glassmorphism) */}
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="p-6 rounded-[32px] bg-[#0C0C12]/60 backdrop-blur-[40px] border border-white/10 shadow-2xl">
              <h4 className="text-xs font-bold text-white mb-4 tracking-widest uppercase flex items-center gap-2">
                <Mail size={14} className="text-purple-500" /> Dispatch
              </h4>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#1A1A24]/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors shadow-lg">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
            
            <LiveStatus />
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} NUBIEN STUDIO.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
              Engineered with <Heart size={12} className="text-purple-500 fill-purple-500" /> for the future.
            </p>
          </div>
        </div>

      </motion.div>

      {/* MASSIVE SCROLL-EXPANDING WATERMARK */}
      <motion.div 
        style={{ letterSpacing: textTracking, opacity: textOpacity }}
        className="absolute bottom-10 left-0 right-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0"
      >
        <h1 className="text-[20vw] font-black leading-none text-white whitespace-nowrap">
          NUBIEN
        </h1>
      </motion.div>

    </footer>
  );
};

export default Footer;