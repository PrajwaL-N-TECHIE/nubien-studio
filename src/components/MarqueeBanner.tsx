import { motion } from "framer-motion";

const brands = [
  "TensorFlow", "OpenAI", "PyTorch", "Hugging Face", "LangChain",
  "Vercel", "AWS", "Google Cloud", "Azure", "Stripe",
  "Figma", "Notion", "Slack", "GitHub", "Docker",
];

const MarqueeBanner = () => {
  return (
    <div className="py-8 overflow-hidden border-y" style={{ borderColor: "hsl(var(--border))" }}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...brands, ...brands].map((brand, i) => (
          <span
            key={i}
            className="text-sm font-bold tracking-[0.2em] uppercase opacity-40 hover:opacity-80 transition-opacity cursor-default"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {brand}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default MarqueeBanner;
