import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Bot, CheckCircle2, User, Building, Briefcase, Target, Loader2, ArrowRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import Magnetic from "@/components/Magnetic";

const customEase = [0.22, 1, 0.36, 1];

const AiSdrDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    leadName: "",
    companyName: "",
    industry: "",
    painPoint: ""
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadName || !formData.companyName) {
      toast.error("Lead Name and Company Name are required.");
      return;
    }

    setLoading(true);
    setGeneratedEmail(null);

    try {
      // Connect to the local backend server on port 3001
      const response = await fetch("http://localhost:3001/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedEmail(data.email);
        toast.success("AI successfully drafted the pitch!");
      } else {
        toast.error(data.error || "Failed to generate pitch.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to AI server. Make sure the backend is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    toast.success(`Email dispatched to ${formData.leadName} via Resend! (Simulated)`);
    setGeneratedEmail(null);
    setFormData({ leadName: "", companyName: "", industry: "", painPoint: "" });
  };

  return (
    <PageTransition>
      <SEO 
        title="AI-SDR | Autonomous Sales Development"
        description="Buildicy's internal AI Sales Agent for autonomous lead generation and hyper-personalized outreach."
        canonicalUrl="/ai-sdr"
      />

      <div className="min-h-screen bg-[#050507] pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Cinematic Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: customEase as any }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/90 border border-white/10 backdrop-blur-2xl mb-6 shadow-2xl"
            >
              <Bot size={14} className="text-purple-500" />
              <span className="text-[11px] font-bold tracking-widest text-white uppercase font-['DM_Mono']">Internal Tool</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: customEase as any }}
              className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4 font-['Syne']"
            >
              Autonomous <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">AI-SDR</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: customEase as any }}
              className="text-zinc-400 max-w-2xl font-medium leading-relaxed"
            >
              Generate hyper-personalized cold outreach emails instantly using Groq & LLaMA 3. 
              Turn raw leads into booked meetings automatically.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Target Input Form */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: customEase as any }}
              className="lg:col-span-5"
            >
              <div className="bg-[#0C0C12]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target size={20} className="text-purple-400" /> Lead Context
                </h2>

                <form onSubmit={handleGenerate} className="space-y-5 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Lead Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        required
                        type="text" 
                        value={formData.leadName}
                        onChange={e => setFormData({...formData, leadName: e.target.value})}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Company Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        required
                        type="text" 
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Industry</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        value={formData.industry}
                        onChange={e => setFormData({...formData, industry: e.target.value})}
                        placeholder="e.g. Logistics & Supply Chain"
                        className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Core Pain Point</label>
                    <textarea 
                      rows={3}
                      value={formData.painPoint}
                      onChange={e => setFormData({...formData, painPoint: e.target.value})}
                      placeholder="What is their biggest problem right now? (e.g. Manual data entry is slowing down their warehouse ops)"
                      className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    />
                  </div>

                  <Magnetic strength={0.2}>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Drafting Pitch...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} className="text-purple-600" /> Generate Pitch
                        </>
                      )}
                    </button>
                  </Magnetic>
                </form>
              </div>
            </motion.div>

            {/* Right Column: AI Output Inbox */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: customEase as any }}
              className="lg:col-span-7 flex flex-col"
            >
              <div className="bg-[#12121A] border border-white/10 rounded-[32px] p-8 shadow-2xl flex-grow relative overflow-hidden flex flex-col">
                {/* Window Controls UI */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="flex-1 text-center text-xs font-medium text-zinc-500 font-['DM_Mono']">
                    Groq::LLaMA-3::Inference
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!generatedEmail && !loading && (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col items-center justify-center text-center p-10"
                    >
                      <div className="w-20 h-20 rounded-full bg-[#1A1A24] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                        <Bot size={32} className="text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Awaiting Context</h3>
                      <p className="text-zinc-500 text-sm max-w-sm">
                        Enter the lead details on the left, and the AI will craft a high-converting, personalized cold email in milliseconds.
                      </p>
                    </motion.div>
                  )}

                  {loading && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col items-center justify-center"
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full border-t-purple-500 animate-spin" />
                        <Sparkles size={24} className="text-purple-400 animate-pulse" />
                      </div>
                      <p className="mt-6 text-sm text-zinc-400 font-bold tracking-widest uppercase animate-pulse font-['DM_Mono']">
                        Synthesizing Pitch...
                      </p>
                    </motion.div>
                  )}

                  {generatedEmail && !loading && (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-grow flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full font-medium">
                          <CheckCircle2 size={14} /> Ready for Dispatch
                        </div>
                      </div>

                      <div className="bg-[#1A1A24]/40 border border-white/5 rounded-2xl p-6 text-zinc-300 whitespace-pre-wrap font-medium leading-relaxed flex-grow">
                        {generatedEmail}
                      </div>

                      <div className="flex gap-4 mt-6">
                        <button 
                          onClick={handleGenerate}
                          className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                        >
                          Regenerate
                        </button>
                        <Magnetic strength={0.1} className="flex-grow">
                          <button 
                            onClick={handleSend}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                          >
                            Approve & Dispatch <ArrowRight size={18} />
                          </button>
                        </Magnetic>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AiSdrDashboard;
