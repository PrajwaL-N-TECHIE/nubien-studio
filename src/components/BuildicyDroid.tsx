import { motion } from "framer-motion";
import { usePerformance } from "@/context/PerformanceContext";

export type DroidState = "idle" | "scanning" | "thinking" | "success" | "restricted";

interface BuildicyDroidProps {
    state?: DroidState;
    typingProgress?: number; // 0 to 1
    className?: string;
}

const BuildicyDroid = ({ state = "idle", typingProgress = 0.5, className = "" }: BuildicyDroidProps) => {
    const { isLowEnd } = usePerformance();

    // Logic for pupil movement based on typing progress (similar to user's JS)
    const pupilX = (typingProgress * 16) - 8;

    // Animation variants based on state
    const shutterTopVariants = {
        idle: { y: -18 },
        scanning: { y: -5 },
        thinking: { y: [-15, -10, -15], transition: { repeat: Infinity, duration: 2 } },
        success: { y: -25, scale: 1.1 },
        restricted: { y: 16 }
    };

    const shutterBottomVariants = {
        idle: { y: 18 },
        scanning: { y: 0 },
        thinking: { y: [15, 10, 15], transition: { repeat: Infinity, duration: 2 } },
        success: { y: 25, scale: 1.1 },
        restricted: { y: -16 }
    };

    const pupilVariants = {
        idle: { x: pupilX, y: 0 },
        scanning: { x: [-8, 8, -8], y: 0, transition: { repeat: Infinity, duration: 1.5, ease: "linear" as any } },
        thinking: { x: 0, y: -8 },
        success: { x: 0, y: 0, scale: 1.5 },
        restricted: { x: 0, y: 0 }
    };

    return (
        <div className={`relative w-40 h-40 ${className}`}>
            <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="droidMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#d4d4d8" />
                        <stop offset="100%" stopColor="#52525b" />
                    </linearGradient>
                    <linearGradient id="visorGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#09090b" />
                        <stop offset="100%" stopColor="#18181b" />
                    </linearGradient>
                    <linearGradient id="shutterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#a1a1aa" />
                    </linearGradient>
                    <filter id="sensorGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g transform="translate(100 100)">
                    {/* Body Shell */}
                    <path d="M-70 -20 C-70 -70 70 -70 70 -20 L 60 60 C 60 90 -60 90 -60 60 Z" fill="url(#droidMetal)" stroke="#3f3f46" strokeWidth="2" />

                    {/* Side Connectors */}
                    <rect x="-85" y="-10" width="15" height="40" rx="5" fill="#27272a" stroke="#3f3f46" />
                    <rect x="70" y="-10" width="15" height="40" rx="5" fill="#27272a" stroke="#3f3f46" />

                    {/* Visor Area */}
                    <path d="M-55 0 C-55 -25 55 -25 55 0 L 50 45 C 50 60 -50 60 -50 45 Z" fill="url(#visorGrad)" stroke="#3f3f46" strokeWidth="1" />

                    {/* Pupils with Reactive Movement */}
                    <motion.g
                        animate={state === "idle" ? pupilVariants.idle : pupilVariants[state]}
                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    >
                        <circle cx="-25" cy="25" r="10" fill="#a855f7" filter="url(#sensorGlow)" />
                        <circle cx="-25" cy="25" r="5" fill="#ffffff" />
                        <circle cx="25" cy="25" r="10" fill="#a855f7" filter="url(#sensorGlow)" />
                        <circle cx="25" cy="25" r="5" fill="#ffffff" />
                    </motion.g>

                    {/* Tech Accents in Visor */}
                    <path d="M-50 5 C-30 5 -10 15 -5 30" stroke="rgba(168,85,247,0.2)" strokeWidth="3" fill="none" strokeLinecap="round" />

                    {/* Top Shutter (Animated) */}
                    <motion.g
                        animate={shutterTopVariants[state]}
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    >
                        <path d="M-58 -5 C-58 -30 58 -30 58 -5 L 58 15 L -58 15 Z" fill="url(#shutterGrad)" stroke="#3f3f46" strokeWidth="1.5" />
                        {!isLowEnd && <line x1="-50" y1="5" x2="50" y2="5" stroke="#71717a" strokeWidth="2" />}
                    </motion.g>

                    {/* Bottom Shutter (Animated) */}
                    <motion.g
                        animate={shutterBottomVariants[state]}
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    >
                        <path d="M-58 65 L 58 65 L 58 45 C 58 70 -58 70 -58 45 Z" fill="url(#shutterGrad)" stroke="#3f3f46" strokeWidth="1.5" />
                        {!isLowEnd && <line x1="-50" y1="55" x2="50" y2="55" stroke="#71717a" strokeWidth="2" />}
                    </motion.g>
                </g>
            </svg>
        </div>
    );
};

export default BuildicyDroid;
