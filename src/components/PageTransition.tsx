import { motion } from "framer-motion";
import { ReactNode } from "react";

const customEase = [0.76, 0, 0.24, 1]; // More aggressive, sophisticated curve

const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* OUT OF THE BOX: Overlay Panels 
         These panels sweep across the screen during the transition
      */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{
              duration: 0.6,
              ease: customEase,
              delay: i * 0.05,
            }}
            className="w-full h-[33.4vh] bg-[#0C0C0E] origin-top border-b border-white/5"
          />
        ))}
      </div>
      
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`in-${i}`}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 0 }}
            transition={{
              duration: 0.6,
              ease: customEase,
              delay: i * 0.05 + 0.4, // Delays the "reveal" until panels are closed
            }}
            className="w-full h-[33.4vh] bg-[#0C0C0E] origin-bottom border-t border-white/5"
          />
        ))}
      </div>

      {/* THE CONTENT: 
         We add a subtle "zoom-out" and "zoom-in" effect 
      */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
        transition={{ duration: 0.9, ease: customEase }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;