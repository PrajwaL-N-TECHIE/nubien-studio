import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, CheckCircle2, Loader2, ShieldCheck, Mail, Key, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";

export default function StudentLogin() {
  const [mode, setMode] = useState<"login" | "change">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsAuthenticating(true);
    setStatusText(mode === "login" ? "Verifying credentials..." : "Changing password...");

    try {
      if (mode === "change") {
        if (!newPassword.trim() || newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        
        setStatusText("Verifying credentials...");
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        
        setStatusText("Updating password...");
        await updatePassword(userCredential.user, newPassword);
        
        setStatusText("Password Changed Successfully!");
        
        // Standard Login
        await signInWithEmailAndPassword(auth, email.trim(), newPassword.trim());
        setStatusText("Access Granted.");
      }

      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error("Auth Error:", error);
      setStatusText(error.message || "Authentication Failed. Please try again.");
      setTimeout(() => {
        setIsAuthenticating(false);
        setStatusText("");
      }, 3000);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden text-white selection:bg-purple-500/30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#0C0C12]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isAuthenticating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-[#0C0C12]/95 backdrop-blur-xl flex flex-col items-center justify-center border border-white/10 rounded-3xl p-6 text-center"
                >
                  {statusText.includes("Granted") || statusText.includes("Changed") ? (
                    <CheckCircle2 size={48} className="text-green-500 mb-6" />
                  ) : statusText.includes("Invalid") || statusText.includes("Failed") || statusText.includes("required") ? (
                    <ShieldCheck size={48} className="text-red-500 mb-6" />
                  ) : (
                    <Loader2 size={48} className="text-purple-500 animate-spin mb-6" />
                  )}
                  <p className={`text-sm font-bold tracking-wide ${
                    statusText.includes("Granted") || statusText.includes("Changed") ? "text-green-400" :
                    statusText.includes("Invalid") || statusText.includes("Failed") || statusText.includes("required") ? "text-red-400" :
                    "text-purple-400"
                  }`}>
                    {statusText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 relative group">
                <User className="text-white/80 group-hover:text-white transition-colors" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Internship Portal</h1>
              <p className="text-zinc-400 text-sm">
                {mode === "login" ? "Sign in to access your dashboard" : "Change your default password"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                    {mode === "change" ? "Current Password (or Reg ID)" : "Password"}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "change" ? "Enter current password" : "Enter your password"}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "change" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Key className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Set a secure new password"
                        className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                        required={mode === "change"}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!email.trim() || !password.trim() || (mode === "change" && !newPassword.trim()) || isAuthenticating}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {mode === "login" ? "Sign In" : "Change Password"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              {mode === "login" ? (
                <button 
                  onClick={() => setMode("change")}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Need to change your default password? Click here.
                </button>
              ) : (
                <button 
                  onClick={() => setMode("login")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Remembered your password? Sign in.
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
