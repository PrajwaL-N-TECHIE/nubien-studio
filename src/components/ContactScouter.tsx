import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
    ChevronRight, ArrowLeft, Send, Sparkles,
    Rocket, Lightbulb, Zap, CheckCircle2,
    Users, Globe, Layout, Code2, Cpu, Scan, Activity
} from "lucide-react";
import Magnetic from "./Magnetic";
import { usePerformance } from "@/context/PerformanceContext";
import BuildicyDroid, { DroidState } from "./BuildicyDroid";
import { audio } from "../utils/audio";
import emailjs from '@emailjs/browser';

// --------------------------------------------------------------------------
// ANIMATED BUILDICY LOGO (Luxury Version)
// --------------------------------------------------------------------------
const BuildicyLogo = () => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-8"
        >
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse" />
            <motion.div
                className="relative w-16 h-16 rounded-[22px] bg-[#0A0A0F] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            >
                <svg width="40" height="42" viewBox="0 0 68 72" fill="none">
                    <path d="M8 54 L34 68 L60 54 L34 40 Z" fill="#5b21b6" />
                    <path d="M14 36 L34 46 L54 36 L34 26 Z" fill="#7c3aed" />
                    <path d="M20 15.5 L34 22.5 L48 15.5 L34 8.5 Z" fill="#c084fc" />
                    <circle cx="34" cy="8.5" r="3.5" fill="white" />
                </svg>

                {/* Ambient Glow Spin */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-30"
                />

                {/* Orbital Rings */}
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-[-8px] rounded-[30px] border border-purple-500/20"
                        animate={{
                            rotate: i === 0 ? 360 : -360,
                            scale: [1, 1.08, 1]
                        }}
                        transition={{
                            rotate: { duration: 12 + i * 4, repeat: Infinity, ease: "linear" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
};

// --------------------------------------------------------------------------
// ARCHITECTURE VISUALIZER (Performance Optimized)
// --------------------------------------------------------------------------
const ArchViz = () => {
    const { isLowEnd } = usePerformance();

    return (
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden transform-gpu">
            <svg width="100%" height="100%" className="absolute inset-0">
                <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#archGrid)" />

                {/* Moving Data Points - Disabled on low-end */}
                {!isLowEnd && [...Array(5)].map((_, i) => (
                    <motion.circle
                        key={i}
                        r="2"
                        fill="#A855F7"
                        animate={{
                            cx: ["0%", "100%"],
                            cy: [`${20 + i * 15}%`, `${20 + i * 15 + (Math.random() - 0.5) * 10}%`],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2
                        }}
                    />
                ))}
            </svg>

            {/* Pulsing Core - Reduced blur/size on mobile/low-end */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transform-gpu
                    ${isLowEnd ? 'w-[300px] h-[300px] bg-purple-600/5 blur-[40px]' : 'w-[600px] h-[600px] bg-purple-600/5 blur-[120px]'}
                `}
            />
        </div>
    );
};

// Premium Easing Curve
const customEase = [0.22, 1, 0.36, 1];

interface FormData {
    name: string;
    email: string;
    projectType: string;
    budget: string;
    timeline: string;
    message: string;
}

const steps = [
    {
        id: "identity",
        title: "Tell us about yourself",
        subtitle: "We'll start with the basics to personalize your experience.",
        icon: Users,
    },
    {
        id: "service",
        title: "What are you looking for?",
        subtitle: "Select the core focus of your next digital project.",
        icon: Lightbulb,
    },
    {
        id: "scope",
        title: "Budget & Timeline",
        subtitle: "Let's align on resources and your expected launch date.",
        icon: Zap,
    },
    {
        id: "vision",
        title: "The Final Vision",
        subtitle: "Any specific details or features you'd like to share?",
        icon: Sparkles,
    }
];

const neuralTags = [
    { id: "scale", label: "Scalability", icon: Zap },
    { id: "elite", label: "Elite UX", icon: Sparkles },
    { id: "secure", label: "Cyber-Security", icon: Globe },
    { id: "ai", label: "AI Integration", icon: Cpu },
    { id: "web3", label: "Web3 Ready", icon: Activity },
    { id: "cloud", label: "Cloud Native", icon: Layout }
];

const ContactScouter = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { isLowEnd } = usePerformance();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        projectType: "",
        budget: "",
        timeline: "",
        message: ""
    });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isBooting, setIsBooting] = useState(false);
    const [bootLogs, setBootLogs] = useState<string[]>([]);
    const [bootProgress, setBootProgress] = useState(0);

    // Boot Sequence Logic
    useEffect(() => {
        if (isOpen && !isSuccess && !isSubmitting) {
            setIsBooting(true);
            setBootProgress(0);
            setBootLogs([]);
            audio.playBoot();

            const logs = [
                "Initializing Apex Neural Link...",
                "Bypassing standard protocols...",
                "Establishing secure handshaking...",
                "Syncing with Buildicy Droid...",
                "Neural Link Active."
            ];

            let logIndex = 0;
            const logTimer = setInterval(() => {
                if (logIndex < logs.length) {
                    setBootLogs(prev => [...prev, `> ${logs[logIndex]}`]);
                    logIndex++;
                } else {
                    clearInterval(logTimer);
                    // Hanging for premium architectural feel
                    setTimeout(() => setIsBooting(false), 900);
                }
            }, 180);

            return () => clearInterval(logTimer);
        }
    }, [isOpen]);

    const nextStep = () => {
        if (currentStep === 0) {
            if (!formData.name.trim() || !formData.email.trim()) {
                setError("Please provide both your name and email.");
                return;
            }
            if (!formData.email.includes('@')) {
                setError("Please enter a valid email address.");
                return;
            }
        }
        if (currentStep === 1) {
            if (!formData.projectType) {
                setError("Please select a project category to continue.");
                return;
            }
        }
        setError(null);
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
        audio.playClick();
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
        audio.playClick();
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        audio.playBoot();

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            project_type: formData.projectType,
            budget: formData.budget,
            timeline: formData.timeline,
            message: formData.message,
            tags: selectedTags.join(', ')
        };

        try {
            const result = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""
            );

            console.log('Email sent successfully:', result.text);
            setIsSubmitting(false);
            setIsSuccess(true);
            audio.playSuccess();
        } catch (err) {
            console.error('EmailJS error:', err);
            setError("Communication link failed. Please check your credentials and try again.");
            setIsSubmitting(false);
        }
    };

    // Quality Score Calculation
    const qualityScore = useMemo(() => {
        let score = 0;
        if (formData.name && formData.email) score += 20;
        if (formData.projectType) score += 20;
        if (formData.budget) score += 20;
        if (formData.timeline) score += 10;
        if (formData.message.length > 20) score += 15;
        if (selectedTags.length > 0) score += 15;
        return Math.min(score, 100);
    }, [formData, selectedTags]);

    // Determine Droid State based on step and status
    const getDroidState = (): DroidState => {
        if (isSuccess) return "success";
        if (isSubmitting) return "thinking";
        if (currentStep === 1) return "scanning";
        if (currentStep === 3) return "restricted"; // Privacy/Vision focus
        return "idle";
    };

    // Calculate typing progress (mocked based on field length)
    const typingProgress = useMemo(() => {
        const currentField = focusedField === 'name' ? formData.name : focusedField === 'email' ? formData.email : "";
        return Math.min(currentField.length / 20, 1);
    }, [focusedField, formData.name, formData.email]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            filter: "blur(12px)",
            scale: 0.98
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            filter: "blur(12px)",
            scale: 0.98
        })
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={`absolute inset-0 bg-[#050507]/95 ${isLowEnd ? '' : 'backdrop-blur-3xl'}`}
            />

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: isBooting ? ["blur(10px) brightness(1.5)", "blur(0px) brightness(1)"] : "none"
                }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.6, ease: customEase as any }}
                className={`relative w-full max-w-5xl bg-[#0C0C12]/60 border border-white/10 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[480px] md:min-h-[550px] max-h-[90vh] ${isLowEnd ? '' : 'noise-overlay'} transform-gpu`}
            >
                <ArchViz />

                {/* Neural Handshake Boot UI */}
                <AnimatePresence>
                    {isBooting && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 z-[60] bg-[#050507] flex flex-col items-center justify-center p-12"
                        >
                            <div className="w-full max-w-md space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-500 font-['DM_Mono']">System Booting</span>
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600 font-['DM_Mono']">{Math.round(bootProgress)}%</span>
                                    </div>
                                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: isBooting ? "100%" : 0 }}
                                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                            onUpdate={(latest: any) => {
                                                if (latest.width && typeof latest.width === 'string') {
                                                    setBootProgress(parseFloat(latest.width));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 font-['DM_Mono'] text-[10px] text-zinc-500 uppercase tracking-widest leading-loose">
                                    {bootLogs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            {log}
                                        </motion.div>
                                    ))}
                                    {bootLogs.length < 5 && (
                                        <motion.span
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="inline-block w-2 h-3 bg-purple-500 align-middle ml-1"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Glitch Overlay during boot */}
                            <motion.div
                                animate={{
                                    opacity: [0, 0.05, 0, 0.1, 0],
                                    x: [0, -2, 2, -1, 0]
                                }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                                className="absolute inset-0 pointer-events-none bg-purple-500/5 mix-blend-overlay"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Sidebar */}
                <div className="w-full md:w-80 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 p-8 flex flex-col justify-between hidden md:flex relative z-10">
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="mb-6">
                            <BuildicyLogo />
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-white tracking-tighter font-['Syne']">Apex Assistant</span>
                            </div>
                        </div>

                        {/* Interactive Droid (Desktop) */}
                        <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-hidden">
                            <BuildicyDroid
                                state={getDroidState()}
                                typingProgress={typingProgress}
                                className="scale-[1.15] mb-8"
                            />

                            <div className="w-full space-y-7 mt-2">
                                {steps.map((step, i) => (
                                    <div key={step.id} className="flex items-center gap-4 group">
                                        <div className={`
                        w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-700
                        ${i <= currentStep ? 'bg-purple-600 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-transparent border-white/10'}
                      `}>
                                            {i < currentStep ? <CheckCircle2 size={16} className="text-white" /> : <span className="text-[10px] font-bold text-white">{i + 1}</span>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors font-['DM_Mono'] ${i <= currentStep ? 'text-purple-400' : 'text-zinc-700'}`}>{step.id}</span>
                                            <span className={`text-sm font-bold transition-colors font-['Syne'] ${i === currentStep ? 'text-white' : 'text-zinc-800'}`}>{step.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6">
                            {/* Apex Quality HUD */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 font-['DM_Mono']">Launch Probability</span>
                                    <motion.span
                                        key={qualityScore}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-[10px] font-bold font-['DM_Mono'] ${qualityScore > 70 ? 'text-purple-400' : 'text-zinc-600'}`}
                                    >
                                        {qualityScore}%
                                    </motion.span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-800 to-purple-500"
                                        animate={{ width: `${qualityScore}%` }}
                                        transition={{ type: "spring", damping: 20 }}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    opacity: qualityScore > (i * 20) ? 1 : 0.2,
                                                    height: [2, 4, 2]
                                                }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-1 bg-purple-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Signal: {qualityScore > 50 ? 'Stable' : 'Weak'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit">
                                <Activity size={12} className="text-purple-500" />
                                <span className="text-[9px] font-bold tracking-widest text-purple-500 uppercase">Neural Link Active</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                                We've got your back — anytime, anywhere. Your data remains encrypted.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 md:p-10 flex flex-col relative z-10 bg-white/[0.01] overflow-y-auto custom-scrollbar">
                    {/* Mobile Progress Bar */}
                    <div className="md:hidden flex gap-1 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-purple-600' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        {!isSuccess ? (
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.8, ease: customEase as any }}
                                className="flex-1 flex flex-col h-full"
                            >
                                <div className="mb-6 md:mb-8 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-2 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            key={`icon-${currentStep}`}
                                            className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 shadow-inner"
                                        >
                                            {(() => {
                                                const Icon = steps[currentStep].icon;
                                                return <Icon className="text-purple-400" size={24} />;
                                            })()}
                                        </motion.div>
                                    </div>

                                    {/* Mobile Droid */}
                                    <BuildicyDroid
                                        state={getDroidState()}
                                        typingProgress={typingProgress}
                                        className="md:hidden scale-75 -mr-4 -mt-4"
                                    />
                                </div>

                                <h2 className="text-4xl font-bold text-white tracking-tighter mb-2 font-['Syne'] leading-tight">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-zinc-500 text-base font-medium max-w-md">
                                    {steps[currentStep].subtitle}
                                </p>

                                <div className="flex-1 flex flex-col justify-center mt-4">
                                    {currentStep === 0 && (
                                        <div className="grid grid-cols-1 gap-12">
                                            {/* Luxury Name Field */}
                                            <div className="relative group">
                                                <label className={`absolute left-0 -top-5 text-[10px] font-black tracking-[0.2em] uppercase transition-all font-['DM_Mono'] ${focusedField === 'name' ? 'text-purple-500' : 'text-zinc-700'}`}>
                                                    Full Name
                                                </label>
                                                <div className={`relative border-b-2 transition-all duration-500 ${focusedField === 'name' ? 'border-purple-500' : 'border-white/10'}`}>
                                                    <Users className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-purple-500' : 'text-white/10'}`} />
                                                    <input
                                                        type="text"
                                                        onFocus={() => setFocusedField("name")}
                                                        onBlur={() => setFocusedField(null)}
                                                        placeholder="e.g. Alexander Pierce"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-transparent py-5 text-xl text-white font-semibold focus:outline-none placeholder:text-zinc-900"
                                                    />
                                                </div>
                                            </div>

                                            {/* Luxury Email Field */}
                                            <div className="relative group">
                                                <label className={`absolute left-0 -top-5 text-[10px] font-black tracking-[0.2em] uppercase transition-all font-['DM_Mono'] ${focusedField === 'email' ? 'text-purple-500' : 'text-zinc-700'}`}>
                                                    Email Address
                                                </label>
                                                <div className={`relative border-b-2 transition-all duration-500 ${focusedField === 'email' ? 'border-purple-500' : 'border-white/10'}`}>
                                                    <Globe className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-purple-500' : 'text-white/10'}`} />
                                                    <input
                                                        type="email"
                                                        onFocus={() => setFocusedField("email")}
                                                        onBlur={() => setFocusedField(null)}
                                                        placeholder="name@company.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-transparent py-5 text-xl text-white font-semibold focus:outline-none placeholder:text-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                            {[
                                                { id: 'web', label: 'Web Development', icon: Layout, desc: 'High-performance platforms.' },
                                                { id: 'app', label: 'Mobile Apps', icon: Rocket, desc: 'Next-gen mobile solutions.' },
                                                { id: 'branding', label: 'Design & Branding', icon: Sparkles, desc: 'Elite visual identities.' },
                                                { id: 'custom', label: 'Custom Labs', icon: Code2, desc: 'Complex logic & AI.' }
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, projectType: item.id });
                                                        setError(null);
                                                    }}
                                                    onMouseEnter={() => audio.playHover()}
                                                    className={`
                                relative p-5 rounded-[20px] border transition-all text-left flex flex-col gap-4 group overflow-hidden
                                ${formData.projectType === item.id
                                                            ? 'bg-purple-600/20 border-purple-500 shadow-[0_15px_30px_rgba(168,85,247,0.15)]'
                                                            : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}
                              `}
                                                >
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${formData.projectType === item.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-zinc-600'}`}>
                                                        <item.icon size={22} />
                                                    </div>
                                                    <div>
                                                        <span className={`block text-lg font-bold transition-colors font-['Syne'] ${formData.projectType === item.id ? 'text-white' : 'text-zinc-400'}`}>{item.label}</span>
                                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.15em] mt-1 block">{item.desc}</span>
                                                    </div>

                                                    {/* Selection Glow */}
                                                    {formData.projectType === item.id && (
                                                        <motion.div
                                                            layoutId="selectionGlow"
                                                            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-700 font-['DM_Mono'] ml-1">Project Budget</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['< $5k', '$5k - $15k', '$15k - $50k', '$50k+'].map((b) => (
                                                        <button
                                                            key={b}
                                                            onClick={() => setFormData({ ...formData, budget: b })}
                                                            className={`
                                   px-6 py-3 rounded-2xl border text-sm font-bold transition-all font-['Syne']
                                   ${formData.budget === b
                                                                    ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-500/20'
                                                                    : 'bg-white/[0.02] border-white/10 text-zinc-500 hover:text-white hover:border-white/40'}
                                 `}
                                                        >
                                                            {b}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-700 font-['DM_Mono'] ml-1">Expected Timeline</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['Immediate', 'Standard (4-8w)', 'Strategic (12w+)', 'Consultation'].map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setFormData({ ...formData, timeline: t })}
                                                            className={`
                                   px-6 py-3 rounded-2xl border text-sm font-bold transition-all font-['Syne']
                                   ${formData.timeline === t
                                                                    ? 'bg-white text-[#050507] border-white shadow-xl shadow-white/10'
                                                                    : 'bg-white/[0.02] border-white/10 text-zinc-500 hover:text-white hover:border-white/40'}
                                 `}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-5">
                                            <div className="relative">
                                                <label className={`absolute left-0 -top-7 text-[10px] font-black tracking-[0.2em] uppercase transition-all font-['DM_Mono'] ${focusedField === 'message' ? 'text-purple-500' : 'text-zinc-700'}`}>
                                                    The Vision Brief
                                                </label>
                                                <div className={`relative rounded-[20px] border-2 transition-all duration-500 p-5 ${focusedField === 'message' ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                                                    <textarea
                                                        onFocus={() => setFocusedField("message")}
                                                        onBlur={() => setFocusedField(null)}
                                                        placeholder="Define the challenge, the target, and the ultimate goal..."
                                                        value={formData.message}
                                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                        className="w-full bg-transparent text-lg text-white font-medium focus:outline-none placeholder:text-zinc-800 min-h-[120px] md:min-h-[160px] resize-none leading-relaxed"
                                                    />
                                                </div>
                                            </div>

                                            {/* Visionary Neural Map (Floating Tags) */}
                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-700 font-['DM_Mono'] ml-1">AI-Suggested Enhancements</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {neuralTags.map((tag) => (
                                                        <motion.button
                                                            key={tag.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                if (!selectedTags.includes(tag.id)) {
                                                                    setSelectedTags(prev => [...prev, tag.id]);
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        message: prev.message
                                                                            ? `${prev.message}\n> Focus: ${tag.label}`
                                                                            : `> Focus: ${tag.label}`
                                                                    }));
                                                                    audio.playHover();
                                                                }
                                                            }}
                                                            className={`
                                                                px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 border
                                                                ${selectedTags.includes(tag.id)
                                                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                                    : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'}
                                                            `}
                                                        >
                                                            <tag.icon size={12} />
                                                            {tag.label}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                                    <button
                                        onClick={prevStep}
                                        className={`flex items-center gap-3 text-xs font-black tracking-widest uppercase transition-all font-['DM_Mono'] ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-zinc-700 hover:text-white'}`}
                                    >
                                        <ArrowLeft size={16} /> Return
                                    </button>

                                    <Magnetic strength={0.2} scale={1.05}>
                                        <button
                                            onMouseEnter={() => audio.playHover()}
                                            onClick={nextStep}
                                            disabled={isSubmitting}
                                            className={`
                        relative group px-12 py-5 rounded-full text-sm font-black tracking-widest uppercase transition-all flex items-center gap-4 overflow-hidden font-['DM_Mono']
                        ${currentStep === steps.length - 1 ? 'bg-purple-600 text-white shadow-2xl shadow-purple-500/30' : 'bg-white text-[#050507]'}
                        ${isSubmitting ? 'cursor-wait' : ''}
                      `}
                                        >
                                            <span className="relative z-10">
                                                {isSubmitting ? 'Sending Request...' : currentStep === steps.length - 1 ? 'Submit Brief' : 'Continue'}
                                            </span>
                                            {!isSubmitting && <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}

                                            {/* Submit Phase Glow Animation */}
                                            {isSubmitting && (
                                                <motion.div
                                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-800"
                                                />
                                            )}
                                        </button>
                                    </Magnetic>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                className="flex-1 flex flex-col items-center justify-center text-center p-8"
                            >
                                <div className="relative mb-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 12 }}
                                        className="w-32 h-32 rounded-[40px] bg-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                                    >
                                        <CheckCircle2 size={64} className="text-white" />
                                    </motion.div>

                                    {/* Orbital Scan Effect */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-20px] border border-purple-500/30 rounded-full border-dashed"
                                    />
                                </div>

                                <h2 className="text-6xl font-bold text-white tracking-tighter mb-6 font-['Syne'] leading-none">Ready to <br /><span className="italic text-purple-500">Launch.</span></h2>
                                <p className="text-zinc-500 text-xl max-w-sm font-medium leading-relaxed mb-12">
                                    Your request has been received. Our team will review your project and get back to you shortly.
                                </p>

                                <Magnetic strength={0.3} scale={1.1}>
                                    <button
                                        onMouseEnter={() => audio.playHover()}
                                        onClick={onClose}
                                        className="px-12 py-5 rounded-full bg-white/[0.03] border border-white/10 text-white font-black text-xs tracking-[0.3em] uppercase hover:bg-white/[0.08] transition-all font-['DM_Mono']"
                                    >
                                        Exit Scouter
                                    </button>
                                </Magnetic>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactScouter;
