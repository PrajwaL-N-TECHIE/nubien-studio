import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Zap,
  Globe,
  Languages,
  ShieldCheck,
  TrendingUp,
  Bot,
  Receipt,
  Users,
  Layers,
  Cpu
} from "lucide-react";
import Magnetic from "./Magnetic";

export default function ProductsDeepDive() {
  return (
    <section id="products-deepdive" className="relative py-28 md:py-36 px-6 bg-[#08080C] overflow-hidden text-white border-t border-b border-white/5">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl mb-6 shadow-xl"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-300 font-mono">
              Domain 03 • Proprietary Products
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            Software Products <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-white">
              Built to Reinvent Industries.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light"
          >
            At Buildicy Labs, we don't just build client applications — we engineer industry-defining SaaS products that eliminate manual friction, replace bloated agency retainers, and democratize digital commerce.
          </motion.p>
        </div>

        {/* PRODUCT 1: MARKEEE */}
        <div className="rounded-[36px] md:rounded-[44px] bg-[#0C0C14] border border-white/10 p-8 sm:p-12 md:p-16 mb-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Proprietary Product #1
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Platform
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight font-['Syne']">
                Markeee
              </h3>
              <p className="text-lg sm:text-xl text-purple-300 font-semibold mb-6">
                The Autonomous Marketing Platform Built to Replace Traditional Marketing Teams
              </p>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light mb-8 max-w-2xl">
                Traditional marketing agencies cost thousands per month, require constant follow-ups, and move slowly. Markeee is an end-to-end autonomous marketing engine that handles the entire pipeline: from conceiving campaigns and generating ad creatives, to writing high-converting copy, scheduling multi-channel distribution, and optimizing ROI in real time.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  {
                    title: "Autonomous Creative Generator",
                    desc: "Designs high-converting banners, social carousels, and visual ads automatically.",
                  },
                  {
                    title: "Conversion Copywriting AI",
                    desc: "Writes persuasive ad copy, hooks, and email marketing funnels tuned for conversion.",
                  },
                  {
                    title: "Multi-Channel Distribution",
                    desc: "Orchestrates synchronized campaigns across Meta, Google Ads, LinkedIn, and X.",
                  },
                  {
                    title: "Live ROI & Spend Optimization",
                    desc: "Tracks performance 24/7 and automatically shifts budget to top-performing ads.",
                  },
                ].map((feat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3">
                    <CheckCircle2 size={18} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 font-['Syne']">{feat.title}</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Magnetic strength={0.2} scale={1.03}>
                <a
                  href="https://markeee.buildicy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(168,85,247,0.4)] border border-purple-400/40 transition-all group/btn"
                >
                  <span>Launch Markeee Platform</span>
                  <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </Magnetic>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#12121E] border border-white/10 p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-['Syne']">Markeee Autopilot</div>
                      <div className="text-[10px] font-mono text-zinc-500">Autonomous Marketing Pipeline</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                    Active 24/7
                  </span>
                </div>

                {/* Simulated Automation Workflow */}
                <div className="space-y-4">
                  {[
                    { step: "1. Brand Analysis", detail: "Analyzed audience sentiment & competitor creative vectors", status: "Done" },
                    { step: "2. Creative & Copy Synthesis", detail: "Synthesized 12 high-converting ad variations in 18s", status: "Done" },
                    { step: "3. Multi-Channel Launch", detail: "Synchronized with Google Ads & Meta Business API", status: "Live" },
                    { step: "4. Autonomous Budget Tuning", detail: "Shifted 65% budget to top-converting variation B", status: "Optimizing" }
                  ].map((wf, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{wf.step}</div>
                        <div className="text-[11px] text-zinc-400 font-light mt-0.5">{wf.detail}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 shrink-0">
                        {wf.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Replaces agency monthly fees</span>
                  <span className="text-purple-300 font-bold">10x Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT 2: BIZBRAIN */}
        <div className="rounded-[36px] md:rounded-[44px] bg-[#0C0C14] border border-white/10 p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Visual: WhatsApp Simulator */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-3xl bg-[#101416] border border-emerald-500/20 p-6 sm:p-8 shadow-2xl relative">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-['Syne']">BizBrain on WhatsApp</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Official Verified Business</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    12+ Languages
                  </span>
                </div>

                {/* Simulated WhatsApp Bubbles */}
                <div className="space-y-3 font-sans text-xs">
                  {/* Incoming Retailer Message */}
                  <div className="flex justify-end">
                    <div className="p-3 rounded-2xl rounded-tr-none bg-[#005c4b] text-white max-w-[85%] shadow-sm">
                      <p className="font-medium">Bill #4092: Sold 5 units Cotton Fabric to Ramesh Kumar for ₹14,500. Received ₹10,000 cash, ₹4,500 credit (udhar).</p>
                      <span className="text-[9px] text-emerald-200/70 block text-right mt-1 font-mono">10:42 AM</span>
                    </div>
                  </div>

                  {/* BizBrain Bot Response */}
                  <div className="flex justify-start">
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#202c33] text-zinc-200 max-w-[90%] border border-white/5 shadow-sm space-y-1.5">
                      <p className="font-bold text-emerald-400">Invoice #4092 Created</p>
                      <p>Total: ₹14,500 | Paid: ₹10,000 | Pending: ₹4,500</p>
                      <p className="text-[11px] text-zinc-300">Ramesh's total ledger balance updated to ₹12,800. Automated WhatsApp payment reminder scheduled for 5th Oct.</p>
                      <div className="pt-2 flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">PDF Invoice Sent</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">Stock Deducted</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block text-right font-mono">10:42 AM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Zero app download required</span>
                  <span className="text-emerald-400 font-bold">100% WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Proprietary Product #2
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                  <Languages size={13} />
                  12+ Languages
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight font-['Syne']">
                BizBrain
              </h3>
              <p className="text-lg sm:text-xl text-emerald-400 font-semibold mb-6">
                Finance & Billing Management for Retail Shops & SMEs — Directly Inside WhatsApp
              </p>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light mb-8 max-w-2xl">
                Small business owners, shopkeepers, and traders often struggle with complicated accounting software that requires separate desktop applications or complex training. BizBrain brings enterprise-grade invoicing, ledger accounting (Khata), expense tracking, and inventory alerts straight into WhatsApp.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  {
                    title: "Zero Separate App Download",
                    desc: "Operates 100% inside WhatsApp. Business owners and staff don't need to install or update any software.",
                  },
                  {
                    title: "12+ Language Support",
                    desc: "Supports English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, and more.",
                  },
                  {
                    title: "Instant Invoicing & Ledger",
                    desc: "Send GST and Non-GST bills directly to customer phones via WhatsApp in just 2 taps.",
                  },
                  {
                    title: "Automated Payment Recovery",
                    desc: "Automates courteous payment reminders and UPI links directly to debtor customers.",
                  },
                ].map((feat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 font-['Syne']">{feat.title}</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Magnetic strength={0.2} scale={1.03}>
                <a
                  href="https://bizzbrainn.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all group/btn"
                >
                  <span>Explore BizBrain Platform</span>
                  <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
