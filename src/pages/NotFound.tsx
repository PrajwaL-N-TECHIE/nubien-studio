import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, Cpu, TerminalSquare } from "lucide-react";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

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
      className="relative px-8 py-4 rounded-full text-sm font-semibold bg-purple-600 text-white flex items-center gap-2 transition-colors border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:bg-purple-500 group"
    >
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

  useEffect(() => {
    console.error("404 Error: Null route accessed at", location.pathname);
  }, [location.pathname]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#050507] overflow-hidden px-6">
      
      {/* Ambient Background & Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" 
        />
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)', 
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }} 
        />
      </div>

      {/* Massive 404 Background Watermark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: customEase }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <h1 className="text-[35vw] font-black text-white/[0.02] tracking-tighter">
          404
        </h1>
      </motion.div>

      {/* Foreground Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: customEase }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full"
      >
        {/* Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A24]/80 border border-white/10 backdrop-blur-md mb-8 shadow-xl"
        >
          <TerminalSquare size={14} className="text-purple-500" />
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">System Error</span>
        </motion.div>

        {/* Glassmorphic Panel */}
        <div className="relative p-10 md:p-16 rounded-[40px] w-full overflow-hidden shadow-2xl bg-[#0C0C12]/60 backdrop-blur-2xl border border-white/10 flex flex-col items-center">
          
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]">
            <Cpu size={32} className="text-purple-400" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Signal Lost.
          </h2>
          
          <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-10 max-w-md mx-auto">
            The neural node you are trying to access at <br className="hidden md:block" />
            <span className="text-purple-400 font-mono text-sm px-2 py-1 bg-purple-500/10 rounded-md border border-purple-500/20">{location.pathname}</span> 
            <br className="hidden md:block" />
            does not exist in our current architecture.
          </p>

          <MagneticButton onClick={() => navigate("/")}>
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Return to Core Interface
          </MagneticButton>
        </div>
      </motion.div>

    </section>
  );
};

export default NotFound;