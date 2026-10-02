import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Cpu,
  Calculator,
  GraduationCap,
  Rocket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Magnetic from "./Magnetic";

const customEase = [0.22, 1, 0.36, 1] as const;

const capabilityPillars = [
  {
    icon: Cpu,
    tag: "AI & Automation",
    title: "Custom AI Engineering & Autonomous Ops",
    description:
      "We build tailored Generative AI pipelines, custom LLM integrations, and autonomous sales SDR agents that qualify leads, enrich prospect intelligence, and automate manual business friction 24/7.",
    linkPath: "/services",
    linkText: "Explore Custom AI Services",
    keywords: ["AI Automation Agency India", "Custom LLM Development", "Autonomous AI SDR"],
  },
  {
    icon: Calculator,
    tag: "SaaS Replacement",
    title: "Full-Stack SaaS vs Subscription Bloat",
    description:
      "Stop bleeding thousands of dollars every month on fragmented SaaS tools. We engineer bespoke, production-ready web platforms using React, Next.js, and Supabase that your company owns forever.",
    linkPath: "/roi-calculator",
    linkText: "Calculate Your Software ROI",
    keywords: ["SaaS vs Custom Software", "Build vs Buy Software", "SaaS Cost Reduction"],
  },
  {
    icon: GraduationCap,
    tag: "Edutech & Training",
    title: "Campus Masterclasses & Paid Internships",
    description:
      "Over 2,500+ students and MBA cohorts have been trained by Buildicy leadership in modern Generative AI and production engineering. We also offer paid, stipend-backed developer mentorships.",
    linkPath: "/reviews",
    linkText: "Read Verified Student Reviews",
    keywords: ["Paid AI Internships Coimbatore", "Gen AI Masterclasses", "MBA AI Workshops"],
  },
  {
    icon: Rocket,
    tag: "Venture Engineering",
    title: "Aligned Venture Building & Profit-Sharing",
    description:
      "We partner directly with high-potential founders as their dedicated technical co-founders on a profit-sharing basis, rapidly launching production MVPs like Markeee and BizBrain with zero tech debt.",
    linkPath: "/portfolio",
    linkText: "Browse Shipped Portfolio",
    keywords: ["Venture Studio Profit-Sharing", "MVP Development Agency", "Proprietary SaaS Products"],
  },
];

const WhyBuildicySection = () => {
  return (
    <section
      id="why-choose-buildicy"
      aria-labelledby="why-buildicy-heading"
      className="relative py-28 px-6 bg-[#050507] text-white overflow-hidden border-t border-b border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl mb-4"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-300">
              Topical Authority • Engineering Excellence
            </span>
          </motion.div>

          <motion.h2
            id="why-buildicy-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: customEase }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Syne'] mb-6"
          >
            Why Industry Leaders & Universities{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
              Choose Buildicy
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light"
          >
            Headquartered in Coimbatore, Tamil Nadu, Buildicy operates at the intersection of
            custom AI engineering, enterprise SaaS architectures, and transformative academic masterclasses.
            We eliminate software bloat and accelerate digital growth with measurable ROI.
          </motion.p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {capabilityPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: customEase }}
                className="group relative p-8 rounded-3xl bg-[#09090F] border border-white/10 hover:border-purple-500/40 transition-all duration-500 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-['Syne'] text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-light mb-6">
                    {pillar.description}
                  </p>

                  {/* Target Keyword Tags for Semantic Indexing */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {pillar.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-zinc-500 font-mono"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Link
                    to={pillar.linkPath}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group/link"
                  >
                    <span>{pillar.linkText}</span>
                    <ArrowRight
                      size={15}
                      className="group-hover/link:translate-x-1.5 transition-transform"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Semantic Proven Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-8 rounded-3xl bg-gradient-to-r from-[#0E0E18] to-[#121222] border border-white/10 flex flex-wrap items-center justify-around gap-6 text-center"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Syne'] mb-1">
              50+
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 font-medium">
              Web Applications & AI Funnels Shipped
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-['Syne'] mb-1">
              2,500+
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 font-medium">
              Students & MBA Candidates Trained
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-['Syne'] mb-1">
              80%
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 font-medium">
              Average SaaS Overhead Reduced
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-['Syne'] mb-1">
              100%
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 font-medium">
              Verified Ownership & Zero Tech Debt
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyBuildicySection;
