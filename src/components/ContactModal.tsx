import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Mail, User, MessageSquare, Phone, MapPin, Cpu } from "lucide-react";
import { useState, useRef } from "react";
import Magnetic from "./Magnetic";

// --------------------------------------------------------------------------
// ANIMATED BUILDICY LOGO
// --------------------------------------------------------------------------
const BuildicyLogo = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse" />
      <motion.div
        className="relative w-16 h-16 rounded-[22px] bg-[#0A0A0F] flex items-center justify-center shadow-2xl border border-white/10"
        whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
      >
        <svg width="40" height="42" viewBox="0 0 68 72" fill="none">
          <path d="M8 54 L34 68 L60 54 L34 40 Z" fill="#5b21b6" />
          <path d="M14 36 L34 46 L54 36 L34 26 Z" fill="#7c3aed" />
          <path d="M20 15.5 L34 22.5 L48 15.5 L34 8.5 Z" fill="#c084fc" />
          <circle cx="34" cy="8.5" r="3.5" fill="white" />
        </svg>

        {/* Orbital Rings */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-[-8px] rounded-[30px] border border-purple-500/30"
            animate={{
              rotate: i === 0 ? 360 : -360,
              scale: [1, 1.05, 1]
            }}
            transition={{
              rotate: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// --------------------------------------------------------------------------
// PREMIUM CONTACT MODAL
// --------------------------------------------------------------------------
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal animation variants
  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30, rotateX: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 1,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2, ease: "easeIn" }
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          {/* Deep Dynamic Background */}
          <div className="absolute inset-0 bg-[#050507]/80" />

          {/* Animated Ambient Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] bg-blue-600/10 blur-[110px] rounded-full"
            />
          </div>

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-5xl h-full max-h-[800px] flex shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            <div className="relative w-full h-full overflow-hidden rounded-[40px] bg-[#0A0A0F]/90 backdrop-blur-3xl border border-white/10 flex flex-col md:flex-row shadow-2xl">

              {/* Close Button (Magnetic) */}
              <div className="absolute top-8 right-8 z-50">
                <Magnetic strength={0.3} scale={1.2}>
                  <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-white/60" />
                  </button>
                </Magnetic>
              </div>

              {/* Left Column - Branding & Info */}
              <div className="md:w-5/12 p-8 md:p-12 border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent flex flex-col justify-between">
                <motion.div variants={contentVariants} initial="hidden" animate="visible">
                  <motion.div variants={itemVariants} className="mb-12">
                    <BuildicyLogo />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-5xl font-bold text-white tracking-tight leading-none">
                      Architecting <br />
                      <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">The Future.</span>
                    </h2>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-sm">
                      Ready to transform your vision into an intelligent digital reality? Let's build something extraordinary.
                    </p>
                  </motion.div>
                </motion.div>

                <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-8">
                  {/* Contact Details */}
                  <div className="space-y-6">
                    {[
                      { icon: Mail, label: "Direct Email", value: "hello@buildicy.com" },
                      { icon: Phone, label: "Hotline", value: "+1 (555) 982-3041" },
                      { icon: MapPin, label: "Global Studio", value: "San Francisco / Virtual" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="flex items-center gap-5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-purple-600 group-hover:border-purple-500 shadow-xl">
                          <item.icon size={18} className="text-purple-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{item.label}</p>
                          <p className="text-base font-semibold text-white/90 group-hover:text-white">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div variants={itemVariants} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">Available for S1 2026</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Column - Premium Form */}
              <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto bg-[#0A0A0F]/50 flex flex-col justify-center">
                <motion.div variants={contentVariants} initial="hidden" animate="visible" className="max-w-md mx-auto w-full">
                  <motion.h3 variants={itemVariants} className="text-2xl font-bold text-white mb-2">
                    Start a Conversation
                  </motion.h3>
                  <motion.p variants={itemVariants} className="text-zinc-500 font-medium mb-10">
                    Fill out the details below and our lead architect will reach out within 24 hours.
                  </motion.p>

                  <form className="space-y-8">
                    {/* Name Field */}
                    <motion.div variants={itemVariants} className="relative">
                      <label className={`absolute left-0 -top-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${focusedField === 'name' ? 'text-purple-500' : 'text-zinc-600'}`}>
                        Full Name
                      </label>
                      <div className="relative border-b-2 border-white/10 focus-within:border-purple-500 transition-colors">
                        <User className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'name' ? 'text-purple-500' : 'text-white/20'}`} />
                        <input
                          type="text"
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="e.g. Alexander Pierce"
                          className="w-full bg-transparent py-4 text-white font-medium focus:outline-none placeholder:text-white/5"
                        />
                      </div>
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants} className="relative">
                      <label className={`absolute left-0 -top-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${focusedField === 'email' ? 'text-purple-500' : 'text-zinc-600'}`}>
                        Business Email
                      </label>
                      <div className="relative border-b-2 border-white/10 focus-within:border-purple-500 transition-colors">
                        <Mail className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-purple-500' : 'text-white/20'}`} />
                        <input
                          type="email"
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="name@company.com"
                          className="w-full bg-transparent py-4 text-white font-medium focus:outline-none placeholder:text-white/5"
                        />
                      </div>
                    </motion.div>

                    {/* Message Field */}
                    <motion.div variants={itemVariants} className="relative">
                      <label className={`absolute left-0 -top-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${focusedField === 'message' ? 'text-purple-500' : 'text-zinc-600'}`}>
                        Project Details
                      </label>
                      <div className="relative border-b-2 border-white/10 focus-within:border-purple-500 transition-colors">
                        <MessageSquare className={`absolute right-0 top-6 w-4 h-4 transition-colors ${focusedField === 'message' ? 'text-purple-500' : 'text-white/20'}`} />
                        <textarea
                          rows={4}
                          onFocus={() => setFocusedField("message")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Tell us about the challenge..."
                          className="w-full bg-transparent py-4 text-white font-medium focus:outline-none placeholder:text-white/5 resize-none"
                        />
                      </div>
                    </motion.div>

                    {/* Submit Button (Magnetic) */}
                    <motion.div variants={itemVariants} className="pt-4">
                      <Magnetic strength={0.1} scale={1.02}>
                        <button
                          type="submit"
                          className="w-full relative group overflow-hidden rounded-[20px] bg-purple-600 px-8 py-5 transition-all shadow-[0_20px_40px_rgba(168,85,247,0.3)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative flex items-center justify-center gap-3 font-bold text-lg text-white">
                            Submit Brief
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </div>

                          {/* Inner Shine */}
                          <motion.div
                            className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-200%]"
                            animate={{ x: "200%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                          />
                        </button>
                      </Magnetic>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-center text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                      Security Verified • SOC-2 Type II Compliant
                    </motion.p>
                  </form>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
