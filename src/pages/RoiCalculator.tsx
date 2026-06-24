import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Plus, Trash2, ArrowRight, CheckCircle2, Lock, Sparkles, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import Magnetic from "@/components/Magnetic";
import { toast } from "sonner";

const customEase = [0.22, 1, 0.36, 1];

interface SaasTool {
  id: string;
  name: string;
  cost: number;
}

const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.93 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'INR', symbol: '₹', rate: 83.5 }
];

const RoiCalculator = () => {
  const [currencyCode, setCurrencyCode] = useState('USD');
  const activeCurrency = currencies.find(c => c.code === currencyCode) || currencies[0];

  const [tools, setTools] = useState<SaasTool[]>([
    { id: '1', name: 'Shopify / Webflow', cost: Math.round(299 * activeCurrency.rate) },
    { id: '2', name: 'Zapier / Make', cost: Math.round(100 * activeCurrency.rate) },
    { id: '3', name: 'Airtable / CRM', cost: Math.round(150 * activeCurrency.rate) },
  ]);

  const [email, setEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalMonthly = tools.reduce((acc, tool) => acc + tool.cost, 0);
  const total5Year = totalMonthly * 60;
  
  // DYNAMIC ROI ENGINE
  const baseBuildCostUsd = 5000;
  const perToolCostUsd = 1500;
  const customBuildCostUsd = baseBuildCostUsd + (tools.length * perToolCostUsd);
  const customBuildCost = Math.round(customBuildCostUsd * activeCurrency.rate);
  
  const estimatedSavings = total5Year - customBuildCost;
  const breakEvenMonths = totalMonthly > 0 ? Math.ceil(customBuildCost / totalMonthly) : 0;

  const handleCurrencyChange = (newCode: string) => {
    const newCurrency = currencies.find(c => c.code === newCode) || currencies[0];
    
    // Update the existing tools costs to reflect the new currency roughly
    setTools(tools.map(t => ({
      ...t,
      cost: Math.round((t.cost / activeCurrency.rate) * newCurrency.rate)
    })));

    setCurrencyCode(newCode);
  };

  const handleAddTool = () => {
    setTools([...tools, { id: Date.now().toString(), name: '', cost: 0 }]);
  };

  const handleRemoveTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  const handleUpdateTool = (id: string, field: 'name' | 'cost', value: string | number) => {
    setTools(tools.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    toast.loading("Calculating your massive savings...", { id: 'calc' });

    try {
      const res = await fetch("http://localhost:3001/api/roi-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          monthlySaasCost: totalMonthly,
          estimatedSavings,
          currency: activeCurrency.code,
          currencySymbol: activeCurrency.symbol,
          customBuildCost
        })
      });

      if (res.ok) {
        toast.dismiss('calc');
        toast.success("Results unlocked! We also emailed you a copy.");
        setIsUnlocked(true);
      } else {
        throw new Error("Failed to capture lead");
      }
    } catch (err) {
      toast.dismiss('calc');
      // Even if the backend fails (e.g., Nodemailer offline), we unlock the UI for them
      toast.success("Results unlocked!");
      setIsUnlocked(true);
    } finally {
      setSubmitting(false);
    }
  };

  const calculatorSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Buildicy SaaS vs Custom Software ROI Calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Calculate how much your business can save by building custom software instead of paying monthly SaaS subscriptions.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  });

  return (
    <PageTransition>
      <SEO 
        title="SaaS vs Custom Software Calculator | Buildicy"
        description="Find out exactly how much money your business is bleeding on SaaS subscriptions compared to building a custom software ecosystem."
        canonicalUrl="/roi-calculator"
        keywords="SaaS vs Custom Software Calculator, Build vs Buy Software Calculator, Custom Software Development Cost Calculator, Custom MVP Pricing, Buildicy Custom Software Agency, SaaS monthly cost calculator"
        schema={calculatorSchema}
      />
      
      <div className="min-h-screen bg-[#050507] pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
        <h2 className="sr-only">Calculate the ROI of Custom Software vs Monthly SaaS Subscriptions (Build vs Buy)</h2>
        
        {/* Cinematic Background Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Calculator size={14} /> SaaS vs Custom Calculator
            </div>
            <h1 className="text-4xl md:text-[3.5rem] font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Stop bleeding cash on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                SaaS subscriptions.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium">
              Enter your current monthly software stack below to see how much you could save over 5 years by building a custom, owned ecosystem.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            
            {/* LEFT SIDE: The Calculator Input */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
              className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">Your Tech Stack</h2>
                  <select 
                    value={currencyCode}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="bg-[#1A1A24] border border-white/10 text-xs font-bold text-zinc-300 rounded-lg px-2 py-1 outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleAddTool}
                  className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Plus size={16} /> Add Tool
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {tools.map((tool) => (
                    <motion.div 
                      key={tool.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-4"
                    >
                      <div className="flex-grow">
                        <input 
                          type="text" 
                          value={tool.name}
                          onChange={(e) => handleUpdateTool(tool.id, 'name', e.target.value)}
                          placeholder="Tool Name (e.g. Shopify)" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-zinc-600"
                        />
                      </div>
                      <div className="w-32 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{activeCurrency.symbol}</span>
                        <input 
                          type="number" 
                          value={tool.cost || ''}
                          onChange={(e) => handleUpdateTool(tool.id, 'cost', parseInt(e.target.value) || 0)}
                          placeholder="0" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors font-['DM_Mono']"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveTool(tool.id)}
                        className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-end justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total Monthly Cost</p>
                  <p className="text-3xl font-black text-white font-['DM_Mono']">{activeCurrency.symbol}{totalMonthly.toLocaleString()}<span className="text-lg text-zinc-500 font-medium">/mo</span></p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE: The Results / Gate */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: customEase }}
              className="h-full"
            >
              {!isUnlocked ? (
                <div className="bg-[#0C0C12]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center relative overflow-hidden group shadow-2xl">
                  
                  <div className="relative z-20 text-center">
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400">
                      <Lock size={32} />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-white mb-4">Unlock Your Blueprint</h3>
                    <p className="text-zinc-300 mb-8 max-w-sm mx-auto">
                      Enter your email to instantly see exactly how much money you are losing, and exactly how much a custom solution would save you.
                    </p>

                    <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-4">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@company.com" 
                        className="w-full bg-[#1A1A24]/80 border border-white/10 rounded-xl px-5 py-4 text-white text-center focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                      <Magnetic>
                        <button 
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                        >
                          {submitting ? "Calculating..." : "Reveal My Savings"} <ArrowRight size={18} />
                        </button>
                      </Magnetic>
                    </form>
                    <p className="text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1">
                      <Sparkles size={12} /> We will email you a copy of the results.
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: customEase }}
                  className="bg-[#0C0C12]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 h-full flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.05)]"
                >
                  <div className="flex items-center gap-3 text-green-400 font-bold mb-8">
                    <CheckCircle2 size={24} /> Results Unlocked
                  </div>

                  <div className="space-y-8 flex-grow">
                    <div>
                      <p className="text-zinc-400 mb-2 font-medium">If you keep your SaaS stack for 5 years:</p>
                      <p className="text-4xl md:text-5xl font-bold tracking-tight text-red-400 font-['DM_Mono']">
                        {activeCurrency.symbol}{total5Year.toLocaleString()}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Total sunk cost. $0 equity.</p>
                    </div>

                    <div className="h-[1px] w-full bg-white/10" />

                    <div>
                      <p className="text-zinc-400 mb-2 font-medium">Estimated 1-Time Buildicy Custom Build:</p>
                      <p className="text-4xl md:text-5xl font-bold tracking-tight text-white font-['DM_Mono']">
                        ~{activeCurrency.symbol}{customBuildCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">You own the code forever. Break-even in <strong className="text-white">{breakEvenMonths} months</strong>.</p>
                    </div>
                  </div>

                  <div className="mt-10 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 md:p-8">
                    <p className="text-green-400 font-medium mb-1">Your 5-Year Savings</p>
                    <p className="text-5xl md:text-6xl font-bold tracking-tight text-green-400 font-['DM_Mono'] drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                      +{activeCurrency.symbol}{Math.max(0, estimatedSavings).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-8">
                    <Magnetic>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))} 
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                      >
                        <Sparkles size={20} /> Book a Discovery Call
                      </button>
                    </Magnetic>
                  </div>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RoiCalculator;
