import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Magnetic from "./Magnetic";

const FooterCTA = () => {
    return (
        <section className="relative py-32 overflow-hidden bg-[#050507]">
            {/* Cinematic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] opacity-50" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-300 font-['DM_Mono']">The Final Ignition</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-10 font-['Syne']"
                >
                    Ready to <span className="italic text-purple-500">Scale?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed font-['Plus_Jakarta_Sans']"
                >
                    Join the elite brands leveraging Buildicy's neural architectures to redefine their digital presence and operational speed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="flex justify-center"
                >
                    <Magnetic>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                            className="group relative px-10 py-5 rounded-full bg-white text-[#050507] font-bold text-lg flex items-center gap-3 transition-transform duration-300 hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        >
                            Ignite Your Build
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Magnetic>
                </motion.div>
            </div>
        </section>
    );
};

export default FooterCTA;
