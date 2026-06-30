import SEO from "@/components/SEO";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import LazyImage from "@/components/LazyImage";
import Magnetic from "@/components/Magnetic";

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

// High-end abstract/architectural placeholders for projects
const projects = [
  {
    id: 1,
    title: "Kubrut",
    client: "Web App",
    description: "Modern web application providing tailored solutions.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://kubrut.vercel.app",
    tags: ["React", "Vite", "Tailwind"],
    span: "col-span-1 lg:col-span-2",
    link: "https://kubrut.vercel.app"
  },
  {
    id: 2,
    title: "Lilo Technologies",
    client: "Corporate Website",
    description: "Professional corporate presence with dynamic UI.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://lilotechnologies.vercel.app",
    tags: ["Next.js", "Framer Motion"],
    span: "col-span-1",
    link: "https://lilotechnologies.vercel.app"
  },
  {
    id: 3,
    title: "RS Technologies",
    client: "Tech Agency",
    description: "Innovative technology agency portfolio.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://rstechnologies.vercel.app",
    tags: ["Web3", "React"],
    span: "col-span-1",
    link: "https://rstechnologies.vercel.app"
  },
  {
    id: 4,
    title: "TutionOS",
    client: "EdTech Platform",
    description: "Comprehensive operating system for tuition centers.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://tutionos.vercel.app",
    tags: ["EdTech", "SaaS", "Dashboard"],
    span: "col-span-1",
    link: "https://tutionos.vercel.app"
  },
  {
    id: 5,
    title: "ClientSyncOS",
    client: "CRM System",
    description: "Advanced client management and synchronization tool.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://clientsyncos.vercel.app",
    tags: ["CRM", "Enterprise", "React"],
    span: "col-span-1",
    link: "https://clientsyncos.vercel.app"
  },
  {
    id: 6,
    title: "BizzBrain",
    client: "AI Platform",
    description: "AI-powered business intelligence and analytics.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://bizzbrainn.vercel.app",
    tags: ["AI", "Analytics", "SaaS"],
    span: "col-span-1 lg:col-span-2",
    link: "https://bizzbrainn.vercel.app"
  },
  {
    id: 7,
    title: "Web2Gether",
    client: "Social Networking",
    description: "Connecting people through modern web interfaces.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://web-2-gether.vercel.app/",
    tags: ["Social", "Real-time", "WebRTC"],
    span: "col-span-1",
    link: "https://web-2-gether.vercel.app/"
  },
  {
    id: 8,
    title: "Campus Aid Buddy",
    client: "University Tool",
    description: "Student assistance and campus management system.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://campus-aid-buddy-s6eo.vercel.app/",
    tags: ["Education", "Management", "UI/UX"],
    span: "col-span-1",
    link: "https://campus-aid-buddy-s6eo.vercel.app/"
  },
  {
    id: 9,
    title: "VibeStay",
    client: "Hospitality",
    description: "Accommodation booking and hospitality management.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://vibestayy.netlify.app",
    tags: ["Booking", "Travel", "React"],
    span: "col-span-1 lg:col-span-2",
    link: "https://vibestayy.netlify.app"
  },
  {
    id: 10,
    title: "Chain Split",
    client: "DeFi App",
    description: "Blockchain-based bill splitting and expense sharing.",
    image: "https://image.thum.io/get/width/1200/crop/800/https://chain-split.vercel.app",
    tags: ["Web3", "DeFi", "Crypto"],
    span: "col-span-1 lg:col-span-3",
    link: "https://chain-split.vercel.app"
  }
];

const Portfolio = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <PageTransition>
      <SEO 
        title="Our Work | Custom SaaS & Enterprise Software Projects in Coimbatore"
        description="View our portfolio of custom software applications, B2B SaaS platforms, Web3 dApps, and Computer Vision solutions built by Coimbatore's top engineering agency."
        canonicalUrl="/portfolio"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Buildicy Portfolio",
          "url": "https://www.buildicy.com/portfolio",
          "description": "A curated selection of our most ambitious projects, featuring AI integrations, Web3 platforms, and high-performance engineering.",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Buildicy",
            "url": "https://www.buildicy.com"
          }
        })}
      />
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
                onClick={() => window.open(project.link, '_blank')}
                className={`group relative rounded-[32px] overflow-hidden bg-[#0C0C12] border border-white/5 hover:border-purple-500/30 transition-colors duration-500 flex flex-col min-h-[400px] md:min-h-[500px] cursor-pointer ${project.span}`}
              >
                {/* Top Content Area */}
                <div className="relative z-10 p-8 md:p-10 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-zinc-400">
                      {project.client}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors duration-500 cursor-pointer">
                      <ExternalLink size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight group-hover:text-purple-400 transition-colors duration-500">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-[#12121A] border border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Image Area */}
                <div className="px-4 pb-4 md:px-8 md:pb-8 mt-auto">
                  <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-[#1A1A1E] border border-white/5 shadow-2xl">
                    <LazyImage
                      src={project.image}
                      alt={project.title}
                      aspectRatio="h-full w-full"
                      className="group-hover:scale-105 transition-transform duration-700 ease-[0.22,1,0.36,1] object-cover object-top opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
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
            <Magnetic strength={0.3} scale={1.05}>
              <button className="group px-10 py-5 rounded-full bg-purple-600 text-white font-bold text-base flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:bg-purple-500 border border-purple-400/50">
                Start the Conversation
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnetic>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Portfolio;