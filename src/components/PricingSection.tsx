import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Perfect for small teams getting started with AI.",
    features: ["1 AI Model Integration", "5,000 API Calls/mo", "Email Support", "Basic Analytics", "1 Team Member"],
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 149,
    yearlyPrice: 119,
    description: "For growing businesses that need advanced AI capabilities.",
    features: ["5 AI Model Integrations", "50,000 API Calls/mo", "Priority Support", "Advanced Analytics", "10 Team Members", "Custom Training"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 499,
    yearlyPrice: 399,
    description: "Full-scale AI infrastructure for large organizations.",
    features: ["Unlimited Integrations", "Unlimited API Calls", "24/7 Dedicated Support", "Real-time Analytics", "Unlimited Team", "Custom Models", "SLA Guarantee"],
    highlighted: false,
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6">
      <div ref={ref} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="badge-pill inline-flex mb-6">
            <span className="badge-dot"><div className="w-2 h-2 rounded-full border border-white/60" /></span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Pricing</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-light mb-3"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Simple, Transparent
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-4xl md:text-6xl font-light mb-8"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Pricing for Everyone.
          </motion.h2>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="inline-flex items-center gap-3 p-1.5 rounded-full"
            style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))" }}
          >
            <button
              onClick={() => setIsYearly(false)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: !isYearly ? "hsl(var(--primary))" : "transparent",
                color: !isYearly ? "white" : "hsl(var(--muted-foreground))",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: isYearly ? "hsl(var(--primary))" : "transparent",
                color: isYearly ? "white" : "hsl(var(--muted-foreground))",
              }}
            >
              Yearly <span className="text-xs opacity-80">(-20%)</span>
            </button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative p-8 rounded-3xl overflow-hidden"
              style={{
                background: plan.highlighted
                  ? "linear-gradient(135deg, hsl(262 40% 18%), hsl(262 50% 14%))"
                  : "hsl(var(--surface))",
                border: plan.highlighted
                  ? "1px solid hsl(262 80% 50% / 0.5)"
                  : "1px solid hsl(var(--border))",
                boxShadow: plan.highlighted ? "0 0 60px hsl(262 83% 58% / 0.15)" : "none",
              }}
            >
              {plan.highlighted && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "hsl(var(--primary))", color: "white" }}>
                  <Sparkles size={12} />
                  Recommended
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>{plan.name}</h3>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isYearly ? "yearly" : "monthly"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-5xl font-light"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>/mo</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold mb-8 transition-colors"
                style={{
                  background: plan.highlighted ? "hsl(var(--primary))" : "transparent",
                  color: plan.highlighted ? "white" : "hsl(var(--foreground))",
                  border: plan.highlighted ? "none" : "1px solid hsl(var(--border))",
                }}
              >
                Get Started
              </motion.button>

              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 + j * 0.05 }}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "hsl(var(--foreground) / 0.8)" }}
                  >
                    <Check size={14} style={{ color: "hsl(var(--primary))" }} />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
