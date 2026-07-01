import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center gap-8 px-4">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-purple-500/20 rounded-2xl flex items-center justify-center relative">
          <div className="absolute inset-0 border-2 border-purple-500 rounded-2xl animate-ping opacity-20" />
          <motion.div
            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-64">
        <div className="h-4 bg-white/5 rounded-full animate-pulse" />
        <div className="h-4 bg-white/5 rounded-full animate-pulse w-3/4" />
        <div className="h-4 bg-white/5 rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
};

export default PageLoader;
