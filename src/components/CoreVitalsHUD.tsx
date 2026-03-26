import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Zap, ShieldCheck } from "lucide-react";

/**
 * CoreVitalsHUD
 * A futuristic overlay showing simulated system health and premium stats.
 */
const CoreVitalsHUD = () => {
    const [fps, setFps] = useState(120);
    const [latency, setLatency] = useState(12);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let rafId: number;

        const updateFps = (currentTime: number) => {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = currentTime;
            }
            rafId = requestAnimationFrame(updateFps);
        };

        rafId = requestAnimationFrame(updateFps);

        // Ping measurement (Real-world estimate)
        const measureLatency = async () => {
            const start = performance.now();
            try {
                await fetch("/favicon.ico", { method: 'HEAD', cache: 'no-store' });
                setLatency(Math.round(performance.now() - start));
            } catch {
                // Fallback to a small jittery range if fetch fails (offline/dev)
                setLatency(Math.floor(10 + Math.random() * 5));
            }
        };

        const latencyInterval = setInterval(measureLatency, 5000);
        measureLatency();

        return () => {
            cancelAnimationFrame(rafId);
            clearInterval(latencyInterval);
        };
    }, []);

    return (
        <div className="fixed bottom-10 left-10 z-[100] pointer-events-none">
            {/* Toggle Button (Interactive) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-10 h-10 rounded-xl bg-[#0A0A0F]/80 border border-white/10 backdrop-blur-xl flex items-center justify-center group hover:border-purple-500/50 transition-colors shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Cpu size={16} className={`${isOpen ? 'text-purple-400' : 'text-zinc-600'} group-hover:text-purple-400 transition-colors`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        className="mt-4 p-5 rounded-[24px] bg-[#0A0A0F]/90 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[200px] pointer-events-auto"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-green-500" />
                                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase font-['DM_Mono']">Performance</span>
                                </div>
                                <span className="text-xs font-bold text-white font-['DM_Mono']">{fps} FPS</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-500" />
                                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase font-['DM_Mono']">Latency</span>
                                </div>
                                <span className="text-xs font-bold text-white font-['DM_Mono']">{latency}ms</span>
                            </div>

                            <div className="h-px w-full bg-white/5" />

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-purple-500" />
                                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase font-['DM_Mono']">Core Status</span>
                                </div>
                                <span className="text-[10px] font-bold text-purple-400 uppercase font-['DM_Mono'] animate-pulse">Stable</span>
                            </div>

                            <div className="mt-4">
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: ["40%", "90%", "60%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    />
                                </div>
                                <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-2 font-['DM_Mono']">Memory Synthesis Active</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoreVitalsHUD;
