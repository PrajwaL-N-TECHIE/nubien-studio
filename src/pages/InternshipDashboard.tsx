import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Briefcase, Calendar, GraduationCap, Mail, Phone, UploadCloud, User } from "lucide-react";

const InternshipDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/internship/${id}`);
        if (!response.ok) throw new Error("Not found");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDashboardData();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`http://localhost:3001/api/internship/${id}/profile-image`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setData((prev: any) => ({ ...prev, profile_image: result.profile_image }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Dashboard Not Found</h2>
        <p className="text-white/60 mb-8">We couldn't find a registration matching this ID.</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-purple-600 rounded-xl text-white font-bold">Return Home</button>
      </div>
    );
  }

  const trackNames: Record<string, string> = {
    uiux: "UI/UX Designer",
    ai_automation: "AI Automation Engineer",
    fullstack: "Full Stack Developer",
    blockchain: "Blockchain Engineer",
    ai_architect: "AI Architect"
  };

  const schedule = [
    { week: "Week 1", title: "Orientation & Onboarding", desc: "Introduction to Buildicy tools, culture, and initial setup." },
    { week: "Week 2-4", title: "Core Training", desc: "Deep dive into your specialized track with intensive learning materials." },
    { week: "Week 5-8", title: "Live Project Phase", desc: "Collaborate on an actual industry project under senior guidance." },
    { week: "Week 9-12", title: "Final Evaluation & Certification", desc: "Project presentation, feedback, and graduation." },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center shadow-xl"
            >
              <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer">
                {data.profile_image ? (
                  <img 
                    src={`http://localhost:3001/uploads/${data.profile_image}`} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-purple-500/20"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-purple-900/30 border-4 border-purple-500/20 flex items-center justify-center">
                    <User size={48} className="text-purple-400" />
                  </div>
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingImage ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{data.name}</h2>
              <p className="text-purple-400 font-medium mb-6">{trackNames[data.track]}</p>
              
              <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-6">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Registration ID</p>
                <p className="text-sm font-['DM_Mono'] font-bold text-white">{data.registration_id}</p>
              </div>

              <div className="space-y-4 text-left border-t border-white/10 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Mail size={14} className="text-white/60"/></div>
                  <span className="text-sm text-white/80">{data.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Phone size={14} className="text-white/60"/></div>
                  <span className="text-sm text-white/80">{data.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><BookOpen size={14} className="text-white/60"/></div>
                  <span className="text-sm text-white/80 line-clamp-1">{data.college}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><GraduationCap size={14} className="text-white/60"/></div>
                  <span className="text-sm text-white/80">{data.degree}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Training Schedule & Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="text-purple-500" /> Training Schedule
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {schedule.map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0f] bg-purple-900/50 text-purple-400 group-[.is-active]:bg-purple-600 group-[.is-active]:text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-10">
                      <Briefcase size={16} />
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                      </div>
                      <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">{item.week}</p>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-900/20 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-8 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Application Statement</h3>
              <p className="text-white/70 italic bg-black/20 p-6 rounded-2xl border border-white/5">
                "{data.reason}"
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InternshipDashboard;
