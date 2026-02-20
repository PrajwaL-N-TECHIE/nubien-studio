import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const projects = [
  {
    year: "2024",
    name: "Lemonide Tech",
    tags: ["AI Integration", "Responsive Design", "Custom Layouts"],
    gradient: "linear-gradient(135deg, hsl(25 80% 35%) 0%, hsl(0 60% 20%) 100%)",
    accent: "hsl(25 80% 55%)",
  },
  {
    year: "2024",
    name: "Nexus AI",
    tags: ["Machine Learning", "Real-time Analytics", "API Design"],
    gradient: "linear-gradient(135deg, hsl(200 80% 20%) 0%, hsl(240 60% 15%) 100%)",
    accent: "hsl(200 80% 55%)",
  },
  {
    year: "2023",
    name: "VisionAI Studio",
    tags: ["Computer Vision", "Cloud Deployment", "Data Pipelines"],
    gradient: "linear-gradient(135deg, hsl(280 60% 25%) 0%, hsl(240 60% 15%) 100%)",
    accent: "hsl(280 80% 65%)",
  },
];

const PortfolioSection = () => {
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="badge-pill inline-flex mb-6"
          >
            <span className="badge-dot"><div className="w-2 h-2 rounded-full border border-white/60" /></span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Portfolio</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-light mb-3"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Showcasing Your Best
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-4xl md:text-6xl font-light mb-6"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Work with Pure Precision.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base max-w-md mx-auto mb-8"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            A portfolio is more than just projects—it's your story, vision, and expertise. Reboot ensures your work stands out with a rank.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-2xl text-sm font-semibold"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            View More Works
          </motion.button>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={cardsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="rounded-3xl overflow-hidden"
              style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))" }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{project.year}</span>
                  <span className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>{project.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {project.tags.map((tag, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={cardsInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: i * 0.15 + j * 0.08 + 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} style={{ color: j < 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
                      <span className="text-sm" style={{ color: j < 2 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", opacity: j < 2 ? 1 : 0.6 }}>
                        {tag}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div
                className="mx-4 mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ height: "180px", background: project.gradient }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ background: "hsl(0 0% 0% / 0.4)" }}>
                    <div className="w-6 h-6 rounded-full" style={{ background: project.accent }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{project.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
