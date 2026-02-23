import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

// High-end abstract/architectural placeholders for projects
const projects = [
  {
    id: 1,
    title: "Aura Neural Engine",
    client: "Enterprise AI SaaS",
    description: "A complete visual overhaul and front-end architecture rebuild for a leading predictive analytics firm.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    tags: ["React", "WebGL", "Python"],
    span: "col-span-1 lg:col-span-2", // Spans two columns
  },
  {
    id: 2,
    title: "Nexus Web3",
    client: "DeFi Protocol",
    description: "Cinematic landing experience and dashboard for a decentralized exchange.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    tags: ["Next.js", "Three.js"],
    span: "col-span-1", // Spans one column
  },
  {
    id: 3,
    title: "Vanguard OS",
    client: "Fintech Startup",
    description: "Responsive web application designed to handle high-frequency trading data in real-time.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop",
    tags: ["TypeScript", "Framer Motion"],
    span: "col-span-1", // Spans one column
  },
  {
    id: 4,
    title: "Onyx Digital",
    client: "Luxury E-Commerce",
    description: "An award-winning headless storefront pushing the boundaries of browser performance.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop",
    tags: ["Shopify Plus", "React", "GSAP"],
    span: "col-span-1 lg:col-span-2", // Spans two columns
  },
];

const Portfolio = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <PageTransition>
      <div className="pt-32 pb-40 min-h-screen bg-[#050507] text-white overflow-hidden selection:bg-purple-500/30">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[200px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* HEADER */}
          <div ref={headerRef} className="mb-24 md:mb-32 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: customEase }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/80 border border-white/10 backdrop-blur-xl mb-6 shadow-xl"
            >
              <Sparkles size={12} className="text-purple-500" />
              <span className="text-[11px] font-bold tracking-widest text-zinc-300 uppercase">Selected Works</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.1, ease: customEase }}
              className="text-5xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter mb-6 leading-[1.05]"
            >
              Engineering <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                Digital Excellence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: customEase }}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl font-medium leading-relaxed"
            >
              A curated selection of our most ambitious projects. We partner with visionaries to build cinematic software that dominates industries.
            </motion.p>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: index * 0.1, ease: customEase }}
                className={`group relative rounded-[32px] overflow-hidden bg-[#0C0C12] border border-white/5 hover:border-purple-500/30 transition-colors duration-500 flex flex-col min-h-[400px] md:min-h-[500px] ${project.span}`}
              >
                {/* Image Background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-[0.22,1,0.36,1]"
                  />
                  {/* Heavy dark gradient overlay so text is always readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent" />
                </div>

                {/* Floating Top Bar */}
                <div className="relative z-10 p-8 flex justify-between items-start">
                  <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-widest uppercase text-white">
                    {project.client}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors duration-500 cursor-pointer">
                    <ExternalLink size={16} className="text-white group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 mt-auto p-8 pt-20">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight group-hover:text-purple-300 transition-colors duration-500">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-[#12121A]/80 backdrop-blur-md border border-white/5 text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* BOTTOM CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: customEase }}
            className="mt-32 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Have a project in mind?</h2>
            <button className="group px-8 py-4 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center gap-3 mx-auto transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:bg-purple-500 border border-purple-400/50">
              Start the Conversation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Portfolio;