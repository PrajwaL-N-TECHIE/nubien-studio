import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { Plus, Minus, Cpu, HelpCircle } from "lucide-react";

// --------------------------------------------------------------------------
// DATA
// --------------------------------------------------------------------------
const faqs = [
  {
    question: "What AI services does Buildicy offer?",
    answer: "We offer a comprehensive suite of AI services including custom neural network development, computer vision, advanced NLP, predictive analytics, autonomous agents, and enterprise-grade automation solutions.",
  },
  {
    question: "How long does a typical AI project take?",
    answer: "Project timelines scale with complexity. A streamlined AI integration or custom agent typically deploys in 2-4 weeks. Enterprise-scale custom model training and infrastructure development ranges from 8-16 weeks. We map exact milestones during discovery.",
  },
  {
    question: "Do you offer ongoing support after deployment?",
    answer: "Yes. AI requires continuous optimization. All our deployments include dedicated neural monitoring, model drift correction, security patches, and 24/7 technical oversight to ensure peak performance.",
  },
  {
    question: "Can Buildicy integrate with our existing systems?",
    answer: "Absolutely. Our architectures are framework-agnostic. We build secure API layers, GraphQL endpoints, and Webhooks that plug seamlessly into your existing tech stack—whether it's AWS, Azure, Salesforce, or bespoke internal systems.",
  },
  {
    question: "What industries do you specialize in?",
    answer: "Our core expertise spans Fintech, Healthcare tech, Enterprise SaaS, and advanced E-commerce. However, our fundamental AI methodologies are designed to adapt and scale across any data-rich industry.",
  },
];

// --------------------------------------------------------------------------
// INDIVIDUAL FAQ ITEM (Solid Colors & 3D Fold)
// --------------------------------------------------------------------------
const FAQItem = ({ faq, index, isOpen, onClick }: { faq: any, index: number, isOpen: boolean, onClick: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative z-10 w-full"
    >
      <div
        className={`relative overflow-hidden rounded-[24px] transition-colors duration-500 backdrop-blur-xl border ${isOpen
            ? "bg-[#0C0C12] border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
            : "bg-[#08080B] border-white/5 hover:border-purple-500/20 hover:bg-[#0A0A0F]"
          }`}
      >
        <button
          onClick={onClick}
          className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
        >
          <div className="flex items-center gap-4 md:gap-6 pr-4">
            <span className={`text-xs font-bold font-mono tracking-widest transition-colors duration-300 ${isOpen ? "text-purple-400" : "text-zinc-600"}`}>
              0{index + 1}
            </span>
            <span className={`text-lg md:text-xl font-medium transition-colors duration-300 ${isOpen ? "text-white" : "text-zinc-300"}`}>
              {faq.question}
            </span>
          </div>

          {/* Solid Color Icon Box */}
          <motion.div
            animate={{
              rotate: isOpen ? 180 : 0,
              backgroundColor: isOpen ? "rgba(168, 85, 247, 0.1)" : "transparent",
              borderColor: isOpen ? "rgba(168, 85, 247, 0.5)" : "rgba(255, 255, 255, 0.1)"
            }}
            transition={{ duration: 0.4, type: "spring" }}
            className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center"
          >
            {isOpen ? (
              <Minus size={16} className="text-purple-400" />
            ) : (
              <Plus size={16} className="text-zinc-400" />
            )}
          </motion.div>
        </button>

        {/* 3D Fold Out Answer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, rotateX: -20 }}
              animate={{ height: "auto", opacity: 1, rotateX: 0 }}
              exit={{ height: 0, opacity: 0, rotateX: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top", perspective: 1000 }}
            >
              <div className="px-6 md:px-8 pb-8 pt-0 ml-10 md:ml-12 border-t border-white/5 mt-2">
                <p className="text-zinc-400 leading-relaxed text-sm md:text-base mt-6 font-medium">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --------------------------------------------------------------------------
// MAIN SECTION
// --------------------------------------------------------------------------
const FAQSection = () => {
  const containerRef = useRef(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth Parallax for the FAQ list
  const listY = useSpring(useTransform(scrollYProgress, [0, 1], [80, -80]), { stiffness: 100, damping: 30 });

  return (
    <section ref={containerRef} id="faq" className="relative py-40 px-6 bg-[#050507] overflow-hidden min-h-screen">

      {/* Ambient Solid Glow (No CSS Gradients, just blurred circles) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        {/* Technical dot grid */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, black, transparent)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

        {/* Left Column: Sticky Header */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <Cpu size={14} className="text-purple-400" />
              <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Knowledge Base</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
            >
              Intelligence <br />
              <span className="text-purple-500">
                Briefing.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-sm leading-relaxed mb-10 font-medium"
            >
              Everything you need to know about our deployment processes, capabilities, and ongoing neural support.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-[#08080B] border border-white/5"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <HelpCircle size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Still have questions?</p>
                <a href="#contact" className="text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1">
                  Contact our engineers &rarr;
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: FAQ List with Snapping Neural Node */}
        <div className="lg:col-span-7 relative">

          <motion.div style={{ y: listY }} className="relative pl-6 md:pl-12 py-10">

            {/* The Static Background Line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 hidden md:block" />

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="relative">

                  {/* Framer Motion LayoutId Node - Automatically flies to the active item */}
                  <div className="absolute -left-6 md:-left-12 top-10 flex justify-center w-0 items-center hidden md:flex">
                    {openIndex === i && (
                      <motion.div
                        layoutId="active-faq-node"
                        className="w-[3px] h-12 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </div>

                  <FAQItem
                    faq={faq}
                    index={i}
                    isOpen={openIndex === i}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  />
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;