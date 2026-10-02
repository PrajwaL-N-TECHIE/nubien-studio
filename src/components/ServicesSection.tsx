import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, Globe, Workflow, Bot, Search,
  GraduationCap, Briefcase, TrendingUp, Code2, Presentation,
  Sparkles, MessageSquare, Handshake, Building2, Rocket,
  DollarSign, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck,
  Layers, Users, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import Magnetic from "./Magnetic";

// --------------------------------------------------------------------------
// 4 DOMAINS DATA
// --------------------------------------------------------------------------
const domainsList = [
  { id: "all", name: "All Offerings" },
  { id: "edutech", name: "1. Edutech" },
  { id: "it-consulting", name: "2. IT & Consulting" },
  { id: "products", name: "3. Proprietary Products" },
  { id: "collaborations", name: "4. Venture Collaborations" },
];

const allServiceCards = [
  // 1. EDUTECH
  {
    domain: "edutech",
    domainLabel: "Edutech",
    icon: Briefcase,
    title: "Paid Internship Training",
    subtitle: "Hands-On Engineering",
    description: "Industry-grade paid software engineering internships. Students build production SaaS, AI, and full-stack projects with 1-on-1 mentorship and verified credentials.",
    stats: ["Stipend-Backed", "Real-World Projects"],
    actionType: "link",
    actionPath: "/internship-registration",
    actionLabel: "Apply for Internship",
    isExternal: false,
    badge: "Careers & Internships",
  },
  {
    domain: "edutech",
    domainLabel: "Edutech",
    icon: TrendingUp,
    title: "Webinars & Career Accelerators",
    subtitle: "Recent Tech Trends",
    description: "Interactive masterclasses, webinars, and career bootcamps covering Generative AI, Web3, System Design, and tech interview readiness.",
    stats: ["Latest AI Stacks", "Career Bootcamps"],
    actionType: "scouter",
    actionLabel: "Join Upcoming Sessions",
    badge: "Webinars & Workshops",
  },
  {
    domain: "edutech",
    domainLabel: "Edutech",
    icon: Code2,
    title: "Coding Classes for School Students",
    subtitle: "Junior Tech Academy",
    description: "Tailored coding classes designed for school students — introducing logical thinking, Python, web fundamentals, and AI basics with gamified learning.",
    stats: ["Ages 10-17", "Logic & Fundamentals"],
    actionType: "scouter",
    actionLabel: "Enroll School Student",
    badge: "School Programs",
  },
  {
    domain: "edutech",
    domainLabel: "Edutech",
    icon: Presentation,
    title: "Guest Lectures & Keynote Seminars",
    subtitle: "Corporate & Campus Speaking",
    description: "Technical speaking engagements, guest lectures, and motivational seminars for universities, engineering colleges, schools, and corporate summits.",
    stats: ["College Keynotes", "Corporate Seminars"],
    actionType: "scouter",
    actionLabel: "Book Guest Speaker",
    badge: "Keynote Speaking",
  },
  {
    domain: "edutech",
    domainLabel: "Edutech",
    icon: Sparkles,
    title: "Campus AI Reviews & Outcomes",
    subtitle: "5.0 Rating from 150+ Students",
    description: "Browse verified student feedback and transformational mindset reviews from our campus Gen AI workshops at Monti International and leading engineering institutions.",
    stats: ["100% Satisfaction", "Verified Testimonials"],
    actionType: "link",
    actionPath: "/reviews",
    actionLabel: "Read Campus Reviews",
    isExternal: false,
    badge: "Verified Outcomes",
  },

  // 2. IT AND CONSULTING
  {
    domain: "it-consulting",
    domainLabel: "IT & Consulting",
    icon: Globe,
    title: "Custom Websites & Web Applications",
    subtitle: "Cinematic High-Performance Tech",
    description: "Bespoke full-stack web platforms, B2B SaaS interfaces, and enterprise web solutions engineered for maximum speed, security, and conversion.",
    stats: ["50+ Shipped", "Sub-second Speeds"],
    actionType: "link",
    actionPath: "/portfolio",
    actionLabel: "View Web Portfolio",
    isExternal: false,
    badge: "Custom Web & SaaS",
  },
  {
    domain: "it-consulting",
    domainLabel: "IT & Consulting",
    icon: DollarSign,
    title: "SaaS vs Custom Software Cost Analysis",
    subtitle: "Build vs Buy Software ROI",
    description: "Calculate your exact 5-year savings when replacing expensive recurring SaaS subscriptions with custom-built, proprietary software systems.",
    stats: ["Save up to 80%", "Zero Recurring Fees"],
    actionType: "link",
    actionPath: "/roi-calculator",
    actionLabel: "Calculate Software ROI",
    isExternal: false,
    badge: "Cost Analyzer",
  },
  {
    domain: "it-consulting",
    domainLabel: "IT & Consulting",
    icon: Workflow,
    title: "AI Funnel Systems for Business",
    subtitle: "Automated Conversion Engines",
    description: "Data-driven AI marketing funnels engineered to capture, qualify, and convert leads autonomously with intelligent automated nurturing sequences.",
    stats: ["Lead Qualification", "Predictive Scoring"],
    actionType: "scouter",
    actionLabel: "Build Your AI Funnel",
    badge: "AI Funnel Architecture",
  },
  {
    domain: "it-consulting",
    domainLabel: "IT & Consulting",
    icon: Bot,
    title: "AI Automation & Operational Bots",
    subtitle: "Workflow Optimization",
    description: "End-to-end intelligent automation that replaces repetitive operational friction — connecting CRMs, databases, customer support, and internal pipelines.",
    stats: ["80% Cost Drop", "24/7 Operations"],
    actionType: "scouter",
    actionLabel: "Automate Your Ops",
    badge: "Autonomous Systems",
  },
  {
    domain: "it-consulting",
    domainLabel: "IT & Consulting",
    icon: Search,
    title: "Full-Stack Tech & Technical SEO",
    subtitle: "Search, Infrastructure & Growth",
    description: "Comprehensive technical SEO architectures, cloud infrastructure scaling, database tuning, API integrations, and UI/UX conversion audits.",
    stats: ["Top Search Ranks", "99.9% Uptime"],
    actionType: "scouter",
    actionLabel: "Request Technical Audit",
    badge: "SEO & Growth",
  },

  // 3. PROPRIETARY PRODUCTS
  {
    domain: "products",
    domainLabel: "Our Products",
    icon: Sparkles,
    title: "Markeee",
    subtitle: "Autonomous AI Marketing Platform",
    description: "An end-to-end autonomous marketing platform built to replace traditional marketing teams. Automatically conceives campaigns, generates high-converting copy and creatives, orchestrates multi-channel distribution, and tracks ROI in real time.",
    stats: ["Replaces Marketing Agencies", "Autonomous AI"],
    actionType: "link",
    actionPath: "https://markeee.buildicy.com/",
    actionLabel: "Explore Markeee (markeee.buildicy.com)",
    isExternal: true,
    highlight: "Autonomous Marketing AI • Replaces Agency Overhead",
    badge: "Proprietary Product #1",
  },
  {
    domain: "products",
    domainLabel: "Our Products",
    icon: MessageSquare,
    title: "BizBrain",
    subtitle: "WhatsApp-Native SME Finance",
    description: "Finance and billing management system built directly inside WhatsApp for retail shops, traders, and SMEs. No separate application download needed — manage billing, invoices, daily ledger, and payment tracking in 12+ languages.",
    stats: ["Inside WhatsApp", "12+ Languages Supported"],
    actionType: "link",
    actionPath: "https://bizzbrainn.vercel.app",
    actionLabel: "Explore BizBrain (bizzbrain.buildicy.com)",
    isExternal: true,
    highlight: "Zero App Download • 12+ Regional Languages",
    badge: "Proprietary Product #2",
  },
  {
    domain: "products",
    domainLabel: "Our Products",
    icon: ShieldCheck,
    title: "B-Forms Engine",
    subtitle: "Dynamic Forms & Survey Engine",
    description: "Next-gen dynamic form builder with instant publishing, real-time Supabase analytics, automated Excel/CSV data exports, and responsive light/dark design.",
    stats: ["Edge-to-Edge Design", "Live Analytics"],
    actionType: "link",
    actionPath: "https://bforms.buildicy.com",
    actionLabel: "Launch B-Forms Studio",
    isExternal: true,
    badge: "Ecosystem Tool",
  },

  // 4. VENTURE COLLABORATIONS
  {
    domain: "collaborations",
    domainLabel: "Venture Collaborations",
    icon: Building2,
    title: "Dedicated Dev & Backend Team",
    subtitle: "Your Fractional Tech Co-Founder",
    description: "We act as your dedicated in-house backend and engineering team. We manage architecture, cloud infrastructure, databases, API pipelines, and frontend apps end-to-end.",
    stats: ["Fractional Tech Team", "Zero Dev Headaches"],
    actionType: "scouter",
    actionLabel: "Hire Our Dev Team",
    badge: "Engineering Department",
  },
  {
    domain: "collaborations",
    domainLabel: "Venture Collaborations",
    icon: Rocket,
    title: "Idea to Market-Ready Product",
    subtitle: "Concept to Production in Weeks",
    description: "Bring us your concept or business blueprint. We take complete ownership of technical execution, rapid prototyping, and shipping a production-ready product.",
    stats: ["Rapid MVPs", "Scalable Architecture"],
    actionType: "scouter",
    actionLabel: "Pitch Your Product Idea",
    badge: "Venture Execution",
  },
  {
    domain: "collaborations",
    domainLabel: "Venture Collaborations",
    icon: DollarSign,
    title: "Profit-Sharing Venture Model",
    subtitle: "Shared Risk, Shared Triumph",
    description: "We align our incentives with your business success. Rather than heavy upfront agency fees, we partner on an agreed profit-sharing basis to build and scale your product.",
    stats: ["Profit-Sharing Basis", "Risk Aligned"],
    actionType: "scouter",
    actionLabel: "Partner on Profit-Sharing",
    highlight: "Zero bloated upfront fees • Mutual growth",
    badge: "Profit-Sharing Model",
  },
];

const capabilityTags = [
  { icon: Sparkles, label: "AI Marketing (Markeee)", color: "#d946ef" },
  { icon: MessageSquare, label: "WhatsApp Finance (BizBrain)", color: "#10b981" },
  { icon: Briefcase, label: "Paid Internships", color: "#a855f7" },
  { icon: Workflow, label: "AI Funnels for Business", color: "#3b82f6" },
  { icon: Handshake, label: "Profit-Sharing Dev Team", color: "#10b981" },
  { icon: Code2, label: "School Coding Classes", color: "#f59e0b" },
  { icon: Presentation, label: "College & Corporate Seminars", color: "#ec4899" },
  { icon: Bot, label: "AI Automation Workflows", color: "#8b5cf6" },
  { icon: Globe, label: "Custom SaaS Development", color: "#3b82f6" },
  { icon: Search, label: "Technical SEO & Growth", color: "#f59e0b" },
  { icon: ShieldCheck, label: "Dynamic Forms (B-Forms)", color: "#8b5cf6" },
  { icon: Users, label: "Live Quiz Arenas (Buiz)", color: "#ec4899" },
];

// --------------------------------------------------------------------------
// SPOTLIGHT CARD COMPONENT
// --------------------------------------------------------------------------
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative group overflow-hidden bg-[#0C0C12] border border-white/5 rounded-[30px] transition-all hover:border-purple-500/40 hover:-translate-y-1 duration-300 shadow-xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(168, 85, 247, 0.18),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
};

export default function ServicesSection() {
  const containerRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bannerY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const bannerScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const tagsRef = useRef(null);
  const tagsInView = useInView(tagsRef, { once: true, margin: "-50px" });

  const filteredCards = selectedFilter === "all"
    ? allServiceCards
    : allServiceCards.filter((card) => card.domain === selectedFilter);

  const handleAction = (card: any) => {
    if (card.actionType === "scouter") {
      window.dispatchEvent(new CustomEvent("open-scouter"));
    }
  };

  return (
    <section ref={containerRef} id="services" className="relative py-28 md:py-36 overflow-hidden bg-[#050507] text-white">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* PARALLAX HERO BANNER */}
      <motion.div
        style={{ y: bannerY, scale: bannerScale }}
        className="relative max-w-6xl mx-auto rounded-[36px] md:rounded-[44px] py-20 px-6 text-center mb-16 overflow-hidden border border-white/10 z-10 bg-[#0A0A0C]/60 backdrop-blur-3xl shadow-2xl"
      >
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 shadow-md"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold text-zinc-300 tracking-[0.2em] uppercase font-mono">
              Buildicy Core Domains
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-white leading-tight font-['Syne']"
          >
            Empowering Growth Across
          </motion.h2>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
              Four Strategic Domains.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg max-w-3xl mx-auto text-zinc-400 font-light leading-relaxed"
          >
            Whether you need hands-on <strong className="text-white font-medium">Edutech & Internship training</strong>, enterprise <strong className="text-white font-medium">IT & AI Funnel Consulting</strong>, our groundbreaking proprietary products (<strong className="text-purple-300 font-medium">Markeee</strong> & <strong className="text-purple-300 font-medium">BizBrain</strong>), or a <strong className="text-white font-medium">Profit-Sharing Dev Team</strong> — Buildicy delivers results.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        {/* DOMAIN FILTER TABS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-14">
          {domainsList.map((domain) => {
            const isSelected = selectedFilter === domain.id;

            return (
              <button
                key={domain.id}
                onClick={() => setSelectedFilter(domain.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer font-['Syne'] ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] border border-purple-400/50 scale-105"
                    : "bg-[#12121A]/80 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {domain.name}
              </button>
            );
          })}
        </div>

        {/* SERVICE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, i) => {
              const CardIcon = card.icon;

              return (
                <motion.div
                  key={`${card.domain}-${card.title}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="h-full"
                >
                  <SpotlightCard className="p-7 sm:p-8 h-full flex flex-col justify-between">
                    <div>
                      {/* Card Top Metadata */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-13 h-13 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-md">
                          <CardIcon size={24} />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                          {card.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-1 text-white tracking-tight group-hover:text-purple-300 transition-colors font-['Syne']">
                        {card.title}
                      </h3>
                      <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-purple-400/80 mb-4 font-mono">
                        {card.subtitle}
                      </p>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6 font-light">
                        {card.description}
                      </p>

                      {card.highlight && (
                        <div className="mb-6 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                          <span>{card.highlight}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Stats Pills */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 mb-6">
                        {card.stats.map((stat, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-medium px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-zinc-300 font-mono"
                          >
                            {stat}
                          </div>
                        ))}
                      </div>

                      {/* Card Action Link/Button */}
                      {card.actionType === "link" ? (
                        card.isExternal ? (
                          <a
                            href={card.actionPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors group/link"
                          >
                            <span>{card.actionLabel}</span>
                            <ExternalLink size={15} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : (
                          <Link
                            to={card.actionPath || "/services"}
                            className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors group/link"
                          >
                            <span>{card.actionLabel}</span>
                            <ArrowRight size={15} className="group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        )
                      ) : (
                        <button
                          onClick={() => handleAction(card)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors group/btn cursor-pointer"
                        >
                          <span>{card.actionLabel}</span>
                          <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* FULL CAPABILITIES TAGS */}
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
            className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-10 font-mono"
          >
            Capabilities & Focus Areas
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 max-w-5xl">
            {capabilityTags.map((tag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={tagsInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.03, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -4, backgroundColor: "rgba(255,255,255,0.08)" }}
                className="group flex items-center gap-3 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold cursor-pointer bg-white/5 border border-white/5 text-zinc-300 hover:text-white transition-all shadow-md backdrop-blur-sm"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300"
                  style={{ backgroundColor: `${tag.color}25` }}
                >
                  <tag.icon size={13} style={{ color: tag.color }} className="group-hover:scale-110 transition-transform" />
                </div>
                {tag.label}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tagsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic strength={0.2} scale={1.03}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                className="px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-[0_0_35px_rgba(168,85,247,0.4)] border border-purple-400/40 cursor-pointer"
              >
                Schedule a Consultation
                <ArrowRight size={18} />
              </button>
            </Magnetic>

            <Link
              to="/portfolio"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base flex items-center gap-3 border border-white/10 transition-colors"
            >
              Explore Portfolio
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}