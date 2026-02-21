import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const ThreeScene = lazy(() => import("@/components/ThreeScene"));

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20">
      {/* Three.js Background */}
      <Suspense fallback={null}>
        <ThreeScene />
      </Suspense>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-0 right-0 h-[70%]"
          style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 100%, hsl(262 83% 40% / 0.6) 0%, transparent 70%)",
          }}
        />
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              x: [0, Math.sin(i) * 10, 0],
            }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: "hsl(var(--primary))",
              top: `${20 + i * 15}%`,
              left: `${15 + i * 18}%`,
              boxShadow: "0 0 8px hsl(262 83% 58% / 0.5)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="badge-pill"
        >
          <span className="badge-dot">
            <span className="text-xs font-bold text-white">25</span>
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            2025
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>Next-Gen AI Studio</span>
        </motion.div>

        {/* Headline with character animation */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-extralight leading-[1.05] tracking-[-0.03em]"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <motion.span
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="block"
          >
            AI-Driven Success
          </motion.span>
          <motion.span
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="block bg-clip-text"
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--muted-foreground)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Redefining the Future.
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-base md:text-lg max-w-md leading-relaxed"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Creating latest solutions that redefine innovation.
          <br />
          Stay ahead with AI-powered technology for the future.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex items-center gap-4 mt-2"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px hsl(262 83% 58% / 0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-300"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            Connect With Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px hsl(262 83% 58% / 0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-300"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            What is Nubien?
          </motion.button>
        </motion.div>
      </div>

      {/* Brand logos strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-12"
      >
        {["FLUX", "OOO", "BOOO", "REI"].map((brand, i) => (
          <motion.span
            key={brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.1 }}
            className="text-sm font-bold tracking-widest"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {brand}
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
};

export default HeroSection;
