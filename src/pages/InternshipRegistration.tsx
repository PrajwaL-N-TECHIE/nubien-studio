import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, Mail, Phone, BookOpen, GraduationCap, Briefcase, Link as LinkIcon, CheckCircle2, UploadCloud, QrCode, Download, ArrowRight, Printer } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const InternshipRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [fileName, setFileName] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
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

  const selectedPrice = useMemo(() => trackPricing[selectedTrack] || "", [selectedTrack]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch(`${API_URL}/api/register-internship`, {
        method: 'POST',
        // Do NOT set Content-Type header when sending FormData, the browser will set it with the correct boundary
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }
      
      const resultData = await response.json();

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
        amount: selectedPrice,
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
          <span>Join The Team</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Internship <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Application</span>
        </h1>
        <p className="text-lg text-white/60">
          Kickstart your career with Buildicy. We are looking for passionate individuals ready to build the future of the web. Fill out the form below to register your interest.
        </p>
      </motion.div>

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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Why reason to choose this track?</label>
              <textarea
                name="reason"
                required
                rows={4}
                placeholder="Tell us about your passion and what you hope to achieve..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
              ></textarea>
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
                        <h3 className="text-3xl font-bold text-white">{selectedPrice}</h3>
                        <p className="text-white/70 text-sm">
                          Please scan the QR code to pay the registration fee for the {document.querySelector(`option[value="${selectedTrack}"]`)?.textContent || "selected"} track. Once paid, upload a screenshot of the successful transaction below.
                        </p>
                      </div>
                      
                      <div className="w-40 h-40 bg-white p-2 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
                        {/* Placeholder QR Code - user replaces with actual image later */}
                        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg m-2">
                          <QrCode size={48} className="text-gray-400" />
                        </div>
                        <span className="absolute bottom-4 text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
                          Place QR Here
                        </span>
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
      </motion.div>
    </div>
  );
};

export default InternshipRegistration;
