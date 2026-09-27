import { motion } from "framer-motion";
import {
  Handshake,
  DollarSign,
  Rocket,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Building2,
  Workflow,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import Magnetic from "./Magnetic";

const comparisonRows = [
  {
    parameter: "Upfront Cost & Risk",
    traditional: "Heavy fixed retainers ($20k-$80k) with zero revenue guarantee",
    inhouse: "High recurring salaries, recruiter fees & equipment overhead",
    buildicy: "Aligned profit-sharing basis • Zero bloated upfront retainer",
    highlight: true,
  },
  {
    parameter: "Time to Production MVP",
    traditional: "3 to 6 months with slow waterfall change requests",
    inhouse: "2 to 4 months just to recruit and onboard engineers",
    buildicy: "Rapid 3 to 6 week sprint to market-ready product",
    highlight: true,
  },
  {
    parameter: "Skin in the Game",
    traditional: "None — they get paid whether your product succeeds or fails",
    inhouse: "Employees get paid fixed salary regardless of revenue",
    buildicy: "100% aligned — we only profit when your product thrives",
    highlight: true,
  },
  {
    parameter: "Technical Ownership",
    traditional: "Hands off code after final milestone; extra fees for maintenance",
    inhouse: "Dependent on single developers who may leave anytime",
    buildicy: "Complete backend, DevOps & scaling continuity 24/7",
    highlight: false,
  },
];

const sprintPhases = [
  {
    phase: "Phase 01",
    title: "Venture Alignment & Architecture",
    duration: "Week 1",
    desc: "We analyze your business model, customer demand, technical scope, and database architecture to draft a lean, high-velocity roadmap.",
    icon: Building2,
  },
  {
    phase: "Phase 02",
    title: "Rapid Full-Stack MVP Engineering",
    duration: "Weeks 2 - 4",
    desc: "Our engineers build the complete production software — modern React/Next.js frontend, scalable cloud backend, API pipelines, and secure authentication.",
    icon: Rocket,
  },
  {
    phase: "Phase 03",
    title: "GTM, AI Funnels & Live Deployment",
    duration: "Weeks 5 - 6",
    desc: "We integrate automated lead funnels, payment gateways, analytics, and zero-downtime cloud hosting to launch the product to your market.",
    icon: Workflow,
  },
  {
    phase: "Phase 04",
    title: "Profit-Sharing Scale & Evolution",
    duration: "Ongoing",
    desc: "We remain your dedicated technology department, maintaining infrastructure and shipping new features while sharing in product revenue.",
    icon: DollarSign,
  },
];

export default function VentureCollaborationSection() {
  return (
    <section id="venture-collaborations" className="relative py-28 md:py-36 px-6 bg-[#050507] overflow-hidden text-white">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl mb-6 shadow-xl"
          >
            <Handshake size={14} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-300 font-mono">
              Domain 04 • Strategic Collaborations
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            Your Dedicated Dev Team. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-white">
              On an Aligned Profit-Sharing Basis.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light"
          >
            Founders and organizations often struggle with astronomical dev agency quotes or unreliable freelancers. Buildicy partners with you as your fractional engineering powerhouse — transforming your idea into a production-grade product on a profit-sharing model where our incentives are 100% aligned with your revenue.
          </motion.p>
        </div>

        {/* 4 SPRINT PHASES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {sprintPhases.map((phase, i) => {
            const PhaseIcon = phase.icon;

            return (
              <div
                key={phase.phase}
                className="p-7 rounded-[28px] bg-[#0C0C14] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md">
                      <PhaseIcon size={22} />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {phase.duration}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                    {phase.phase}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 font-['Syne']">
                    {phase.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light mb-6">
                    {phase.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Production Execution</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPARISON MATRIX CARD */}
        <div className="rounded-[36px] bg-[#0C0C14] border border-white/10 p-6 sm:p-10 md:p-12 shadow-2xl mb-16 overflow-hidden">
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-['Syne']">
              Why Founders Partner with Buildicy
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              See how our profit-sharing venture engineering model compares against traditional agencies and hiring.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-4 px-4 font-semibold">Parameter</th>
                  <th className="py-4 px-4 font-semibold text-zinc-500">Traditional Agency</th>
                  <th className="py-4 px-4 font-semibold text-zinc-500">In-House Hiring</th>
                  <th className="py-4 px-4 font-bold text-emerald-400 bg-emerald-500/10 rounded-t-xl">
                    Buildicy Venture Dev
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-5 px-4 font-medium text-white max-w-[200px]">
                      {row.parameter}
                    </td>
                    <td className="py-5 px-4 text-zinc-400 font-light max-w-[240px]">
                      <div className="flex items-start gap-2">
                        <XCircle size={15} className="text-zinc-600 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-zinc-400 font-light max-w-[240px]">
                      <div className="flex items-start gap-2">
                        <XCircle size={15} className="text-zinc-600 shrink-0 mt-0.5" />
                        <span>{row.inhouse}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-emerald-300 font-medium bg-emerald-500/[0.04] max-w-[280px]">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.buildicy}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pitch Callout */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-zinc-300 font-mono">
                Currently reviewing new venture co-development applications for Q4.
              </span>
            </div>

            <Magnetic strength={0.2} scale={1.03}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                className="px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400/40 cursor-pointer"
              >
                <span>Pitch Your Idea for Profit-Sharing</span>
                <ArrowRight size={16} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
