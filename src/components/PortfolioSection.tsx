import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { CheckCircle2, ArrowRight, ExternalLink, Sparkles, ArrowUpRight } from "lucide-react";

const projects = [
  {
    year: "2024",
    name: "Lemonide Tech",
    tags: ["AI Integration", "Responsive Design", "Custom Layouts"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    color: "from-purple-500 to-indigo-500",
    speed: 0 // Scroll speed modifier for parallax
  },
  {
    year: "2024",
    name: "Nexus AI",
    tags: ["Machine Learning", "Real-time Analytics", "API Design"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    color: "from-blue-500 to-purple-500",
    speed: 40 // Middle card scrolls slightly slower/faster
  },
  {
    year: "2023",
    name: "VisionAI Studio",
    tags: ["Computer Vision", "Cloud Deployment", "Data Pipelines"],
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop",
    color: "from-pink-500 to-purple-500",
    speed: 15
  },
];

/* -------------------------------------------------------------------------- */
/* INTERACTIVE 3D PROJECT CARD                                                */
/* -------------------------------------------------------------------------- */

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  
  // Mouse 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 100, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.15, type: "spring", bounce: 0.4 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative z-10 perspective-1000"
    >
      <div 
        className="group h-full bg-[#0C0C0E] border border-[#2A2A2E] rounded-[32px] overflow-hidden flex flex-col transition-all duration-500 hover:border-purple-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)]"
      >
        {/* Card Content Top */}
        <div className="p-8 pb-6 flex-grow relative z-20 bg-[#0C0C0E]">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#1A1A1E] text-zinc-400 border border-[#2A2A2E] tracking-widest">
              {project.year}
            </span>
            <div className="w-10 h-10 rounded-full bg-[#1A1A1E] flex items-center justify-center border border-[#2A2A2E] group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-500 group-hover:rotate-45">
              <ArrowUpRight size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          
          <h3 className="text-3xl font-semibold text-white mb-6 tracking-tight">
            {project.name}
          </h3>
          
          <div className="flex flex-col gap-3">
            {project.tags.map((tag, j) => (
              <div key={j} className="flex items-center gap-3 overflow-hidden">
                <CheckCircle2 size={16} className={j < 2 ? "text-purple-500" : "text-zinc-600"} />
                <span className={`text-sm font-medium ${j < 2 ? "text-zinc-300" : "text-zinc-500"}`}>
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Visual Bottom (Image) */}
        <div className="px-4 pb-4 mt-auto">
          <div className="relative h-56 rounded-2xl overflow-hidden w-full bg-[#1A1A1E]">
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white text-sm font-semibold flex items-center gap-2 backdrop-blur-md shadow-xl"
              >
                View Case Study <ArrowRight size={14} />
              </motion.div>
            </div>

            {/* Gradient Overlay for blending */}
            <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-30 mix-blend-overlay z-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            {/* Reveal Image Animation */}
            <motion.img 
              initial={{ scale: 1.4 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              src={project.image} 
              alt={project.name} 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};


/* -------------------------------------------------------------------------- */
/* MAIN SECTION COMPONENT                                                     */
/* -------------------------------------------------------------------------- */

const PortfolioSection = () => {
  const sectionRef = useRef(null);
  
  // Parallax tracking for background and cards
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  // Text Reveal Logic
  const title1 = "Showcasing Your Best".split(" ");
  const title2 = "Work with Pure Precision.".split(" ");

  return (
    <section id="portfolio" ref={sectionRef} className="relative py-32 px-6 bg-[#08080A] text-white overflow-hidden min-h-screen">
      
      {/* Animated Parallax Background Glows */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={14} className="text-purple-400" />
            </motion.div>
            <span className="text-sm font-medium text-zinc-300 tracking-wide">Portfolio</span>
          </motion.div>

          {/* Staggered Word Reveal for Headings */}
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-2 text-white flex flex-wrap justify-center gap-x-4">
            {title1.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotateZ: 5 }}
                whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 text-zinc-600 flex flex-wrap justify-center gap-x-4">
            {title2.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotateZ: 5 }}
                whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg max-w-xl mx-auto text-zinc-400 leading-relaxed"
          >
            A portfolio is more than just projects—it's your story, vision, and expertise. Reboot ensures your work stands out with unmatched elegance.
          </motion.p>
        </div>

        {/* Portfolio Cards Grid with Parallax offsets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 perspective-1000">
          {projects.map((project, i) => {
            // Calculate a slight vertical offset based on scroll to make them float differently
            const yOffset = useTransform(scrollYProgress, [0, 1], [0, project.speed]);
            
            return (
              <motion.div key={i} style={{ y: yOffset }}>
                <ProjectCard project={project} index={i} />
              </motion.div>
            );
          })}
        </div>

        {/* Magnetic "View More" Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 text-center flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 rounded-xl text-sm font-semibold bg-[#0C0C0E] border border-[#2A2A2E] hover:border-purple-500/50 text-white transition-all duration-300 flex items-center gap-3 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-hidden"
          >
            {/* Button Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            
            <span className="relative z-10">View All Masterpieces</span>
            
            <motion.div 
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <ArrowRight size={16} className="text-purple-400" />
            </motion.div>
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

export default PortfolioSection;