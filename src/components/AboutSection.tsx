import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "150+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "AI Models Deployed" },
  { value: "24/7", label: "Support Available" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  const words = "Built on creativity, collaboration, and top excellence, SYNC is a dynamic team".split(" ");
  const fadedWords = "of industry experts committed to achieving exceptional great results...".split(" ");

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-32"
    >
      {/* Parallax glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-0 left-0 right-0 h-80 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5 }}
          className="w-full h-full"
          style={{
            background: "radial-gradient(ellipse 100% 60% at 50% 0%, hsl(262 83% 40% / 0.5) 0%, transparent 80%)",
          }}
        />
      </motion.div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${12.5 * (i + 1)}%`,
              background: "hsl(var(--foreground))",
              transformOrigin: "left",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30 - i * 5, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: "hsl(var(--primary))",
            top: `${20 + i * 12}%`,
            left: `${10 + i * 16}%`,
            boxShadow: "0 0 6px hsl(262 83% 58% / 0.4)",
          }}
        />
      ))}

      <motion.div style={{ opacity: textOpacity }} ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="badge-pill"
        >
          <span className="badge-dot">
            <div className="w-2 h-2 rounded-full border border-white/60" />
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>About Us</span>
        </motion.div>

        {/* Headline with word-by-word animation */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-tight tracking-[-0.02em]">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
              className="inline-block mr-[0.25em]"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {word}
            </motion.span>
          ))}
          {fadedWords.map((word, i) => (
            <motion.span
              key={`faded-${i}`}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: 0.5 + words.length * 0.04 + i * 0.05 }}
              className="inline-block mr-[0.25em]"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(262 83% 58% / 0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 px-8 py-4 rounded-2xl text-sm font-semibold transition-shadow"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Book an Appointment
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 w-full"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.2 + i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-2xl"
              style={{
                background: "hsl(var(--surface) / 0.5)",
                border: "1px solid hsl(var(--border))",
                backdropFilter: "blur(8px)",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="text-3xl md:text-4xl font-extralight mb-1"
                style={{ color: "hsl(var(--primary))" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
