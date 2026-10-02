import { motion } from "framer-motion";
import { Check, X, Shield, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ComparisonRow {
  feature: string;
  category: string;
  buildicy: string;
  saas: string;
  traditional: string;
  isHighlight?: boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Code & Intellectual Property (IP) Ownership",
    category: "Asset Control",
    buildicy: "100% Client-Owned (Full Git & database ownership transferred)",
    saas: "0% (Rented proprietary license with total platform lock-in)",
    traditional: "Often retained by agency or bound to proprietary frameworks",
    isHighlight: true,
  },
  {
    feature: "Ongoing Monthly Licensing Overhead",
    category: "Cost Structure",
    buildicy: "$0 / month (Pay once for engineering; host cheaply on your AWS/Vercel)",
    saas: "$500 – $5,000+ / month (Compounding per-user seat taxes)",
    traditional: "Heavy mandatory monthly retainers ($3k–$10k/mo)",
    isHighlight: true,
  },
  {
    feature: "Custom AI & Neural Agent Architecture",
    category: "AI Capabilities",
    buildicy: "Private vector databases, fine-tuned LLMs & autonomous multi-agent pipelines",
    saas: "Generic pre-packaged chatbots with zero data autonomy",
    traditional: "Basic OpenAI API wrapper scripts without deep optimization",
  },
  {
    feature: "Speed to Production & First MVP",
    category: "Velocity",
    buildicy: "14 – 30 Days (Rapid prototyping with daily working builds)",
    saas: "Instant sign-up, but 3-6 months to adapt complex business operations",
    traditional: "4 – 9 Months (Slow waterfall documentation and bloated sprints)",
  },
  {
    feature: "Workflow Customization & Ergonomics",
    category: "Operational Fit",
    buildicy: "Bespoke engineering mapped pixel-for-pixel to your company's processes",
    saas: "Rigid templates forcing your staff to adopt awkward workarounds",
    traditional: "Customized, but requires paid change-orders for minor tweaks",
  },
  {
    feature: "Venture Alignment & Co-Development",
    category: "Business Model",
    buildicy: "Aligned profit-sharing & equity partnership options available",
    saas: "Zero alignment (Strict recurring vendor billings)",
    traditional: "Incentivized to inflate billable hours rather than drive revenue",
    isHighlight: true,
  },
];

const AgencyComparisonTable = () => {
  return (
    <section className="relative py-28 px-6 bg-[#050507] overflow-hidden border-t border-white/5">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <Shield size={13} className="text-purple-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 font-['DM_Mono']">
              Commercial Intelligence
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-['Syne'] leading-[1.1] mb-6"
          >
            Why High-Growth Teams Choose <br />
            <span className="bg-gradient-to-r from-purple-400 via-white to-purple-200 bg-clip-text text-transparent italic">
              Buildicy Custom Software
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-base md:text-lg leading-relaxed"
          >
            Compare the long-term enterprise value of company-owned bespoke architecture versus generic recurring SaaS subscriptions and slow legacy agencies.
          </motion.p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-[#0A0A10]/70 backdrop-blur-2xl shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 md:p-8 text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 w-1/3">
                  Capability & Value Vector
                </th>
                <th className="p-6 md:p-8 text-xs font-mono font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 border-x border-purple-500/20 w-1/3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>Buildicy AI Studio</span>
                  </div>
                </th>
                <th className="p-6 md:p-8 text-xs font-mono font-bold tracking-widest uppercase text-zinc-500 w-1/3">
                  Generic Commercial SaaS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm md:text-base">
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors duration-200 hover:bg-white/[0.02] ${
                    row.isHighlight ? "bg-white/[0.01]" : ""
                  }`}
                >
                  {/* Feature & Category */}
                  <td className="p-6 md:p-8 align-top">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400/80 mb-1">
                      {row.category}
                    </div>
                    <div className="text-white font-semibold font-['Plus_Jakarta_Sans'] leading-snug">
                      {row.feature}
                    </div>
                  </td>

                  {/* Buildicy Column (Hero highlighted) */}
                  <td className="p-6 md:p-8 align-top bg-purple-500/[0.04] border-x border-purple-500/20">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-purple-300" />
                      </div>
                      <span className="text-zinc-200 font-medium leading-relaxed">
                        {row.buildicy}
                      </span>
                    </div>
                  </td>

                  {/* SaaS Column */}
                  <td className="p-6 md:p-8 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={12} className="text-zinc-400" />
                      </div>
                      <span className="text-zinc-400 leading-relaxed">
                        {row.saas}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-10 p-6 md:p-8 rounded-[24px] bg-gradient-to-r from-purple-900/20 via-black to-blue-900/20 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg md:text-xl font-bold text-white font-['Syne'] mb-1">
              Ready to replace recurring subscription bloat with bespoke software?
            </h4>
            <p className="text-zinc-400 text-sm">
              Model your company's exact 3-year savings using our interactive cost calculator.
            </p>
          </div>
          <Link
            to="/roi-calculator"
            className="shrink-0 px-6 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center gap-2 group"
          >
            <span>Launch ROI Calculator</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AgencyComparisonTable;
