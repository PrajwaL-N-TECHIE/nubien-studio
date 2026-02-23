import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-[#12121A]/60 border border-white/10 backdrop-blur-xl shadow-xl transition-colors duration-300 hover:border-purple-500/50 group"
      aria-label="Toggle theme"
    >
      {/* Phantom Inner Glow on Hover */}
      <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-md" />
      
      {/* 3D Spring Icon Reveal */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0, scale: 0.3 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.3 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20, 
            mass: 0.8 
          }}
          className="relative z-10 text-zinc-400 group-hover:text-purple-400 transition-colors duration-300"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;