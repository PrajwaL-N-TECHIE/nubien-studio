import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Fingerprint, Lock, ShieldCheck, ArrowRight, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsAuthenticating(true);
    setStatusText("Verifying Buildicy Identity...");

    // Simulated Authentication Flow
    setTimeout(() => setStatusText("Decrypting clearance level..."), 1000);
    setTimeout(() => setStatusText("Access Granted."), 2000);
    setTimeout(() => {
      navigate('/student-dashboard');
    }, 2800);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden text-white selection:bg-purple-500/30">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Decrypting Overlay */}
            <AnimatePresence>
              {isAuthenticating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-[#0C0C12]/95 backdrop-blur-md flex flex-col items-center justify-center border border-purple-500/30 rounded-3xl"
                >
                  <div className="relative mb-6">
                    <ScanLine size={48} className="text-purple-500 animate-pulse" />
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                    />
                  </div>
                  <p className="text-sm font-mono text-purple-400 uppercase tracking-widest font-bold">
                    {statusText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 relative">
                <Sparkles className="text-purple-400" size={32} />
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Buildicy OS Gateway</h1>
              <p className="text-zinc-400 text-sm">Enter your secure registration ID to access the Student Command Center.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold ml-1">
                  Unique Buildicy ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Fingerprint className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. BLD-8492X"
                    className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono tracking-wider"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="text-zinc-600" size={16} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!studentId.trim() || isAuthenticating}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Initialize Uplink
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
              <ShieldCheck size={14} className="text-green-500" />
              <span>AES-256 Encrypted Connection</span>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
