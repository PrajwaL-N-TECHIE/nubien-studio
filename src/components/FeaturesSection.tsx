import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { 
  Zap, ShieldCheck, Mic, Activity, Eye, Layers, BarChart,
  Apple, Music, ShoppingBag, Box, Twitter, Globe, Sparkles,
  Lock, Key, Scan, Fingerprint as FingerprintIcon, Languages, Radio
} from "lucide-react";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

const archImages = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=400&auto=format&fit=crop"
];

const featureCards = [
  {
    icon: Zap,
    title: "Seamless Integration",
    description: "Nubien supports a massive ecosystem of third-party APIs with automatic error handling and real-time sync.",
    visual: "api",
    stats: ["200+ APIs", "99.9% uptime", "<50ms latency"]
  },
  {
    icon: ShieldCheck,
    title: "Zero-Trust Security",
    description: "Enterprise-grade architecture fortified with biometric auth, SSO, and granular permission controls.",
    visual: "auth",
    stats: ["AES-256", "10M+ users", "SOC2 Type II"]
  },
  {
    icon: Mic,
    title: "Neural Speech AI",
    description: "Enable your users to control and navigate your entire application using natural language processing.",
    visual: "speech",
    stats: ["98% accuracy", "Real-time", "50+ languages"]
  },
];

const miniFeatures = [
  { icon: Activity, label: "Real-Time Telemetry", desc: "Instant analytics and structural insights for faster decision-making." },
  { icon: Eye, label: "Computer Vision", desc: "Advanced AI-powered image, video, and object recognition." },
  { icon: Layers, label: "Dynamic UI Generation", desc: "Interfaces that physically adapt to user behavior patterns." },
  { icon: BarChart, label: "Predictive Modeling", desc: "Forecast trends and automate workflows with machine learning." },
];

/* -------------------------------------------------------------------------- */
/* TIGHTER API VISUAL                                                         */
/* -------------------------------------------------------------------------- */
const ApiVisual = () => {
  const icons = [Apple, Music, ShoppingBag, Box, Twitter, Globe];
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [dataFlow, setDataFlow] = useState<{from: number}[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = Array.from({length: 3}, () => Math.floor(Math.random() * icons.length));
      setActiveNodes([...new Set(newActive)]);
      setDataFlow(Array.from({length: 2}, () => ({ from: Math.floor(Math.random() * icons.length) })));
    }, 2500);
    return () => clearInterval(interval);
  }, [icons.length]);

  return (
    <div className="relative mt-6 h-[200px] w-full rounded-[20px] bg-[#08080B] border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

      <svg className="absolute inset-0 w-full h-full z-0">
        <defs>
          <linearGradient id="network-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {icons.map((_, i) => {
          const startX = 12 + (i * 15.2) + "%";
          const isActive = activeNodes.includes(i);
          return (
            <motion.path
              key={i}
              d={`M ${startX} 25% C ${startX} 55%, 50% 50%, 50% 75%`}
              fill="none"
              stroke={isActive ? "#a855f7" : "rgba(255,255,255,0.05)"}
              strokeWidth={isActive ? "2" : "1"}
              strokeDasharray={isActive ? "none" : "4,4"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, opacity: isActive ? 1 : 0.3 }}
              transition={{ duration: 1.5, ease: customEase }}
            />
          );
        })}
      </svg>

      {dataFlow.map((packet, i) => (
        <motion.div
          key={`packet-${i}-${packet.from}-${Date.now()}`}
          className="absolute w-1.5 h-1.5 bg-white rounded-full z-10 shadow-[0_0_10px_rgba(168,85,247,1)]"
          animate={{
            top: ["25%", "75%"],
            left: [`${12 + packet.from * 15.2}%`, "50%"],
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      ))}

      {icons.map((Icon, i) => (
        <motion.div 
          key={i} 
          className="absolute top-4 -translate-x-1/2 z-10"
          style={{ left: `${12 + i * 15.2}%` }}
        >
          <motion.div
            animate={activeNodes.includes(i) ? {
              scale: [1, 1.15, 1],
              boxShadow: ["0 0 0px rgba(168,85,247,0)", "0 0 15px rgba(168,85,247,0.5)", "0 0 0px rgba(168,85,247,0)"],
              borderColor: "rgba(168,85,247,0.5)"
            } : { borderColor: "rgba(255,255,255,0.1)" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-lg bg-[#12121A] flex items-center justify-center border"
          >
            <Icon size={14} className={activeNodes.includes(i) ? "text-white" : "text-zinc-600"} />
          </motion.div>
        </motion.div>
      ))}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center w-full">
        <motion.div 
          animate={{ boxShadow: ["0 0 0px rgba(168,85,247,0.2)", "0 0 20px rgba(168,85,247,0.6)", "0 0 0px rgba(168,85,247,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center relative z-10 shadow-xl"
        >
          <Radio size={18} className="text-white relative z-10" />
        </motion.div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TIGHTER AUTH VISUAL                                                        */
/* -------------------------------------------------------------------------- */
const AuthVisual = () => {
  const [scanPosition, setScanPosition] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition(prev => {
        const next = (prev + 2) % 100;
        if (next > 85 && prev <= 85) {
          setUnlocked(true);
          setTimeout(() => setUnlocked(false), 800);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-6 h-[200px] w-full rounded-[20px] bg-[#08080B] border border-white/5 overflow-hidden group">
      <motion.div
        className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent pointer-events-none z-10"
        style={{ top: `${scanPosition - 15}%` }}
      />

      <svg className="absolute inset-0 w-full h-full z-0">
        {[...Array(3)].map((_, i) => (
          <motion.circle
            key={i}
            cx="50%" cy="50%" r={25 + i * 20}
            fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray={i % 2 === 0 ? "4,6" : "none"}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 15 - i * 2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.div
          animate={unlocked ? { scale: [1, 1.15, 1], rotateY: [0, 180, 0] } : {}}
          transition={{ duration: 0.8, ease: customEase }}
          className="relative mb-3"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg"
          />
          <div className="relative w-14 h-14 rounded-2xl bg-[#12121A] flex items-center justify-center border border-purple-500/50 shadow-xl">
            {unlocked ? <Lock size={24} className="text-white" /> : <ShieldCheck size={24} className="text-purple-400" />}
          </div>
        </motion.div>

        <div className="flex justify-center gap-3">
          <div className="text-[9px] text-white font-bold tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
            <Key size={10} className="text-purple-400" /> SSO ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TIGHTER SPEECH VISUAL                                                      */
/* -------------------------------------------------------------------------- */
const SpeechVisual = () => {
  const [audioLevels, setAudioLevels] = useState(Array(32).fill(10));
  const [isListening, setIsListening] = useState(false);
  
  useEffect(() => {
    const audioInterval = setInterval(() => {
      setAudioLevels(Array.from({ length: 32 }, () => Math.floor(Math.random() * (isListening ? 100 : 20)) + 10));
    }, 100);
    const listenInterval = setInterval(() => setIsListening(prev => !prev), 3000);
    return () => { clearInterval(audioInterval); clearInterval(listenInterval); };
  }, [isListening]);

  return (
    <div className="relative mt-6 h-[200px] w-full rounded-[20px] bg-[#08080B] border border-white/5 overflow-hidden group flex flex-col items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center gap-[3px] h-20 px-6 z-10 w-full mt-[-10px]">
        {audioLevels.map((level, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-purple-500 rounded-full"
            animate={{ height: `${level}%`, opacity: level > 50 ? 1 : 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformOrigin: 'center' }}
          />
        ))}
      </div>

      <motion.div
        animate={{ scale: isListening ? [1, 1.05, 1] : 1, boxShadow: isListening ? "0 0 20px rgba(168,85,247,0.3)" : "none" }}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0, ease: "easeInOut" }}
        className={`absolute bottom-5 flex items-center gap-2 px-4 py-2 rounded-full z-20 ${
          isListening ? 'bg-purple-600 border border-purple-500' : 'bg-[#12121A] border border-white/10'
        }`}
      >
        <motion.div
          animate={{ opacity: isListening ? [1, 0] : 1 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-white' : 'bg-purple-500'}`}
        />
        <span className={`text-[10px] font-bold tracking-widest uppercase ${isListening ? 'text-white' : 'text-zinc-400'}`}>
          {isListening ? 'Processing...' : 'Awaiting Input'}
        </span>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN FEATURES SECTION                                                      */
/* -------------------------------------------------------------------------- */
const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width * 100 - 50);
    mouseY.set((e.clientY - rect.top) / rect.height * 100 - 50);
  };

  return (
    <section 
      id="features" 
      ref={sectionRef} 
      onMouseMove={handleMouseMove}
      className="relative py-32 px-6 bg-[#050507] overflow-hidden min-h-screen flex flex-col items-center"
    >
      <motion.div 
        style={{ x: springX, y: springY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[200px] pointer-events-none z-0"
      />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        
        {/* GRAND SCALE IMAGE WHEEL & HEADER */}
        <div className="relative h-[550px] md:h-[650px] w-full flex items-center justify-center mb-20 mt-10">
          
          <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="relative w-[350px] sm:w-[500px] md:w-[750px] h-[350px] sm:h-[500px] md:h-[750px]"
            >
              {archImages.map((src, i) => {
                const angle = (360 / archImages.length) * i;
                return (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 w-0 h-[50%] origin-bottom"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        animate={{ rotate: [-angle, -angle - 360] }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[24px] overflow-hidden border border-white/10 shadow-2xl"
                      >
                        <img src={src} alt="Architecture" className="w-full h-full object-cover" />
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#050507_25%,transparent_70%)] z-10 pointer-events-none" />
          
          <div className="text-center relative z-20 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: customEase }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-xl mb-6 shadow-xl"
            >
              <Sparkles size={12} className="text-purple-500" />
              <span className="text-[11px] font-bold tracking-widest text-white uppercase">Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: customEase }}
              className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-4 text-white leading-[1.05]"
            >
              Packed with <br /> 
              <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                Innovation.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: customEase }}
              className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed"
            >
              Nubien is engineered from the ground up with cutting-edge machine learning features to scale your enterprise seamlessly.
            </motion.p>
          </div>
        </div>

        {/* TIGHTER FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20 relative z-20">
          {featureCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + (i * 0.1), ease: customEase }}
              whileHover={{ y: -6 }}
              className="bg-[#0C0C12]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[32px] flex flex-col transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] shadow-xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1A1A24] border border-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-500 shadow-md">
                <card.icon size={24} className="text-purple-400 group-hover:text-white transition-colors duration-500" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
                {card.title}
              </h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6 flex-grow">
                {card.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {card.stats.map((stat, idx) => (
                  <span key={idx} className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 uppercase">
                    {stat}
                  </span>
                ))}
              </div>
              
              {/* Scaled-down Visuals */}
              {card.visual === "api" && <ApiVisual />}
              {card.visual === "auth" && <AuthVisual />}
              {card.visual === "speech" && <SpeechVisual />}
            </motion.div>
          ))}
        </div>

        {/* MINI FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-12 border-t border-white/5 relative z-20">
          {miniFeatures.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + (i * 0.1), ease: customEase }}
              className="flex flex-col gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#12121A] border border-white/10 group-hover:border-purple-500/50 transition-colors duration-300 shadow-md">
                  <feat.icon size={16} className="text-purple-400" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  {feat.label}
                </span>
              </div>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed pl-[52px]">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;