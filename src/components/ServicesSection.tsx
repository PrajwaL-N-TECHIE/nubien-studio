import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import {
  ArrowUpRight, Cloud, MessageCircle, TrendingUp,
  Eye, Mic, Zap, PenLine, Lock, Layers,
  Database, BarChart2, User, Target, LineChart, Sparkles,
  ChevronRight, Cpu, Globe, Shield, Brain, CheckCircle2, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

// --------------------------------------------------------------------------
// DATA
// --------------------------------------------------------------------------
const serviceVision = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop";
const serviceSpeech = "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&auto=format&fit=crop";
const serviceAutomation = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";

const mainServices = [
  { icon: Cloud, title: "AI-Powered Development", subtitle: "Smart Websites", description: "Build intelligent web applications and digital experiences powered by cutting-edge AI.", stats: ["98% efficiency", "50+ projects"] },
  { icon: MessageCircle, title: "AI Chatbots", subtitle: "24/7 Support", description: "Deploy smart conversational AI agents to handle customer queries around the clock.", stats: ["24/7 availability", "10k+ conversations"] },
  { icon: TrendingUp, title: "Predictive Analytics", subtitle: "Driven Decisions", description: "Harness machine learning to forecast trends and make data-driven business decisions.", stats: ["95% accuracy", "real-time insights"] },
];

const detailServices = [
  { icon: Eye, title: "Computer Vision", subtitle: "World Through AI", description: "AI-based facial recognition, image analysis, and automation solutions for enterprises.", image: serviceVision, metrics: ["99.9% accuracy", "50ms latency"] },
  { icon: Mic, title: "Speech Recognition", subtitle: "Smart Actions", description: "Develop voice assistants, transcriptions, and speech-to-text with advanced AI models.", image: serviceSpeech, metrics: ["50+ languages", "95% accuracy"] },
  { icon: Zap, title: "AI Automation", subtitle: "Driven Decisions", description: "Automate complex workflows, reduce costs, and improve productivity with intelligent solutions.", image: serviceAutomation, metrics: ["80% cost reduction", "24/7 operation"] },
];

const capabilityTags = [
  { icon: PenLine, label: "Content Generation", color: "#8b5cf6" },
  { icon: Lock, label: "Cybersecurity", color: "#ec4899" },
  { icon: Layers, label: "UX/UI Optimization", color: "#3b82f6" },
  { icon: Database, label: "Data Insight", color: "#10b981" },
  { icon: BarChart2, label: "Analytics", color: "#f59e0b" },
  { icon: User, label: "Personalization", color: "#8b5cf6" },
  { icon: Target, label: "Data Analysis", color: "#ef4444" },
  { icon: LineChart, label: "Lead Generation", color: "#8b5cf6" },
  { icon: Brain, label: "Deep Learning", color: "#a855f7" },
  { icon: Cpu, label: "Edge AI", color: "#3b82f6" },
  { icon: Globe, label: "Global Scale", color: "#10b981" },
  { icon: Shield, label: "Enterprise Security", color: "#ec4899" },
];

// --------------------------------------------------------------------------
// PREMIUM SPOTLIGHT CARD COMPONENT (Mouse tracking glow)
// --------------------------------------------------------------------------
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative group overflow-hidden bg-[#0C0C0E] border border-white/5 rounded-[32px] transition-colors hover:border-white/10 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// --------------------------------------------------------------------------
// MAIN SECTION
// --------------------------------------------------------------------------
const ServicesSection = () => {
  const containerRef = useRef(null);

  // Advanced Scroll Physics mapping
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax Values
  const bannerY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const bannerScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  // Staggered grid parallax (middle column moves slightly differently)
  const gridYOuter = useTransform(scrollYProgress, [0.2, 0.8], [100, -100]);
  const gridYInner = useTransform(scrollYProgress, [0.2, 0.8], [150, -150]);

  const tagsRef = useRef(null);
  const tagsInView = useInView(tagsRef, { once: true, margin: "-50px" });

  return (
    <section ref={containerRef} id="services" className="relative py-32 overflow-hidden bg-[#050507]">

      {/* Absolute Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
        />
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* PARALLAX HERO BANNER */}
      {/* -------------------------------------------------------------------------- */}
      <motion.div
        style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
        className="relative max-w-6xl mx-auto rounded-[40px] py-24 px-6 text-center mb-24 overflow-hidden border border-white/10 z-10 bg-[#0A0A0C]/50 backdrop-blur-3xl"
      >
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={14} className="text-purple-400" />
            </motion.div>
            <span className="text-sm font-medium text-zinc-300 tracking-wide uppercase">Enterprise Services</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-[5.5rem] font-semibold tracking-tight mb-2 text-white leading-tight"
          >
            AI-Powered Services
          </motion.h2>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-[5.5rem] font-semibold tracking-tight mb-8"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500">
              for Future Brands.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-zinc-400 font-light"
          >
            We deploy cutting-edge neural networks and intelligent automation to transform how your enterprise operates and scales.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">

        {/* -------------------------------------------------------------------------- */}
        {/* TOP TIER CARDS (With Scroll Parallax) */}
        {/* -------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {mainServices.map((service, i) => {
            // Apply different scroll speeds to outer vs inner columns
            const yTransform = i === 1 ? gridYInner : gridYOuter;

            return (
              <motion.div key={i} style={{ y: yTransform }} className="h-full">
                <SpotlightCard className="p-8 h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/5 to-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                      <service.icon size={22} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-y-4 translate-x-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-out border border-white/5">
                      <ArrowUpRight size={18} className="text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold mb-2 text-white tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-500/80 mb-6">{service.subtitle}</p>
                  <p className="text-base text-zinc-400 leading-relaxed mb-8 flex-grow">{service.description}</p>

                  <div className="flex gap-4 pt-6 border-t border-white/5 mt-auto">
                    {service.stats.map((stat, idx) => (
                      <div key={idx} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-300">
                        {stat}
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* -------------------------------------------------------------------------- */}
        {/* BOTTOM TIER CARDS (With Cinematic Image Reveals) */}
        {/* -------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {detailServices.map((service, i) => {
            const yTransform = i === 1 ? gridYOuter : gridYInner; // Alternate parallax pattern

            return (
              <motion.div key={i} style={{ y: yTransform }} className="h-full">
                <SpotlightCard className="p-8 h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all duration-500">
                      <service.icon size={22} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold mb-2 text-white tracking-tight">{service.title}</h3>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-500/80 mb-6">{service.subtitle}</p>
                  <p className="text-base text-zinc-400 leading-relaxed mb-8 flex-grow">{service.description}</p>

                  {/* Cinematic Image Container */}
                  <div className="relative rounded-[20px] overflow-hidden h-48 w-full mt-auto border border-white/10 group-hover:border-purple-500/30 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent z-10 opacity-80" />

                    {/* Grayscale to color transition on hover */}
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform scale-110 filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out"
                    />

                    {/* Hover Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <div className="flex flex-col gap-2">
                        {service.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <CheckCircle2 size={12} className="text-purple-400" />
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* -------------------------------------------------------------------------- */}
        {/* PREMIUM FLOATING CAPABILITY TAGS */}
        {/* -------------------------------------------------------------------------- */}
        <div ref={tagsRef} className="flex flex-col items-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={tagsInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={tagsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-10"
          >
            Full Stack Capabilities
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 max-w-5xl">
            {capabilityTags.map((tag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={tagsInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.03, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                className="group flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium cursor-pointer bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-all shadow-lg backdrop-blur-sm"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: `${tag.color}20` }}
                >
                  <tag.icon size={12} style={{ color: tag.color }} className="group-hover:scale-110 transition-transform" />
                </div>
                {tag.label}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tagsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20"
          >
            <Link to="/portfolio" className="relative px-8 py-4 rounded-full bg-white text-[#050507] font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              View Full Architecture
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;