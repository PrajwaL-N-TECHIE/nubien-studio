import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, CheckCircle2, Search, Briefcase, Target, Loader2, ArrowRight, UserCircle, Send, Copy } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import Magnetic from "@/components/Magnetic";

const customEase = [0.22, 1, 0.36, 1];

const CopyButton = ({ textToCopy, label }: { textToCopy: string, label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`Copied ${label}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`text-[10px] px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg transition-colors border ${copied ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'}`}
    >
      {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
      {label}
    </button>
  );
};

interface LeadPitch {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string | null;
  emailBody: string;
  isSent?: boolean;
}

const AiSdrDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [campaignLeads, setCampaignLeads] = useState<LeadPitch[]>([]);
  const [loadingPhase, setLoadingPhase] = useState("");
  
  const [campaignType, setCampaignType] = useState<'b2b' | 'internship'>('b2b');
  
  const [formData, setFormData] = useState({
    personaTitle: "",
    painPoint: "",
    rawStudentData: ""
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (campaignType === 'b2b' && !formData.personaTitle) {
      toast.error("Persona Title is required (e.g., 'CTO').");
      return;
    }
    if (campaignType === 'internship' && !formData.rawStudentData) {
      toast.error("Raw student data is required.");
      return;
    }

    setLoading(true);
    setCampaignLeads([]);
    setLoadingPhase(campaignType === 'b2b' ? "Connecting to Apollo.io..." : "Parsing Student Data...");

    try {
      setTimeout(() => setLoadingPhase(campaignType === 'b2b' ? "Scraping high-value leads..." : "Analyzing student profiles..."), 1500);
      setTimeout(() => setLoadingPhase("Routing leads through Groq LLaMA-3..."), 3500);

      const endpoint = campaignType === 'b2b' ? "http://localhost:3001/api/generate-campaign" : "http://localhost:3001/api/generate-internship-campaign";
      const payload = campaignType === 'b2b' ? { personaTitle: formData.personaTitle, painPoint: formData.painPoint } : { rawData: formData.rawStudentData };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.body) throw new Error("ReadableStream not supported in this browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let splitIndex;
        while ((splitIndex = buffer.indexOf('\n\n')) >= 0) {
          const line = buffer.slice(0, splitIndex);
          buffer = buffer.slice(splitIndex + 2);

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                toast.error(data.error);
                setLoading(false);
                setLoadingPhase("");
                return;
              }

              if (data.lead) {
                setCampaignLeads((prev) => [...prev, data.lead]);
              }

              if (data.done) {
                toast.success("Campaign generation complete!");
                setLoading(false);
                setLoadingPhase("");
                return;
              }
            } catch (err) {
              console.error("Error parsing stream chunk", err, line);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to AI server. Ensure backend is running on port 3001.");
      setLoading(false);
      setLoadingPhase("");
    }
  };

  const [dispatching, setDispatching] = useState(false);

  const handleDispatchAll = async () => {
    setDispatching(true);
    toast.loading(`Dispatching ${campaignLeads.length} emails via Nodemailer...`, { id: 'dispatch' });

    let successCount = 0;
    let skipCount = 0;

    for (const lead of campaignLeads) {
      if (!lead.email || !lead.email.includes('@')) {
        console.warn(`Skipping ${lead.name}: Invalid email address (${lead.email})`);
        skipCount++;
        continue;
      }

      const match = lead.emailBody.match(/Subject:\s*(.*)\n\n([\s\S]*)/);
      const subject = match ? match[1].trim() : `Custom software for ${lead.company}`;
      const body = match ? match[2].trim() : lead.emailBody;

      try {
        const res = await fetch("http://localhost:3001/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: lead.email,
            subject: subject,
            text: body
          })
        });
        if (res.ok) {
          successCount++;
          setCampaignLeads(prev => prev.map(l => l.id === lead.id ? { ...l, isSent: true } : l));
        }
      } catch (err) {
        console.error("Failed to send to", lead.email, err);
      }
    }

    toast.dismiss('dispatch');
    if (successCount === 0) {
      toast.error(`Dispatch Failed! Check backend terminal for errors. ${skipCount > 0 ? `(${skipCount} skipped due to missing emails)` : ''}`);
    } else {
      toast.success(`Successfully dispatched ${successCount} emails! ${skipCount > 0 ? `(${skipCount} skipped)` : ''}`);
    }
    setDispatching(false);
  };

  return (
    <PageTransition>
      <SEO 
        title="AI-SDR | Autonomous Sales Pipeline"
        description="Buildicy's automated Apollo-to-Groq sales pipeline."
        canonicalUrl="/ai-sdr"
      />

      <div className="min-h-screen bg-[#050507] pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Cinematic Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: customEase as any }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121A]/90 border border-white/10 backdrop-blur-2xl mb-6 shadow-2xl"
            >
              <Bot size={14} className="text-purple-500" />
              <span className="text-[11px] font-bold tracking-widest text-white uppercase font-['DM_Mono']">Apollo Pipeline</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: customEase as any }}
              className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4 font-['Syne']"
            >
              Autonomous <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Lead Engine</span>
            </motion.h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Target Definition */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: customEase as any }}
              className="lg:col-span-4"
            >
              <div className="bg-[#0C0C12]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl sticky top-32">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target size={20} className="text-purple-400" /> Define Campaign
                </h2>
                
                <div className="flex bg-[#1A1A24] rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setCampaignType('b2b')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${campaignType === 'b2b' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    B2B Sales
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignType('internship')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${campaignType === 'internship' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Internships
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  {campaignType === 'b2b' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Persona Title</label>
                        <div className="relative">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input 
                            required
                            type="text" 
                            value={formData.personaTitle}
                            onChange={e => setFormData({...formData, personaTitle: e.target.value})}
                            placeholder='e.g. "SaaS Founder" or "CTO"'
                            className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Angle / Pain Point</label>
                        <textarea 
                          rows={3}
                          value={formData.painPoint}
                          onChange={e => setFormData({...formData, painPoint: e.target.value})}
                          placeholder="e.g. They need to reduce cloud costs by refactoring legacy code."
                          className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Raw Student Data</label>
                      <textarea 
                        required
                        rows={8}
                        value={formData.rawStudentData}
                        onChange={e => setFormData({...formData, rawStudentData: e.target.value})}
                        placeholder="Paste student data here. One student per line.&#10;e.g. rahul@college.edu - Knows React but struggling to get interviews."
                        className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none custom-scrollbar"
                      />
                    </div>
                  )}

                  <Magnetic strength={0.2}>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Mining Data...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} className="text-purple-600" /> Launch Campaign
                        </>
                      )}
                    </button>
                  </Magnetic>
                </form>
              </div>
            </motion.div>

            {/* Right Column: Automated Inbox */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: customEase as any }}
              className="lg:col-span-8 flex flex-col"
            >
              <div className="bg-[#12121A] border border-white/10 rounded-[32px] p-8 shadow-2xl flex-grow min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Briefcase size={20} className="text-purple-400" />
                    <span className="text-lg font-bold text-white">Campaign Inbox</span>
                  </div>
                  {campaignLeads.length > 0 && (
                    <span className="text-xs font-bold px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                      {campaignLeads.length} Leads Drafted
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!loading && campaignLeads.length === 0 && (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col items-center justify-center text-center opacity-50"
                    >
                      <Search size={48} className="mb-4 text-zinc-600" />
                      <h3 className="text-xl font-bold text-white mb-2">No Active Campaigns</h3>
                      <p className="text-zinc-400 max-w-sm">Enter a persona on the left. The AI will scrape Apollo and generate pitches automatically.</p>
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
                      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full border-t-purple-500 animate-spin" />
                        <Bot size={32} className="text-purple-400 animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-white tracking-widest uppercase font-['DM_Mono']">
                        {loadingPhase || "Initializing..."}
                      </p>
                    </motion.div>
                  )}

                  {!loading && campaignLeads.length > 0 && (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-grow flex flex-col gap-6"
                    >
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {campaignLeads.map((lead, idx) => {
                          const match = lead.emailBody.match(/Subject:\s*(.*)\n\n([\s\S]*)/);
                          const subject = match ? match[1].trim() : `Quick question for ${lead.name}`;
                          const body = match ? match[2].trim() : lead.emailBody;

                          return (
                            <div key={idx} className="bg-[#1A1A24]/40 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-white/5 gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <UserCircle size={20} className="text-purple-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold">{lead.name}</h4>
                                    <p className="text-xs text-zinc-400">{lead.title} @ {lead.company}</p>
                                    <p className="text-[10px] text-purple-400 mt-1 font-['DM_Mono']">{lead.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lead.isSent ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/30">
                                      <CheckCircle2 size={14} /> Sent via Gmail
                                    </div>
                                  ) : (
                                    <>
                                      <CopyButton textToCopy={lead.email} label="Email ID" />
                                      <CopyButton textToCopy={subject} label="Subject" />
                                      <CopyButton textToCopy={body} label="Body" />
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium">
                                <span className="text-zinc-500 font-bold mb-2 block">Subject: {subject}</span>
                                {body}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <Magnetic strength={0.1}>
                          <button 
                            onClick={handleDispatchAll}
                            disabled={dispatching}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                          >
                            {dispatching ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                            {dispatching ? "Dispatching..." : "Approve & Dispatch All"}
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
