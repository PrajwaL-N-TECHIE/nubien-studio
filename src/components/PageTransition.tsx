import { motion } from "framer-motion";
import { ReactNode } from "react";

const customEase = [0.76, 0, 0.24, 1];

const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative w-full">
      {/* SHUTTER CURTAIN EFFECT */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: customEase }}
        className="fixed inset-0 z-[100] bg-[#050507] origin-top pointer-events-none"
      />

      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: customEase, delay: 0.1 }}
        className="fixed inset-0 z-[100] bg-[#0C0C0E] origin-bottom pointer-events-none"
      />

      {/* CONTENT REVEAL */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -20, scale: 1.02, filter: "blur(10px)" }}
        transition={{ duration: 0.8, ease: customEase }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;