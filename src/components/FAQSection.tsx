import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What AI services does Nubien offer?",
    answer: "We offer a comprehensive suite of AI services including custom model development, computer vision, NLP, predictive analytics, chatbot development, and AI-driven automation solutions tailored to your business needs.",
  },
  {
    question: "How long does a typical AI project take?",
    answer: "Project timelines vary based on complexity. A simple chatbot integration takes 2-4 weeks, while custom AI model development can take 8-16 weeks. We provide detailed timelines during our initial consultation.",
  },
  {
    question: "Do you offer ongoing support after deployment?",
    answer: "Yes, all our plans include post-deployment support. We monitor model performance, provide updates, and offer 24/7 technical assistance to ensure your AI solutions continue to deliver optimal results.",
  },
  {
    question: "Can Nubien integrate with our existing systems?",
    answer: "Absolutely. Our solutions are built with interoperability in mind. We support REST APIs, GraphQL, webhooks, and can integrate with most enterprise systems including Salesforce, HubSpot, and custom platforms.",
  },
  {
    question: "What industries do you specialize in?",
    answer: "We serve clients across healthcare, fintech, e-commerce, manufacturing, and SaaS. Our team has deep domain expertise in each sector, ensuring solutions that address industry-specific challenges.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq-section" className="py-24 px-6">
      <div ref={ref} className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="badge-pill inline-flex mb-6">
            <span className="badge-dot"><div className="w-2 h-2 rounded-full border border-white/60" /></span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>FAQ</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-light mb-3"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Frequently Asked
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-4xl md:text-6xl font-light"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Questions.
          </motion.h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: openIndex === i
                  ? "linear-gradient(135deg, hsl(262 30% 15%), hsl(240 15% 10%))"
                  : "hsl(var(--surface))",
                border: openIndex === i
                  ? "1px solid hsl(262 80% 50% / 0.3)"
                  : "1px solid hsl(var(--border))",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-base font-medium pr-4" style={{ color: "hsl(var(--foreground))" }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: openIndex === i ? "hsl(var(--primary))" : "hsl(var(--surface-2))",
                  }}
                >
                  {openIndex === i ? (
                    <Minus size={14} className="text-white" />
                  ) : (
                    <Plus size={14} style={{ color: "hsl(var(--foreground))" }} />
                  )}
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
