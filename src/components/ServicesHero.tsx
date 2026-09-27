import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  Rocket,
  Handshake,
  CheckCircle2,
  ShieldCheck,
  Zap
} from "lucide-react";
import Magnetic from "./Magnetic";

const fourDomainsList = [
  {
    number: "01",
    name: "Edutech",
    subtitle: "Paid Internships & Academies",
    desc: "Hands-on production internships, trend webinars, school student coding classes, and university guest lectures.",
    icon: GraduationCap,
    target: "edutech-deepdive",
    accent: "#a855f7"
  },
  {
    number: "02",
    name: "IT & Consulting",
    subtitle: "Custom Web & AI Funnels",
    desc: "Bespoke high-performance web platforms, automated AI marketing funnels, and enterprise process automation.",
    icon: Layers,
    target: "services",
    accent: "#3b82f6"
  },
  {
    number: "03",
    name: "Proprietary Products",
    subtitle: "Markeee & BizBrain",
    desc: "Markeee (autonomous AI marketing platform replacing agencies) and BizBrain (WhatsApp-native SME finance in 12+ languages).",
    icon: Rocket,
    target: "products-deepdive",
    accent: "#d946ef"
  },
  {
    number: "04",
    name: "Venture Collaborations",
    subtitle: "Profit-Sharing Dev Team",
    desc: "Acting as your dedicated in-house backend and engineering team to convert your idea into a product on a profit-sharing basis.",
    icon: Handshake,
    target: "venture-collaborations",
    accent: "#10b981"
  }
];

export default function ServicesHero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-12 pb-24 px-6 overflow-hidden bg-[#050507] text-white">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-xl"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-300 font-mono">
              Buildicy Capabilities & Domains
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 font-['Syne'] leading-[1.08]"
          >
            Engineered for Builders, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-zinc-400 italic">
              Brands & Future Innovators.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Buildicy operates as an integrated technological ecosystem across four specialized domains: from career-defining paid internships and enterprise AI consulting, to proprietary SaaS products and risk-aligned venture partnerships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <Magnetic strength={0.2} scale={1.03}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                className="px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-[0_0_35px_rgba(168,85,247,0.4)] border border-purple-400/40 cursor-pointer"
              >
                Start a Conversation
                <ArrowRight size={18} />
              </button>
            </Magnetic>

            <button
              onClick={() => scrollTo("products-deepdive")}
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-sm sm:text-base flex items-center gap-3 border border-white/10 transition-colors cursor-pointer"
            >
              Explore Markeee & BizBrain
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        {/* 4 Interactive Domain Quick Jump Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {fourDomainsList.map((domain, i) => {
            const Icon = domain.icon;

            return (
              <motion.div
                key={domain.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                onClick={() => scrollTo(domain.target)}
                className="p-6 md:p-7 rounded-[28px] bg-[#0C0C12]/80 border border-white/5 hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                      <Icon size={22} />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {domain.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors font-['Syne']">
                    {domain.name}
                  </h3>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400/80 mb-3">
                    {domain.subtitle}
                  </p>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light mb-6">
                    {domain.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span>Explore Domain</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
