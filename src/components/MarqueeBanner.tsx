import { motion, useMotionValue, useSpring, useTransform, useScroll, useVelocity } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Zap, Cpu, Cloud, Database, Shield, Code2, Bot, Brain, Rocket, Star, Gauge } from "lucide-react";

const brands = [
  { name: "TensorFlow", icon: Brain, color: "#FF6F00" },
  { name: "OpenAI", icon: Sparkles, color: "#10A37F" },
  { name: "PyTorch", icon: Cpu, color: "#EE4C2C" },
  { name: "Hugging Face", icon: Bot, color: "#FFD21E" },
  { name: "LangChain", icon: Zap, color: "#2D9CDB" },
  { name: "Vercel", icon: Rocket, color: "#000000" },
  { name: "AWS", icon: Cloud, color: "#FF9900" },
  { name: "Google Cloud", icon: Cloud, color: "#4285F4" },
  { name: "Azure", icon: Database, color: "#0078D4" },
  { name: "Stripe", icon: Zap, color: "#635BFF" },
  { name: "Figma", icon: Code2, color: "#F24E1E" },
  { name: "Notion", icon: Database, color: "#000000" },
  { name: "Slack", icon: Bot, color: "#4A154B" },
  { name: "GitHub", icon: Code2, color: "#6e40c9" },
  { name: "Docker", icon: Rocket, color: "#2496ED" },
  { name: "Supabase", icon: Database, color: "#3ECF8E" },
  { name: "Redis", icon: Gauge, color: "#DC382D" },
  { name: "Cloudflare", icon: Shield, color: "#F38020" },
];

const MarqueeBanner = () => {
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Scroll-based speed control
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const speed = useTransform(scrollVelocity, [-1000, 0, 1000], [1.5, 1, 1.5]);
  const [duration, setDuration] = useState(25);

  useEffect(() => {
    const unsubscribe = speed.onChange(v => {
      setDuration(25 / v);
    });
    return () => unsubscribe();
  }, [speed]);

  return (
    <div className="relative py-12 overflow-hidden bg-[#08080A] border-y border-[#2A2A2E]">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-purple-600/10 rounded-full blur-[60px]" />
      </div>

      {/* Animated gradient border top */}
      <motion.div
        animate={{ 
          background: [
            "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
            "linear-gradient(90deg, transparent, #ec4899, transparent)",
            "linear-gradient(90deg, transparent, #8b5cf6, transparent)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-0 left-0 right-0 h-[1px]"
      />

      {/* Main marquee */}
      <div className="relative" ref={containerRef}>
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: duration,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {[...brands, ...brands, ...brands].map((brand, i) => {
            const Icon = brand.icon;
            const isHovered = hoveredIndex === i;
            
            return (
              <motion.div
                key={i}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  animate={isHovered ? { 
                    opacity: 0.5,
                    scale: 1.2
                  } : { opacity: 0, scale: 1 }}
                  className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
                  style={{ backgroundColor: brand.color }}
                />

                {/* Brand content */}
                <motion.div 
                  className="relative flex items-center gap-3 px-4 py-2 rounded-lg"
                  animate={isHovered ? { 
                    backgroundColor: `${brand.color}20`,
                    borderColor: brand.color
                  } : { 
                    backgroundColor: "transparent",
                    borderColor: "transparent"
                  }}
                  style={{ borderWidth: "1px" }}
                >
                  {/* Icon */}
                  <motion.div
                    animate={isHovered ? { 
                      rotate: 360,
                      scale: 1.2
                    } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ color: isHovered ? brand.color : "#a1a1aa" }}
                  >
                    <Icon size={18} />
                  </motion.div>

                  {/* Brand name */}
                  <motion.span
                    animate={isHovered ? { 
                      color: "#ffffff",
                      textShadow: `0 0 8px ${brand.color}`
                    } : { 
                      color: "#a1a1aa",
                      textShadow: "none"
                    }}
                    className="text-sm font-bold tracking-[0.1em] uppercase"
                  >
                    {brand.name}
                  </motion.span>

                  {/* Sparkle on hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Speed indicator (subtle) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: duration !== 25 ? 0.5 : 0 }}
        className="absolute bottom-2 right-4 text-[10px] text-purple-400/30 flex items-center gap-1"
      >
        <Gauge size={10} />
        <span>speed x{(25 / duration).toFixed(1)}</span>
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#08080A] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#08080A] to-transparent pointer-events-none" />

      {/* Bottom animated border */}
      <motion.div
        animate={{ 
          background: [
            "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
            "linear-gradient(90deg, transparent, #ec4899, transparent)",
            "linear-gradient(90deg, transparent, #8b5cf6, transparent)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-0 left-0 right-0 h-[1px]"
      />
    </div>
  );
};

export default MarqueeBanner;