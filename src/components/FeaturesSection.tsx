import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Shield, Mic, Activity, Eye, Layers, BarChart } from "lucide-react";

const featureCards = [
  {
    icon: Zap,
    title: "Seamless API Integrations",
    description: "Nubien supports a wide range of third-party integrations.",
    visual: "api",
  },
  {
    icon: Shield,
    title: "Trusted Authentication",
    description: "Quickly integrate with major platforms to workflows.",
    visual: "auth",
  },
  {
    icon: Mic,
    title: "AI-Speech Recognition",
    description: "Enable your user to control or navigate your site using speech.",
    visual: "speech",
  },
];

const miniFeatures = [
  { icon: Activity, label: "Real-Time Data", desc: "Instant insights for faster decision-making." },
  { icon: Eye, label: "Vision Capabilities", desc: "AI-powered image and video recognition." },
  { icon: Layers, label: "Optimized UX/UI", desc: "Smart design that enhances user experience." },
  { icon: BarChart, label: "Predictive Analytics", desc: "Make data-driven decisions with AI insights." },
];

const ApiVisual = () => (
  <div className="p-4 rounded-xl mt-4" style={{ background: "hsl(240 10% 6%)" }}>
    <div className="flex items-center gap-3 mb-4">
      {["🍎", "⚡", "📦", "◆", "❋", "✓"].map((icon, i) => (
        <span key={i} className="text-lg">{icon}</span>
      ))}
    </div>
    <div className="flex flex-col items-center gap-1">
      <div className="w-px h-8" style={{ background: "hsl(var(--primary) / 0.5)" }} />
      <div className="w-px h-6" style={{ background: "hsl(var(--primary) / 0.3)" }} />
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary))" }}>
        <Layers size={14} className="text-white" />
      </div>
    </div>
  </div>
);

const AuthVisual = () => (
  <div className="p-4 rounded-xl mt-4 overflow-hidden relative" style={{ background: "hsl(240 10% 6%)", height: "120px" }}>
    <div className="flex flex-wrap gap-2 opacity-60">
      {["Intelligent", "Cognitive", "Data Analysis", "Infrastructure", "Capabilities", "Chatbots", "Intelligence"].map((tag, i) => (
        <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}>{tag}</span>
      ))}
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary))" }}>
        <Shield size={18} className="text-white" />
      </div>
    </div>
  </div>
);

const SpeechVisual = () => (
  <div className="p-4 rounded-xl mt-4" style={{ background: "hsl(240 10% 6%)" }}>
    <div className="mb-3">
      <span className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ background: "hsl(var(--primary))", color: "white" }}>
        Speech Recognition
      </span>
    </div>
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "hsl(240 10% 4%)" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--muted))" }}>
        <Mic size={14} style={{ color: "hsl(var(--primary))" }} />
      </div>
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-full"
            style={{ background: "hsl(var(--muted-foreground))", minHeight: "4px" }}
            animate={{ height: [`${Math.random() * 16 + 4}px`, `${Math.random() * 16 + 4}px`, `${Math.random() * 16 + 4}px`] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  </div>
);

const orbPositions = [
  { top: "10%", left: "35%", size: 80, rotate: "-10deg" },
  { top: "5%", left: "44%", size: 90, rotate: "5deg" },
  { top: "8%", left: "54%", size: 80, rotate: "12deg" },
  { top: "20%", left: "62%", size: 85, rotate: "20deg" },
  { top: "20%", left: "26%", size: 75, rotate: "-20deg" },
  { top: "40%", left: "68%", size: 80, rotate: "28deg" },
  { top: "45%", left: "16%", size: 70, rotate: "-30deg" },
  { top: "60%", left: "72%", size: 75, rotate: "38deg" },
  { top: "65%", left: "8%", size: 65, rotate: "-42deg" },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const cardsRef = useRef(null);
  const miniRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px" });
  const miniInView = useInView(miniRef, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Orbiting images visual */}
        <div className="relative h-64 mb-16 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-3xl h-64">
              {orbPositions.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "backOut" }}
                  className="absolute rounded-2xl overflow-hidden"
                  style={{
                    top: item.top,
                    left: item.left,
                    width: item.size,
                    height: item.size,
                    transform: `rotate(${item.rotate})`,
                    background: `hsl(${260 + i * 10} 30% ${15 + i * 3}%)`,
                    border: "2px solid hsl(var(--border))",
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, hsl(${260 + i * 20} 40% 20%), hsl(${280 + i * 10} 20% 10%))`,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="badge-pill inline-flex mb-6"
          >
            <span className="badge-dot">
              <div className="w-2 h-2 rounded-full border border-white/60" />
            </span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-light mb-4"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Packed with Innovation.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base max-w-md mx-auto"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Nubien is packed with cutting-edge features designed to elevate your agency or portfolio.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 px-8 py-4 rounded-2xl text-sm font-semibold"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            Book an Appointment
          </motion.button>
        </div>

        {/* Feature Cards — staggered */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {featureCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={cardsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="card-dark p-8 rounded-2xl"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6 mx-auto"
                style={{ background: "hsl(var(--primary))" }}
              >
                <card.icon size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3" style={{ color: "hsl(var(--foreground))" }}>
                {card.title}
              </h3>
              <p className="text-sm text-center mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                {card.description}
              </p>
              {card.visual === "api" && <ApiVisual />}
              {card.visual === "auth" && <AuthVisual />}
              {card.visual === "speech" && <SpeechVisual />}
            </motion.div>
          ))}
        </div>

        {/* Mini Features Grid — staggered */}
        <div ref={miniRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {miniFeatures.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={miniInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <feat.icon size={16} style={{ color: "hsl(var(--foreground))" }} />
                <span className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  {feat.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
