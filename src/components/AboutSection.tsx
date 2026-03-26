import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "500+", label: "Global Projects" },
  { value: "99.9%", label: "Uptime" },
  { value: "250+", label: "Happy Partners" },
  { value: "Zero", label: "Speed Bottlenecks" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);

  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isTextInView = useInView(textRef, { once: true, margin: "-50px" });
  const isStatsInView = useInView(statsRef, { once: true, margin: "-50px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effects
  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const textRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, 5]);

  // Floating elements parallax
  const particlesY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const particlesOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.2, 0.8, 0.8, 0.2]);

  // Grid lines parallax
  const gridSpeed = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Character reveal animation variants
  const charRevealVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.02,
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }),
  } as any;

  const words = "Built on trust, simple logic, and dedicated teamwork, Buildicy is a passionate team".split(" ");
  const fadedWords = "of engineering experts here to help you make a real impact in the world...".split(" ");

  // Split words into characters for advanced reveal
  const allWords = [...words, ...fadedWords];
  // characters is not used directly in the mapping below, but words/fadedWords are.

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-32 will-change-transform"
    >
      {/* Parallax glow with pulse effect */}
      <motion.div
        style={{ y: bgY, opacity: particlesOpacity }}
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

        {/* Secondary glow that follows scroll */}
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0]),
            background: "radial-gradient(ellipse 80% 40% at 50% 100%, hsl(262 83% 50% / 0.3) 0%, transparent 70%)",
          }}
          className="absolute bottom-0 left-0 right-0 h-60"
        />
      </motion.div>

      {/* Animated grid lines with scroll-based movement */}
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
              x: useTransform(scrollYProgress, [0, 1], [0, i % 2 === 0 ? 50 : -50]),
              opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]),
            }}
          />
        ))}

        {/* Vertical grid lines */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${20 * (i + 1)}%`,
              background: "hsl(var(--foreground))",
              transformOrigin: "top",
              y: useTransform(scrollYProgress, [0, 1], [0, i % 2 === 0 ? -30 : 30]),
            }}
          />
        ))}
      </div>

      {/* Floating particles with enhanced scroll effects */}
      <motion.div
        style={{ y: particlesY, opacity: particlesOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40 - i * 8, 0],
              x: [0, Math.sin(i) * 30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2 + i * 0.1, 1],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 3 === 0 ? "hsl(262 83% 58%)" : "hsl(262 83% 70%)",
              top: `${10 + i * 7}%`,
              left: `${5 + i * 8}%`,
              boxShadow: "0 0 12px hsl(262 83% 58% / 0.6)",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </motion.div>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-1/2 right-8 w-1 h-32 bg-white/10 rounded-full z-50 hidden lg:block"
        style={{
          y: "-50%",
        }}
      >
        <motion.div
          className="w-full bg-primary rounded-full"
          style={{
            height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
            background: "hsl(262 83% 58%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{
          opacity: textOpacity,
          scale: textScale,
          rotateX: textRotateX,
          perspective: 1000,
        }}
        ref={ref}
        className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8"
      >
        {/* Badge with advanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9, rotate: -5 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="badge-pill"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="badge-dot"
          >
            <div className="w-2 h-2 rounded-full border border-white/60" />
          </motion.span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>About Us • Est. 2026</span>
        </motion.div>

        {/* Advanced text reveal - Option 1: Character by character */}
        <div ref={textRef} className="relative">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-tight tracking-[-0.02em]">
            {words.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={charRevealVariants}
                initial="hidden"
                animate={isTextInView ? "visible" : "hidden"}
                className="inline-block mr-[0.25em]"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {word}
              </motion.span>
            ))}
            {fadedWords.map((word, i) => (
              <motion.span
                key={`faded-${i}`}
                custom={words.length + i}
                variants={charRevealVariants}
                initial="hidden"
                animate={isTextInView ? "visible" : "hidden"}
                className="inline-block mr-[0.25em]"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {word}
              </motion.span>
            ))}
          </h2>

          {/* Gradient overlay that follows scroll */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: useTransform(
                scrollYProgress,
                [0, 0.2, 0.8, 1],
                [
                  "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.1), transparent)",
                  "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3), transparent)",
                  "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3), transparent)",
                  "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.1), transparent)",
                ]
              ),
              filter: "blur(10px)",
            }}
          />
        </div>

        {/* CTA with hover and scroll effects */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
          className="mt-4 px-8 py-4 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          <span className="relative z-10">Book an Appointment</span>
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </button>

        {/* Stats with staggered reveal and scroll parallax */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 w-full"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isStatsInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 1.2 + i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="text-center p-4 rounded-2xl relative overflow-hidden group"
              style={{
                background: "hsl(var(--surface) / 0.5)",
                border: "1px solid hsl(var(--border))",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-primary/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="text-3xl md:text-4xl font-extralight mb-1 relative z-10"
                style={{ color: "hsl(var(--primary))" }}
              >
                {stat.value}
              </motion.div>
              <div
                className="text-xs font-medium relative z-10"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {stat.label}
              </div>

              {/* Animated underline on hover */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-primary rounded-full mt-2"
              animate={{
                y: [0, 4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutSection;