import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, Mail, Phone, BookOpen, GraduationCap, Briefcase, Link as LinkIcon, CheckCircle2, UploadCloud, QrCode, Download, ArrowRight, Printer, Plus, Minus } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from "react-router-dom";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const FAQs = [
  {
    question: "Is this a paid internship?",
    answer: "No, this is an exclusive paid training program where you will be mentored by industry experts, work on real-world projects, and build a production-grade portfolio. The fee covers the cost of training, resources, and certification."
  },
  {
    question: "Will I get a certificate?",
    answer: "Yes, upon successful completion, you will receive a verifiable, industry-recognized certificate from Buildicy."
  },
  {
    question: "How long is the program?",
    answer: "The program typically runs for 4-6 weeks depending on the track you choose, with flexible hours suited for students."
  },
  {
    question: "Do I need prior experience?",
    answer: "Basic understanding of your chosen field is helpful, but our program is designed to take you from fundamentals to advanced concepts through hands-on building."
  }
];

const InternshipRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [fileName, setFileName] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [trackStats, setTrackStats] = useState<Record<string, number>>({});
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const trackPricing: Record<string, string> = {
    uiux: "₹899",
    ai_automation: "₹899",
    fullstack: "₹1099",
    blockchain: "₹1099",
    ai_architect: "₹1299"
  };

  const trackNames: Record<string, string> = {
    uiux: "UI/UX Designer",
    ai_automation: "AI Automation Engineer",
    fullstack: "Full Stack Developer",
    blockchain: "Blockchain Engineer",
    ai_architect: "AI Architect"
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "internships"));
        const stats: Record<string, number> = {};
        querySnapshot.forEach((doc) => {
          const track = doc.data().track;
          stats[track] = (stats[track] || 0) + 1;
        });
        setTrackStats(stats);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleVerifyReferral = async (code: string) => {
    const cleanCode = code.trim();
    setReferralCode(cleanCode);
    if (cleanCode.length < 5) {
      setReferralStatus('idle');
      return;
    }
    setReferralStatus('verifying');
    try {
      const q = query(collection(db, "internships"), where("registration_id", "==", cleanCode));
      const querySnapshot = await getDocs(q);
      setReferralStatus(!querySnapshot.empty ? 'valid' : 'invalid');
    } catch (err) {
      console.error('Verify referral error:', err);
      setReferralStatus('invalid');
    }
  };

  const trackCount = selectedTrack ? (trackStats[selectedTrack] || 0) : 0;
  const isEarlyBird = selectedTrack !== "" && trackCount < 10;
  
  const originalPrice = parseInt(trackPricing[selectedTrack]?.replace('₹', '') || '0');
  
  const finalPrice = useMemo(() => {
    if (originalPrice === 0) return 0;
    // Max discount is 10% (either Early Bird or Referral)
    const hasDiscount = isEarlyBird || referralStatus === 'valid';
    if (hasDiscount) {
      return Math.round(originalPrice * 0.9);
    }
    return originalPrice;
  }, [originalPrice, isEarlyBird, referralStatus]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Read file to base64
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (!file) {
        throw new Error('Please upload a receipt');
      }

      // Generate unique registration ID (e.g. BLDCY-UIUX-4921)
      const trackPrefix = (formData.get('track') as string).substring(0, 4).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const registrationId = `BLDCY-${trackPrefix}-${randomNum}`;

      // Compress image to Base64 using HTML5 Canvas to fit within Firestore 1MB limit
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Compress to 60% quality JPEG (usually < 200KB)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              resolve(dataUrl);
            };
            img.onerror = error => reject(error);
          };
          reader.onerror = error => reject(error);
        });
      };

      const compressedBase64Receipt = await compressImage(file);

      // Save to Firestore directly
      const docRef = await addDoc(collection(db, "internships"), {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        track: formData.get('track'),
        college: formData.get('college'),
        degree: formData.get('degree'),
        reason: formData.get('reason'),
        receipt: compressedBase64Receipt,
        registration_id: registrationId,
        referral_code: referralStatus === 'valid' && referralCode ? referralCode : null,
        created_at: serverTimestamp()
      });

      const resultData = { id: docRef.id, registration_id: registrationId };

      // Send email notification
      const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        phone: formData.get('phone'),
        track: formData.get('track'),
        college: formData.get('college'),
        degree: formData.get('degree'),
        message: `Reason: ${formData.get('reason')}`,
      };

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
          "template_m9krlkd", // Specific template ID for Internship Registrations
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""
        );
        console.log("Email notification sent successfully.");
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }

      setRegistrationData({
        name: formData.get('name') as string,
        track: trackNames[formData.get('track') as string] || "Internship Track",
        amount: `₹${finalPrice}`,
        id: resultData.registration_id,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      });
      
      setIsSuccess(true);
      // Trigger printing animation
      setTimeout(() => setIsPrinting(true), 100);
      e.currentTarget.reset();
      setFileName("");
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const receiptElement = document.getElementById('virtual-receipt');
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Buildicy_Receipt_${registrationData?.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isSuccess && registrationData) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 relative flex flex-col items-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">Registration Complete</h2>
          <p className="text-white/60">Your virtual receipt is printing...</p>
        </motion.div>

        {/* Printer Slot */}
        <div className="w-full max-w-md relative z-10">
          <div className="w-full h-4 bg-zinc-900 rounded-full shadow-inner border-b border-white/5 relative z-20" />
          
          {/* Animated Receipt */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: isPrinting ? 0 : -50, opacity: isPrinting ? 1 : 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
            className="w-[90%] mx-auto bg-white rounded-b-xl shadow-2xl relative -mt-2 overflow-hidden"
            id="virtual-receipt"
          >
            {/* Receipt Zigzag Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0iIzBBMEEwRiIvPjwvc3ZnPg==')] bg-repeat-x" />
            
            <div className="p-8 pb-12">
              <div className="flex justify-between items-start mb-8 border-b border-dashed border-gray-300 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-purple-900 font-['Syne'] tracking-tighter">BUILDICY</h3>
                  <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">Official Receipt</p>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">
                    <QrCode size={32} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Registration ID</p>
                  <p className="text-sm font-['DM_Mono'] font-bold text-gray-900 bg-gray-100 py-2 px-3 rounded inline-block">{registrationData.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Applicant</p>
                    <p className="text-sm font-bold text-gray-800">{registrationData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-800">{registrationData.date}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Program Track</p>
                  <p className="text-base font-bold text-purple-700">{registrationData.track}</p>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-6 mt-6 flex justify-between items-end">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount Paid</p>
                  <p className="text-2xl font-black text-gray-900">{registrationData.amount}</p>
                </div>
                
                <div className="pt-4 text-center">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Status: Verified & Confirmed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isPrinting ? 1 : 0, y: isPrinting ? 0 : 20 }}
          transition={{ delay: 2.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-12 relative z-10 w-full max-w-md px-4"
        >
          <button
            onClick={handleDownloadReceipt}
            className="w-full py-4 rounded-xl font-bold bg-purple-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
          >
            <Download size={18} /> Download Receipt PDF
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 relative overflow-hidden flex flex-col items-center">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 rounded-[100%] blur-[120px] opacity-50 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
          <Sparkles size={16} />
          <span>Internship Program</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Internship <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Application</span>
        </h1>
        <p className="text-lg text-white/60">
          Accelerate your career with the Buildicy Elite Internship Training Program. Gain hands-on experience, expert mentorship, and build industry-grade projects. Enroll below to secure your spot.
        </p>
      </motion.div>

      {/* Early Bird Banner */}
      <AnimatePresence>
        {isEarlyBird && !isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl w-full mx-auto mb-8 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between shadow-[0_0_30px_rgba(168,85,247,0.15)] relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                <Sparkles size={18} className="text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white">Early Bird Offer Active!</h3>
                <p className="text-sm text-purple-200/80">First 10 registrations in this track get 10% off. Only {10 - trackCount} spots left.</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 font-bold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-xl">
              10% Discount Applied
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-white/40" />
                  </div>
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-white/40" />
                  </div>
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-white/40" />
                  </div>
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Internship Track */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Internship Track</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase size={18} className="text-white/40" />
                  </div>
                  <select
                    name="track"
                    required
                    value={selectedTrack}
                    onChange={(e) => setSelectedTrack(e.target.value)}
                    className="w-full bg-[#13131a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none"
                  >
                    <option value="" disabled>Select a track...</option>
                    <option value="uiux">UI/UX Designer</option>
                    <option value="fullstack">Full stack developer</option>
                    <option value="ai_architect">AI Architect</option>
                    <option value="ai_automation">AI Automation Engineer</option>
                    <option value="blockchain">Blockchain engineer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College/University */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">College / University</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BookOpen size={18} className="text-white/40" />
                  </div>
                  <input
                    name="college"
                    required
                    type="text"
                    placeholder="E.g. IIT Madras"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Degree & Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Degree & Year of Study</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap size={18} className="text-white/40" />
                  </div>
                  <input
                    name="degree"
                    required
                    type="text"
                    placeholder="E.g. B.Tech CS, 3rd Year"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
              
              {/* Reason for Joining */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Why do you want to join this program?</label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                    <BookOpen size={18} className="text-white/40" />
                  </div>
                  <textarea
                    name="reason"
                    required
                    rows={4}
                    placeholder="Tell us about your passion and what you hope to learn..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Referral Code */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-white/80 ml-1">Referral Code (Friend's Registration ID) <span className="text-white/40 font-normal">- Optional</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => handleVerifyReferral(e.target.value)}
                    placeholder="e.g. BLDCY-UIUX-1234"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none transition-all ${
                      referralStatus === 'valid' ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/50' :
                      referralStatus === 'invalid' ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50' :
                      'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50'
                    }`}
                  />
                  {referralStatus === 'verifying' && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs">Verifying...</div>}
                  {referralStatus === 'valid' && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Valid (10% Off)</div>}
                  {referralStatus === 'invalid' && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-xs">Invalid ID</div>}
                </div>
                {referralStatus === 'valid' && (
                  <p className="text-xs text-green-400/80 ml-1">You both get a 10% discount benefit!</p>
                )}
              </div>
            </div>

            {/* Dynamic Payment Section */}
            <AnimatePresence>
              {selectedTrack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 mt-4 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                          Registration Fee
                        </div>
                        <h3 className="text-3xl font-bold text-white">₹{finalPrice}</h3>
                        <p className="text-white/70 text-sm">
                          Please scan the QR code to pay the registration fee for the {document.querySelector(`option[value="${selectedTrack}"]`)?.textContent || "selected"} track. Once paid, upload a screenshot of the successful transaction below.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <QrCode size={40} className="text-white mb-4" />
                        <p className="text-sm text-white/60 mb-2">Scan to Pay via UPI</p>
                        
                        <div className="text-2xl font-bold text-white mb-4">
                          {finalPrice < originalPrice ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-white/40 line-through">₹{originalPrice}</span>
                              <span className="text-green-400 font-extrabold flex items-center gap-2">₹{finalPrice} <span className="text-[10px] bg-green-500/20 px-2 py-0.5 rounded-full">-10%</span></span>
                            </div>
                          ) : (
                            <span>₹{originalPrice}</span>
                          )}
                        </div>

                        <p className="text-xs font-mono text-purple-300 bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-500/20">
                          buildicy@ybl
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80 ml-1">Upload Payment Receipt</label>
                      <div className="relative group cursor-pointer">
                        <input
                          name="receipt"
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          required
                          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-black/40 border border-white/10 group-hover:border-purple-500/50 rounded-xl py-4 px-4 flex items-center justify-center gap-3 transition-all">
                          <UploadCloud size={20} className={fileName ? "text-green-400" : "text-white/40"} />
                          <span className={fileName ? "text-green-400 font-medium" : "text-white/60"}>
                            {fileName || "Click to browse or drag and drop receipt"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-4">
              <Magnetic strength={0.2} className="w-full">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-white flex items-center justify-center gap-2 group hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </Magnetic>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        {!isSuccess && (
          <div className="mt-16 bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="text-purple-500" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQs.map((faq, index) => (
                <div key={index} className="border border-white/10 rounded-xl overflow-hidden bg-white/5 transition-colors hover:bg-white/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-white">{faq.question}</span>
                    {openFaq === index ? (
                      <Minus size={18} className="text-purple-400 flex-shrink-0" />
                    ) : (
                      <Plus size={18} className="text-purple-400 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InternshipRegistration;
