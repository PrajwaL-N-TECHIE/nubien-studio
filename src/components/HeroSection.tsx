import { motion } from "framer-motion";
import heroOrb from "@/assets/hero-orb.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 h-[65%]"
          style={{
            backgroundImage: `url(${heroOrb})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage: "radial-gradient(ellipse 90% 80% at 50% 100%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 100%, black 30%, transparent 80%)",
          }}
        />
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full"
          style={{ background: "hsl(var(--foreground))" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight"
          style={{ color: "hsl(var(--foreground))" }}
        >
          AI-Driven Success
          <br />
          Redefining the Future.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
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
          transition={{ duration: 0.6, delay: 0.85 }}
          className="flex items-center gap-4 mt-2"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-colors duration-200"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
            }}
          >
            Connect With Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-colors duration-200"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
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
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-12"
      >
        {["FLUX", "OOO", "BOOO", "REI"].map((brand, i) => (
          <motion.span
            key={brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
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
