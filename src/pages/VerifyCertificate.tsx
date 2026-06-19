import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { audio } from "@/utils/audio";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
interface VerificationData {
  name: string;
  track: string;
  created_at: string;
  registration_id: string;
}

const trackNames: Record<string, string> = {
  uiux: "UI/UX Designer",
  ai_automation: "AI Automation Engineer",
  fullstack: "Full Stack Developer",
  blockchain: "Blockchain Engineer",
  ai_architect: "AI Architect"
};

const VerifyCertificate = () => {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError(false);
    setResult(null);

    try {
      const q = query(collection(db, "internships"), where("registration_id", "==", searchId.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Not found");
      }
      
      const data = querySnapshot.docs[0].data();
      setResult({
        name: data.name,
        track: data.track,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        registration_id: data.registration_id
      });
      
      // Play premium success chime
      audio.playSuccess();
    } catch (err) {
      setError(true);
      // Play soft error sound
      audio.playError();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden bg-[#050507]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-xl mx-auto relative z-10">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-900/30 rounded-full border border-purple-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <ShieldCheck size={40} className="text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Credential Verification</h1>
          <p className="text-white/60">Enter a Buildicy Registration ID to verify an intern's enrollment and credentials.</p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-12 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="e.g. BLDCY-UIUX-4921"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            className="w-full bg-[#0a0a0f] border-2 border-white/10 rounded-2xl py-6 pl-16 pr-40 text-white text-lg placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors uppercase font-['DM_Mono']"
          />
          <button 
            type="submit"
            disabled={loading || !searchId.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-900/10 border-2 border-green-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0" />
              
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Verified Authentic</h2>
              <p className="text-green-400 font-medium mb-8">This registration ID is valid.</p>
              
              <div className="bg-[#050507]/50 rounded-2xl p-6 text-left border border-white/5 space-y-4">
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-1">Intern Name</p>
                  <p className="text-lg font-bold text-white">{result.name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-1">Program Track</p>
                  <p className="text-white/90">{trackNames[result.track] || result.track}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-1">Registration Date</p>
                  <p className="text-white/90">{formatDate(result.created_at)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-900/10 border-2 border-red-500/30 rounded-3xl p-8 backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Record Not Found</h2>
              <p className="text-red-400 font-medium">No internship registration exists with this ID.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VerifyCertificate;
