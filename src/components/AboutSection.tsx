import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const words = "Built on creativity, collaboration, and top excellence, SYNC is a dynamic team".split(" ");
  const fadedWords = "of industry experts committed to achieving exceptional great results...".split(" ");

  return (
    <section
      id="about"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-32"
    >
      {/* Purple glow top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 0%, hsl(262 83% 40% / 0.5) 0%, transparent 80%)",
        }}
      />

      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full"
        style={{ background: "hsl(var(--foreground))" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="badge-pill"
        >
          <span className="badge-dot">
            <div className="w-2 h-2 rounded-full border border-white/60" />
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>About Us</span>
        </motion.div>

        {/* Headline with word-by-word animation */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.04 }}
              className="inline-block mr-[0.25em]"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {word}
            </motion.span>
          ))}
          {fadedWords.map((word, i) => (
            <motion.span
              key={`faded-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + words.length * 0.04 + i * 0.05 }}
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 px-8 py-4 rounded-2xl text-sm font-semibold"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Book an Appointment
        </motion.button>
      </div>
    </section>
  );
};

export default AboutSection;
