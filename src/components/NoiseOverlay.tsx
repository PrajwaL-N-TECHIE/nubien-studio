import { motion } from "framer-motion";
import { usePerformance } from "@/context/PerformanceContext";

const NoiseOverlay = () => {
  const { isLowEnd } = usePerformance();

  if (isLowEnd) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.04 }}
      className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden"
    >
      <div
        className="absolute inset-[-200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.4] mix-blend-overlay animate-noise"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
        .animate-noise {
          animation: noise 0.2s infinite;
        }
      `}} />
    </motion.div>
  );
};

export default NoiseOverlay;
