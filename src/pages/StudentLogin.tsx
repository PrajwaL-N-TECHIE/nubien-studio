import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setIsAuthenticating(true);
    setStatusText("Verifying credentials...");

    try {
      const q = query(collection(db, "internships"), where("registration_id", "==", studentId.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatusText("Invalid Registration ID.");
        setTimeout(() => {
          setIsAuthenticating(false);
          setStatusText("");
        }, 2000);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentData = { id: studentDoc.id, ...studentDoc.data() };

      setStatusText("Loading student profile...");
      
      setTimeout(() => {
        setStatusText("Access Granted.");
        sessionStorage.setItem("studentAuth", JSON.stringify(studentData));
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 800);
      }, 1000);
      
    } catch (error) {
      console.error("Login Error:", error);
      setStatusText("Connection Failed. Please try again.");
      setTimeout(() => {
        setIsAuthenticating(false);
        setStatusText("");
      }, 2000);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden text-white selection:bg-purple-500/30">
        {/* Subtle Background Elements */}
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
                  className="absolute inset-0 z-50 bg-[#0C0C12]/95 backdrop-blur-xl flex flex-col items-center justify-center border border-white/10 rounded-3xl"
                >
                  {statusText === "Access Granted." ? (
                    <CheckCircle2 size={48} className="text-green-500 mb-6" />
                  ) : statusText.includes("Invalid") || statusText.includes("Failed") ? (
                    <ShieldCheck size={48} className="text-red-500 mb-6" />
                  ) : (
                    <Loader2 size={48} className="text-purple-500 animate-spin mb-6" />
                  )}
                  <p className={`text-sm font-bold tracking-wide ${
                    statusText === "Access Granted." ? "text-green-400" :
                    statusText.includes("Invalid") || statusText.includes("Failed") ? "text-red-400" :
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
              <p className="text-zinc-400 text-sm">Sign in with your Buildicy Registration ID</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                  Registration ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. BLD-8492X"
                    className="w-full bg-[#050507] border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
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
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-zinc-500">
                Having trouble? Contact your program coordinator.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
