import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Layers,
  Handshake,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Bot,
  MessageSquare,
  Globe,
  Rocket,
  CheckCircle2,
  Users,
  Code2,
  Presentation,
  TrendingUp,
  Workflow,
  Search,
  Languages,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import Magnetic from "./Magnetic";

const domainsData = [
  {
    id: "edutech",
    number: "01",
    tabTitle: "Edutech",
    title: "Edutech & Career Acceleration",
    subtitle: "Nurturing the Next Generation of Tech Leaders",
    badge: "Future-Ready Talent",
    icon: GraduationCap,
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    accentColor: "#a855f7",
    description:
      "We bridge the gap between academic theory and high-growth industry engineering through hands-on paid internships, trend-focused seminars, school coding curriculums, and corporate keynote sessions.",
    features: [
      {
        title: "Paid Internship Training",
        desc: "Stipend-backed, hands-on production engineering internships where students build real-world SaaS, AI, and full-stack applications with mentorship and verifiable certificates.",
        icon: Briefcase,
        badge: "Stipend & Live Projects",
        linkText: "Apply for Internship",
        linkPath: "/internship-registration",
        isExternal: false,
      },
      {
        title: "Webinars & Career Accelerators",
        desc: "High-impact technical workshops and seminars on latest market trends — Generative AI, cloud scaling, modern dev stacks, and career acceleration strategies.",
        icon: TrendingUp,
        badge: "Industry Trends",
        linkText: "Explore Programs",
        action: "open-scouter",
      },
      {
        title: "Coding Classes for School Students",
        desc: "Foundational and advanced programming classes tailored specifically for school kids — fostering algorithmic logic, creative problem-solving, and web fundamentals early.",
        icon: Code2,
        badge: "School Academies",
        linkText: "Enroll School Student",
        action: "open-scouter",
      },
      {
        title: "College & Corporate Guest Lectures",
        desc: "Keynote sessions and technical seminars conducted by our leadership as guest speakers for universities, colleges, student symposiums, and corporate tech summits.",
        icon: Presentation,
        badge: "Keynote & Seminars",
        linkText: "Invite as Guest Speaker",
        action: "open-scouter",
      },
    ],
    stats: [
      { label: "Students Trained", value: "2,500+" },
      { label: "Campus Seminars", value: "45+" },
      { label: "Intern Placement Ratio", value: "94%" },
    ],
    ctaText: "Explore Edutech Programs",
    ctaLink: "/internship-registration",
  },
  {
    id: "it-consulting",
    number: "02",
    tabTitle: "IT & Consulting",
    title: "IT & Strategic Tech Consulting",
    subtitle: "Architecting Digital Dominance for Enterprises & SMBs",
    badge: "Enterprise Engineering",
    icon: Layers,
    gradient: "from-blue-500/20 via-purple-500/10 to-transparent",
    accentColor: "#3b82f6",
    description:
      "From bespoke high-performance websites and AI-powered sales funnels to end-to-end workflow automation and technical SEO, we engineer technology systems that directly drive business revenue.",
    features: [
      {
        title: "Custom Websites & Web Applications",
        desc: "Cinematic, lightning-fast web applications, B2B SaaS platforms, and bespoke client portals engineered with modern React, Next.js, and cloud backends.",
        icon: Globe,
        badge: "Ultra-Fast & Bespoke",
        linkText: "View Solutions",
        linkPath: "/services",
        isExternal: false,
      },
      {
        title: "AI Funnel Systems for Business",
        desc: "High-converting, automated sales & lead generation funnels equipped with smart AI qualifiers, predictive routing, and continuous conversion rate optimization.",
        icon: Workflow,
        badge: "High Conversion",
        linkText: "Build Your AI Funnel",
        action: "open-scouter",
      },
      {
        title: "AI Automation & Autonomous Ops",
        desc: "Eliminate repetitive manual bottlenecks with intelligent workflow automations, custom AI agents, CRM synchronization, and self-learning pipelines.",
        icon: Bot,
        badge: "24/7 Automation",
        linkText: "Automate Workflows",
        action: "open-scouter",
      },
      {
        title: "Full-Stack Tech & SEO Services",
        desc: "End-to-end technical SEO architecture, cloud infrastructure scaling, database tuning, API integrations, and conversion-focused UI/UX redesigns.",
        icon: Search,
        badge: "Search & Performance",
        linkText: "Get Free Tech Audit",
        action: "open-scouter",
      },
    ],
    stats: [
      { label: "Apps Shipped", value: "50+" },
      { label: "Cost Reduction", value: "80%" },
      { label: "Uptime Guaranteed", value: "99.9%" },
    ],
    ctaText: "Consult Our Engineers",
    action: "open-scouter",
  },
  {
    id: "products",
    number: "03",
    tabTitle: "Our Products",
    title: "Proprietary Software Products",
    subtitle: "Pioneering SaaS Tools Engineered by Buildicy",
    badge: "Buildicy Lab Creations",
    icon: Rocket,
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
    accentColor: "#d946ef",
    description:
      "We conceive, architect, and ship high-impact software products designed to revolutionize core business operations — from autonomous marketing engines to WhatsApp-native SME finance.",
    features: [
      {
        title: "Markeee",
        desc: "An end-to-end autonomous marketing platform built to replace traditional marketing teams. Automatically designs creatives, crafts persuasive copy, coordinates multi-channel distribution, and maximizes ROI through real-time AI analytics.",
        icon: Sparkles,
        badge: "Autonomous Marketing AI",
        linkText: "Visit markeee.buildicy.com",
        linkPath: "https://markeee.buildicy.com/",
        isExternal: true,
        highlight: "Replaces traditional marketing agencies",
      },
      {
        title: "BizBrain",
        desc: "Finance and billing management system built directly inside WhatsApp for retail shops, traders, and SMEs. No separate application installation required — manage invoices, ledger balances, daily sales, and payment reminders with 12+ language support.",
        icon: MessageSquare,
        badge: "WhatsApp-Native Finance",
        linkText: "Visit bizzbrain.buildicy.com",
        linkPath: "https://bizzbrainn.vercel.app",
        isExternal: true,
        highlight: "Zero app download • 12+ Languages",
      },
      {
        title: "B-Forms Engine",
        desc: "Enterprise dynamic feedback, survey, and quiz engine featuring real-time Postgres analytics, smart CSV exports, and dynamic light/dark theming.",
        icon: ShieldCheck,
        badge: "Dynamic Forms Engine",
        linkText: "Open bforms.buildicy.com",
        linkPath: "https://bforms.buildicy.com",
        isExternal: true,
      },
      {
        title: "Buiz Arena & Studio",
        desc: "Gamified live quiz and assessment studio optimized with debounced state synchronization supporting 500+ concurrent students in live real-time arenas.",
        icon: Users,
        badge: "Live Quiz Platform",
        linkText: "Launch Buiz Arena",
        linkPath: "/buiz",
        isExternal: false,
      },
    ],
    stats: [
      { label: "Active Products", value: "4" },
      { label: "Languages in BizBrain", value: "12+" },
      { label: "Concurrent Users Tested", value: "500+" },
    ],
    ctaText: "Explore Product Ecosystem",
    linkPath: "https://markeee.buildicy.com/",
    isExternal: true,
  },
  {
    id: "collaborations",
    number: "04",
    tabTitle: "Venture Collaborations",
    title: "Dev & Backend Partnership",
    subtitle: "Your Fractional Tech Co-Founder & Dedicated Engineering Team",
    badge: "Profit-Sharing Venture Dev",
    icon: Handshake,
    gradient: "from-emerald-500/20 via-purple-500/10 to-transparent",
    accentColor: "#10b981",
    description:
      "We partner with organizations, founders, and business leaders as their dedicated backend and dev team. We transform your raw ideas into production-ready digital products on an aligned profit-sharing basis.",
    features: [
      {
        title: "Dedicated Backend & Dev Team",
        desc: "We function as your full-stack engineering department — managing architecture, APIs, frontend UI/UX, cloud DevOps, database pipelines, and security from day one.",
        icon: Building2,
        badge: "Fractional Tech Department",
        linkText: "Discuss Your Architecture",
        action: "open-scouter",
      },
      {
        title: "Idea to Market-Ready Product",
        desc: "Bring us your concept, rough drafts, or business workflow. We architect, prototype, and build the complete enterprise-grade product ready to launch in weeks, not years.",
        icon: Rocket,
        badge: "Rapid MVP & Scale",
        linkText: "Pitch Your Product Idea",
        action: "open-scouter",
      },
      {
        title: "Profit-Sharing Business Model",
        desc: "We don't just charge heavy agency retainers — we invest our engineering horsepower and align our incentives with your success by partnering on a profit-sharing basis.",
        icon: DollarSign,
        badge: "Zero Bloated Upfront",
        linkText: "Explore Partnership Terms",
        action: "open-scouter",
      },
      {
        title: "Continuous Scaling & Evolution",
        desc: "Beyond launch, we stay on board as your technology backbone, monitoring performance, implementing new features, and scaling infrastructure as your customer base expands.",
        icon: TrendingUp,
        badge: "Long-Term Growth Partner",
        linkText: "Schedule Venture Call",
        action: "open-scouter",
      },
    ],
    stats: [
      { label: "Model", value: "Profit-Sharing" },
      { label: "Time to MVP", value: "3-6 Weeks" },
      { label: "Aligned Incentives", value: "100%" },
    ],
    ctaText: "Pitch Your Idea for Profit-Sharing",
    action: "open-scouter",
  },
];

export default function DomainsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentDomain = domainsData[activeTab];

  const handleAction = (item: any) => {
    if (item.action === "open-scouter") {
      window.dispatchEvent(new CustomEvent("open-scouter"));
    }
  };

  return (
    <section id="domains" className="relative py-28 md:py-36 bg-[#050507] overflow-hidden text-white">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] md:w-[1200px] h-[500px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${currentDomain.accentColor}, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-xl"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-300 font-mono">
              Buildicy Core Ecosystem
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            Four Targeted Domains. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
              One Unified Powerhouse.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light"
          >
            Buildicy operates as an integrated technological force — educating future innovators, delivering enterprise IT & AI consulting, launching proprietary products, and acting as the profit-sharing engineering team for visionary organizations.
          </motion.p>
        </div>

        {/* 4 Interactive Domain Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-14">
          {domainsData.map((domain, index) => {
            const isActive = activeTab === index;
            const Icon = domain.icon;

            return (
              <button
                key={domain.id}
                onClick={() => setActiveTab(index)}
                className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                  isActive
                    ? "bg-[#12121A] border-purple-500/60 shadow-[0_10px_35px_rgba(168,85,247,0.25)] scale-[1.02]"
                    : "bg-[#0C0C12]/70 border-white/5 hover:border-white/15 hover:bg-[#12121A]/50"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeDomainPill"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10"
                    }`}
                  >
                    <Icon size={20} className="md:w-6 md:h-6" />
                  </div>
                  <span className="font-mono text-xs md:text-sm font-bold text-zinc-500">
                    {domain.number}
                  </span>
                </div>

                <div>
                  <span
                    className={`block text-base md:text-lg font-bold tracking-tight transition-colors font-['Syne'] ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {domain.tabTitle}
                  </span>
                  <span className="text-[10px] md:text-xs text-zinc-500 font-medium line-clamp-1 mt-0.5">
                    {domain.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Showcase Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDomain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-[32px] md:rounded-[40px] border border-white/10 bg-[#0C0C12]/90 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Inner Gradient */}
            <div
              className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${currentDomain.gradient} rounded-full blur-3xl pointer-events-none`}
            />

            {/* Panel Top Details */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-white/5 relative z-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Domain {currentDomain.number} • {currentDomain.badge}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 font-['Syne']">
                  {currentDomain.title}
                </h3>
                <p className="text-base sm:text-lg text-purple-300/80 font-medium mb-3">
                  {currentDomain.subtitle}
                </p>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-light">
                  {currentDomain.description}
                </p>
              </div>

              {/* Domain Metrics */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 lg:border-l lg:border-white/10 lg:pl-8">
                {currentDomain.stats.map((st, i) => (
                  <div key={i} className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[110px]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                      {st.value}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-1">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid (4 Key Offerings) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 my-10 relative z-10">
              {currentDomain.features.map((feat, i) => {
                const FeatIcon = feat.icon;

                return (
                  <div
                    key={i}
                    className="p-6 md:p-8 rounded-3xl bg-[#12121A]/80 border border-white/5 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                          <FeatIcon size={22} />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                          {feat.badge}
                        </span>
                      </div>

                      <h4 className="text-xl md:text-2xl font-bold text-white mb-2.5 tracking-tight group-hover:text-purple-300 transition-colors font-['Syne']">
                        {feat.title}
                      </h4>
                      <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-light">
                        {feat.desc}
                      </p>

                      {(feat as any).highlight && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
                          <CheckCircle2 size={13} className="text-purple-400" />
                          {(feat as any).highlight}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                      {feat.linkPath ? (
                        feat.isExternal ? (
                          <a
                            href={feat.linkPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group/link"
                          >
                            <span>{feat.linkText}</span>
                            <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : (
                          <Link
                            to={feat.linkPath}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group/link"
                          >
                            <span>{feat.linkText}</span>
                            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={() => handleAction(feat)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group/btn cursor-pointer"
                        >
                          <span>{feat.linkText}</span>
                          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Domain Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-zinc-400 font-mono">
                  Active in Coimbatore & serving clients globally.
                </span>
              </div>

              <Magnetic strength={0.2} scale={1.03}>
                {currentDomain.action === "open-scouter" ? (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                    className="px-8 py-4 rounded-full text-sm sm:text-base font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-400/40 cursor-pointer"
                  >
                    <span>{currentDomain.ctaText}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : currentDomain.isExternal ? (
                  <a
                    href={currentDomain.linkPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-full text-sm sm:text-base font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-400/40"
                  >
                    <span>{currentDomain.ctaText}</span>
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <Link
                    to={currentDomain.ctaLink || "/services"}
                    className="px-8 py-4 rounded-full text-sm sm:text-base font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-400/40"
                  >
                    <span>{currentDomain.ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </Magnetic>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
