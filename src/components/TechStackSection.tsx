import { motion } from "framer-motion";
import {
    Cpu, Database, Globe, Layers, Layout,
    Shield, Zap, Code2, Terminal, Brain
} from "lucide-react";

const techItems = [
    { name: "Fast Delivery", icon: Brain, color: "#A855F7" },
    { name: "Next.js 15", icon: Layout, color: "#FFFFFF" },
    { name: "TypeScript", icon: Code2, color: "#3178C6" },
    { name: "Framer Motion", icon: Zap, color: "#E11D48" },
    { name: "Tailwind CSS", icon: Globe, color: "#38B2AC" },
    { name: "PostgreSQL", icon: Database, color: "#336791" },
    { name: "Docker", icon: Layers, color: "#2496ED" },
    { name: "Redis", icon: Zap, color: "#DC382D" },
    { name: "OpenAI API", icon: Cpu, color: "#10A37F" },
    { name: "Supabase", icon: Shield, color: "#3ECF8E" },
];

const TechStackSection = () => {
    return (
        <section className="py-32 bg-[#050507] overflow-hidden border-y border-white/5 relative">
            <div className="max-w-7xl mx-auto px-6 mb-20 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
                >
                    <Terminal size={12} className="text-purple-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-['DM_Mono']">How We Build</span>
                </motion.div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white font-['Syne'] leading-[1.1] mb-6">
                    Our Core <span className="italic bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">Systems.</span>
                </h2>

                <p className="text-zinc-400 max-w-xl mx-auto text-lg font-medium leading-relaxed font-['Plus_Jakarta_Sans']">
                    A high-performance setup built with the most reliable tools in the industry.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {techItems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        whileHover={{ y: -5, borderColor: "rgba(168, 85, 247, 0.3)" }}
                        className="group flex flex-col items-center justify-center p-8 rounded-[32px] bg-[#0C0C12]/40 border border-white/5 backdrop-blur-2xl transition-all duration-500 hover:bg-purple-500/5"
                    >
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <item.icon size={32} style={{ color: item.color }} className="relative z-10 opacity-50 group-hover:opacity-100 transition-all duration-500" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-white transition-colors font-['DM_Mono']">
                            {item.name}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Decorative Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
};

export default TechStackSection;
