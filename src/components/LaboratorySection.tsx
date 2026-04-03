import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Beaker, Binary, Cpu, History, Rocket, Heart, Users, Star } from "lucide-react";
import TiltCard from "./TiltCard";
import { usePerformance } from "@/context/PerformanceContext";
import PrajwalImage from "@/assets/prajwal.jpg";
import MukeshImage from "@/assets/mukesh.jpg";


// --------------------------------------------------------------------------
// PHYSICS-BASED GLASS DISTORTION
// --------------------------------------------------------------------------
const GlassDistortion = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                left: springX,
                top: springY,
                x: "-50%",
                y: "-50%",
            }}
            className="fixed pointer-events-none z-50 w-[400px] h-[400px] rounded-full mix-blend-overlay opacity-30 blur-[100px] bg-white/20"
        >
            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        </motion.div>
    );
};

/**
 * LIQUID METAL PARTICLE SYSTEM
 * Simulates futuristic mercury-like behavior using Canvas
 */
const LiquidMetalLab = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const { isLowEnd } = usePerformance();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Performance optimization
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = isLowEnd ? 12 : 25; // Drastically reduced for smoothness

        class Particle {
            x: number; y: number; baseSize: number; size: number;
            vx: number; vy: number; color: string;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.baseSize = Math.random() * 60 + 30;
                this.size = this.baseSize;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = (Math.random() - 0.5) * 1.2;
                this.color = Math.random() > 0.5 ? '#A855F7' : '#FFFFFF';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < -100) this.x = canvas!.width + 100;
                if (this.x > canvas!.width + 100) this.x = -100;
                if (this.y < -100) this.y = canvas!.height + 100;
                if (this.y > canvas!.height + 100) this.y = -100;

                const dx = mouse.current.x - this.x;
                const dy = mouse.current.y - this.y;
                const distSq = dx * dx + dy * dy; // Faster than sqrt
                if (distSq < 90000) { // 300^2
                    const dist = Math.sqrt(distSq);
                    this.size = this.baseSize * (1 + (300 - dist) / 300);
                    this.x -= dx * 0.005;
                    this.y -= dy * 0.005;
                } else {
                    this.size = this.baseSize;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.fillStyle = this.color === '#A855F7' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.05)';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const resize = () => {
            // Draw at half resolution for massive speed boost with blur
            const scale = 0.5;
            canvas.width = window.innerWidth * scale;
            canvas.height = window.innerHeight * scale;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            particles = Array.from({ length: particleCount }, () => new Particle());
        };

        const render = () => {
            ctx.fillStyle = '#050507'; // Match background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        const handleMouseMove = (e: MouseEvent) => {
            const scale = 0.5;
            mouse.current = { x: e.clientX * scale, y: e.clientY * scale };
        };
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLowEnd]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen grayscale"
            style={{ filter: isLowEnd ? 'blur(20px)' : 'blur(40px) contrast(150%)' }}
        />
    );
};

const milestones = [
    {
        year: "The Beginning",
        title: "A Vision",
        description: "Prajwal.N, driven by a passion for technology and design, decided to build something that truly helps people.",
        icon: Heart,
        color: "#A855F7"
    },
    {
        year: "2026",
        title: "Buildicy is Born",
        description: "Founded in 2026, the studio was established to combine engineering precision with human-centered design.",
        icon: Rocket,
        color: "#7C3AED"
    },
    {
        year: "Forward",
        title: "The Next Chapter",
        description: "Today, we continue to grow, building simple yet powerful systems for people around the world.",
        icon: Star,
        color: "#6D28D9"
    }
];

const LeadershipCard = ({ name, role, isCEO, imageSrc }: { name: string, role: string, isCEO?: boolean, imageSrc?: string }) => (
    <TiltCard className="h-full">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 md:p-16 rounded-[60px] bg-[#0C0C12]/60 border border-white/10 backdrop-blur-3xl relative group overflow-hidden h-full text-center"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col items-center h-full">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-[#12121A] border border-white/5 flex items-center justify-center mb-10 shadow-2xl group-hover:border-purple-500/50 transition-all duration-500 overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500/30">
                    {imageSrc ? (
                        <img src={imageSrc} alt={`${name} - ${role} of Buildicy`} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <Users className="text-purple-400 group-hover:text-white transition-colors" size={64} />
                    )}
                </div>
                <h4 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Syne'] tracking-tighter whitespace-normal md:whitespace-nowrap">{name}</h4>
                <div className="text-sm md:text-base font-bold text-purple-400 tracking-[0.3em] uppercase font-['DM_Mono'] mb-8">{role}</div>
                {isCEO ? (
                    <div className="p-6 md:p-8 rounded-[32px] bg-white/[0.03] border border-white/5 text-sm md:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl flex-grow flex items-center">
                        Leading the vision & growth of Buildicy with architectural precision, creative excellence, and a commitment to building human-centered technology.
                    </div>
                ) : (
                    <div className="p-6 md:p-8 rounded-[32px] bg-white/[0.03] border border-white/5 text-sm md:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl flex-grow flex items-center">
                        Architecting the future of Buildicy's core systems and logical infrastructure, with a focus on engineering excellence and scalable solutions.
                    </div>
                )}
            </div>
            {/* Corner Decorative Accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/15 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </motion.div>
    </TiltCard>
);

const LaboratorySection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="relative py-32 bg-[#050507] overflow-hidden">
            <LiquidMetalLab />
            <GlassDistortion />

            {/* Background Decorative Elements */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* LEADERSHIP SECTION */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 shadow-inner"
                    >
                        <Users size={12} className="text-purple-400" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 font-['DM_Mono']">The Leadership</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white font-['Syne'] leading-[1.1] mb-12">
                        Driven by <span className="italic bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">Vision & Purpose.</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        <LeadershipCard name="Prajwal.N" role="Founder & CEO" isCEO={true} imageSrc={PrajwalImage} />
                        <LeadershipCard name="Mukeshkumar MS" role="Cofounder & CTO" isCEO={false} imageSrc={MukeshImage} />

                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mt-32">

                    {/* Left Column: Story Visual */}
                    <motion.div
                        style={{ opacity }}
                        className="relative h-[400px] md:h-[600px] rounded-[48px] overflow-hidden border border-white/10 bg-[#0C0C12]/50 backdrop-blur-xl"
                    >
                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Heart className="text-purple-400" size={32} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 font-['DM_Mono']">Our Story</span>
                                    <div className="text-2xl font-bold text-white mt-1">EST. 2026</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="h-px w-full bg-gradient-to-r from-purple-500/50 to-transparent" />
                                <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-white font-['Syne'] leading-tight">
                                    Built on <br />
                                    <span className="italic text-purple-500">Trust and Innovation.</span>
                                </h3>
                            </div>
                        </div>

                        {/* Simulated Flow */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [-20, 600],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 5,
                                        repeat: Infinity,
                                        delay: Math.random() * 10,
                                        ease: "linear"
                                    }}
                                    className="absolute w-px h-20 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
                                    style={{ left: `${i * 5}%`, top: -100 }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Milestones */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 shadow-inner"
                        >
                            <History size={12} className="text-purple-400" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 font-['DM_Mono']">The Journey So Far</span>
                        </motion.div>

                        <div className="space-y-16 relative">
                            {/* Vertical Line Accent */}
                            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent" />

                            {milestones.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                    className="relative pl-12 group"
                                >
                                    <div
                                        className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-[#050507] z-10 transition-transform duration-500 group-hover:scale-125 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        style={{ backgroundColor: item.color }}
                                    />

                                    <TiltCard tiltReverse>
                                        <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-colors duration-500 group-hover:bg-white/[0.04]">
                                            <div className="text-[10px] font-black text-purple-400 tracking-[0.3em] uppercase mb-2 font-['DM_Mono'] opacity-70">
                                                {item.year}
                                            </div>
                                            <h4 className="text-2xl font-bold text-white mb-3 font-['Syne'] tracking-tight group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
                                                {item.description}
                                            </p>
                                        </div>
                                    </TiltCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default LaboratorySection;
