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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative py-12 overflow-hidden bg-[#08080A] border-y border-[#2A2A2E] transform-gpu">
      {/* CSS Keyframes injected directly for high-performance compositor animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-custom {
          animation: marquee-scroll 30s linear infinite;
          will-change: transform;
        }
        .animate-marquee-custom:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-purple-600/10 rounded-full blur-[60px]" />
      </div>

      <div className="relative">
        <div
          ref={marqueeRef}
          className="flex w-max animate-marquee-custom"
          style={{ '--marquee-speed': '25s' } as any}
        >
          {[...brands, ...brands].map((brand, i) => {
            const Icon = brand.icon;
            const isHovered = hoveredIndex === i;

            return (
              <motion.div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group py-2 pr-16"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Brand content */}
                <div
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 ${isHovered ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent'
                    }`}
                >
                  {/* Icon */}
                  <div
                    className="transition-all duration-300"
                    style={{ color: isHovered ? brand.color : "#a1a1aa", transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1)' }}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Brand name */}
                  <span
                    className={`text-sm font-bold tracking-[0.1em] uppercase transition-all duration-300 ${isHovered ? 'text-white' : 'text-zinc-500'
                      }`}
                    style={{ textShadow: isHovered ? `0 0 10px ${brand.color}50` : 'none' }}
                  >
                    {brand.name}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Gradient overlays for smooth fading edges */}
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#08080A] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#08080A] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default MarqueeBanner;