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
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge-pill inline-flex mb-6">
            <span className="badge-dot">
              <div className="w-2 h-2 rounded-full border border-white/60" />
            </span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Portfolio</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light mb-3" style={{ color: "hsl(var(--foreground))" }}>
            Showcasing Your Best
          </h2>
          <h2 className="text-4xl md:text-6xl font-light mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Work with Pure Precision.
          </h2>
          <p className="text-base max-w-md mx-auto mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            A portfolio is more than just projects—it's your story, vision, and expertise. Reboot ensures your work stands out with a rank.
          </p>
          <button
            className="px-8 py-4 rounded-2xl text-sm font-semibold"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            View More Works
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden"
              style={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              {/* Project info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {project.year}
                  </span>
                  <span className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    {project.name}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {project.tags.map((tag, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2 size={16} style={{ color: j < 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
                      <span
                        className="text-sm"
                        style={{ color: j < 2 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", opacity: j < 2 ? 1 : 0.6 }}
                      >
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual preview */}
              <div
                className="mx-4 mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ height: "180px", background: project.gradient }}
              >
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: "hsl(0 0% 0% / 0.4)" }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ background: project.accent }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--foreground) / 0.7)" }}>
                    {project.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
