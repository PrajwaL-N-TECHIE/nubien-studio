import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// --------------------------------------------------------------------------
// ISOMETRIC STACK COMPONENT
// --------------------------------------------------------------------------
const StackLogo = ({ progress }: { progress: number }) => {
    return (
        <svg width="120" height="130" viewBox="0 0 68 72" fill="none" className="filter drop-shadow-2xl">
            <defs>
                <filter id="isof-preloader" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Foundation Layer (Level 0) */}
            <motion.g
                initial={{ y: 40, opacity: 0 }}
                animate={progress >= 1 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <path d="M8 54 L34 68 L60 54 L34 40 Z" fill="#5b21b6" opacity="0.9" />
                <path d="M8 54 L8 46 L34 32 L34 40 Z" fill="#4c1d95" opacity="0.95" />
                <path d="M60 54 L60 46 L34 32 L34 40 Z" fill="#6d28d9" opacity="0.9" />
                <path d="M8 46 L34 60 L60 46 L34 32 Z" fill="#8b5cf6" />
            </motion.g>

            {/* Logic Layer (Level 1) */}
            <motion.g
                initial={{ y: 20, opacity: 0 }}
                animate={progress >= 2 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
                <path d="M14 36 L34 46 L54 36 L34 26 Z" fill="#7c3aed" opacity="0.9" />
                <path d="M14 36 L14 30 L34 20 L34 26 Z" fill="#5b21b6" opacity="0.95" />
                <path d="M54 36 L54 30 L34 20 L34 26 Z" fill="#6d28d9" opacity="0.9" />
                <path d="M14 30 L34 40 L54 30 L34 20 Z" fill="#a855f7" />
            </motion.g>

            {/* Core Layer (Level 2) */}
            <motion.g
                initial={{ y: 10, opacity: 0 }}
                animate={progress >= 3 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            >
                <path d="M20 20 L34 27 L48 20 L34 13 Z" fill="#7c3aed" />
                <path d="M20 20 L20 15.5 L34 8.5 L34 13 Z" fill="#5b21b6" />
                <path d="M48 20 L48 15.5 L34 8.5 L34 13 Z" fill="#6d28d9" />
                <path d="M20 15.5 L34 22.5 L48 15.5 L34 8.5 Z" fill="#c084fc" />
            </motion.g>

            {/* Synapse Pulse */}
            <motion.circle
                cx="34"
                cy="8.5"
                r="3.5"
                fill="#ffffff"
                initial={{ scale: 0, opacity: 0 }}
                animate={progress >= 4 ? { scale: [1, 1.3, 1], opacity: 1 } : {}}
                transition={{
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    opacity: { duration: 0.5 }
                }}
                filter="url(#isof-preloader)"
            />
        </svg>
    );
};

// --------------------------------------------------------------------------
// THE BUILD STACK PRELOADER
// --------------------------------------------------------------------------
const Preloader = () => {
    const [complete, setComplete] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setProgress(1), 200),   // Foundation (Faster)
            setTimeout(() => setProgress(2), 400),   // Logic (Faster)
            setTimeout(() => setProgress(3), 600),   // Core (Faster)
            setTimeout(() => setProgress(4), 800),   // Synapse (Faster)
            setTimeout(() => setProgress(5), 1800),  // Start fade
            setTimeout(() => setComplete(true), 2400) // Much faster total time
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const word = "Buildicy";

    return (
        <AnimatePresence>
            {!complete && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        y: "-100%",
                        transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] }
                    }}
                    className="fixed inset-0 z-[10000] bg-[#060410] flex items-center justify-center overflow-hidden"
                >
                    {/* SUBTLE GRID BACKGROUND */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#f2eeff 1px, transparent 1px), linear-gradient(90deg, #f2eeff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* INTELLIGENCE BURST FLARE */}
                    <AnimatePresence>
                        {progress === 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 2.5] }}
                                transition={{ duration: 0.8 }}
                                className="absolute w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative flex flex-col items-center">
                        <StackLogo progress={progress} />

                        {/* WORDMARK - KINETIC TYPOGRAPHY */}
                        <div className="mt-12 overflow-hidden flex">
                            {word.split("").map((letter, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: "150%", opacity: 0, filter: "blur(10px)", scale: 0.8 }}
                                    animate={progress >= 4 ? {
                                        y: 0,
                                        opacity: 1,
                                        filter: "blur(0px)",
                                        scale: 1
                                    } : {}}
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.34, 1.56, 0.64, 1], // Springy easing
                                        delay: 0.8 + (i * 0.04)
                                    }}
                                    className="text-6xl md:text-8xl font-extrabold uppercase tracking-tighter text-white font-['Syne'] italic"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </div>

                        {/* MONOSPACE IDENTIFIER */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={progress >= 4 ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="mt-8 flex flex-col items-center"
                        >
                            <span className="text-[10px] md:text-xs font-bold tracking-[1.5em] text-[#c084fc] font-['DM_Mono'] uppercase">
                                Cinematic Intelligence
                            </span>
                        </motion.div>
                    </div>

                    {/* VIGNETTE & GLOW */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(109,40,217,0.12)_0%,transparent_70%)]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
