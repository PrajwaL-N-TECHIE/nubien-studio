import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO, NexaFlow",
    quote: "Nubien transformed our entire data pipeline with AI. The results exceeded every expectation we had.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Founder, PixelMind",
    quote: "Their computer vision solution automated 80% of our quality control. Absolutely game-changing.",
    rating: 5,
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "VP Engineering, Synapse",
    quote: "The chatbot they built handles 10k daily conversations seamlessly. Best investment we've made.",
    rating: 5,
    avatar: "EW",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6">
      <div ref={ref} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="badge-pill inline-flex mb-6">
            <span className="badge-dot"><div className="w-2 h-2 rounded-full border border-white/60" /></span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Testimonials</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-light mb-3"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Trusted by Industry
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-4xl md:text-6xl font-light"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Leaders Worldwide.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className="relative p-8 rounded-3xl overflow-hidden backdrop-blur-sm"
              style={{
                background: "linear-gradient(135deg, hsl(240 10% 10% / 0.8), hsl(262 20% 12% / 0.6))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 8px 32px hsl(0 0% 0% / 0.3)",
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: "hsl(var(--primary))" }}
              />

              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="hsl(45 100% 60%)" style={{ color: "hsl(45 100% 60%)" }} />
                ))}
              </div>

              <p className="text-base leading-relaxed mb-8 relative z-10" style={{ color: "hsl(var(--foreground) / 0.9)" }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 relative z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "hsl(var(--primary))", color: "white" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
