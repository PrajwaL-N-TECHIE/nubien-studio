import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, Trophy, Bot, Briefcase, 
  LogOut, UploadCloud, PlayCircle, FileText, CheckCircle2,
  Send, Sparkles, AlertCircle, FileLock2, Code2, 
  ChevronRight, Activity, Terminal, Users, Globe,
  GitBranch, GraduationCap, Star, ShieldCheck,
  UserCircle, Focus, CodeSquare, Target, Clock, Copy
} from "lucide-react";
import { usePerformance } from "@/context/PerformanceContext";
import { useNavigate } from "react-router-dom";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface StudentData {
  id: string;
  name: string;
  track: string;
  cohort: string;
  registration_id: string;
  xp?: number;
  progress?: number;
}

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video';
  url: string;
  cohort: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  cohort: string;
}

interface Submission {
  id?: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
}

const getStudentSession = (): StudentData => {
  const data = sessionStorage.getItem("studentAuth");
  if(data) return JSON.parse(data);
  return { id: "demo", name: "Guest User", track: "Unknown", cohort: "batch-1", registration_id: "DEMO-000", xp: 0, progress: 0 };
};

const LEADERBOARD = [
  { id: 1, name: "Sarah Chen", track: "AI Architect", xp: 5100, rank: 1 },
  { id: 2, name: "Marcus Johnson", track: "UI/UX Designer", xp: 4850, rank: 2 },
  { id: 3, name: "Alex Developer", track: "Full Stack Engineer", xp: 4250, rank: 3 },
  { id: 4, name: "Priya Patel", track: "Blockchain Engineer", xp: 3900, rank: 4 },
  { id: 5, name: "David Kim", track: "Full Stack Engineer", xp: 3750, rank: 5 },
];

// --- SUB-COMPONENTS ---

const MissionControl = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Progress Card */}
      <div className="col-span-1 lg:col-span-2 bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-purple-500/20" />
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-purple-400" /> Current Trajectory
        </h2>
        
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="364" strokeDashoffset={364 - (364 * (getStudentSession().progress || 0)) / 100}
                className="text-purple-500 transition-all duration-1000 ease-out" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{getStudentSession().progress || 0}%</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Completed</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Week 3 Assignment: API Integration</span>
                <span className="text-purple-400 font-bold">Due in 2 Days</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[60%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Card */}
      <div className="col-span-1 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <PlayCircle className="text-indigo-400" size={24} />
        </div>
        <h3 className="text-zinc-300 font-medium mb-1">Next Live Session</h3>
        <p className="text-xl font-bold text-white mb-6">Upcoming</p>
        <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all text-sm border border-white/5">
          Copy Meet Link
        </button>
      </div>

    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dropzone */}
      <div className="col-span-1 lg:col-span-2 bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <UploadCloud className="text-purple-400" /> Assignment Dropzone
        </h2>
        <div className="w-full border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group bg-white/[0.02]">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud size={28} className="text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">Drag and drop your project ZIP or PDF</p>
            <p className="text-sm text-zinc-500">Maximum file size: 50MB</p>
          </div>
          <button className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Browse Files
          </button>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="col-span-1 bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8 group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-yellow-500" /> Daily Quests
        </h2>
        <div className="space-y-4 relative z-10">
          {[
            { task: "Submit W3 Assignment", xp: 150, done: false },
            { task: "Review 1 Peer Project", xp: 50, done: true },
            { task: "Attend Live Session", xp: 100, done: false },
          ].map((quest, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${quest.done ? 'bg-white/5 border-white/5 opacity-50' : 'bg-yellow-500/10 border-yellow-500/20'} transition-colors`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${quest.done ? 'bg-white/20' : 'border border-yellow-500/50'}`}>
                  {quest.done && <CheckCircle2 size={12} />}
                </div>
                <span className={`text-sm ${quest.done ? 'line-through text-zinc-500' : 'text-white'}`}>{quest.task}</span>
              </div>
              <span className={`text-xs font-bold font-mono ${quest.done ? 'text-zinc-600' : 'text-yellow-500'}`}>+{quest.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Gamified Skill Tree */}
    <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <GitBranch className="text-purple-400" /> Skill Tree
      </h2>
      <div className="relative flex justify-between items-center px-4">
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/5 -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-8 w-[40%] h-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] -translate-y-1/2 z-0" />
        
        {[
          { label: "W1: Core", unlocked: true },
          { label: "W2: Logic", unlocked: true },
          { label: "W3: Build", unlocked: false },
          { label: "W4: Career", unlocked: false }
        ].map((node, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${node.unlocked ? 'bg-purple-900 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-[#12121A] border-white/10'}`}>
              {node.unlocked ? <CheckCircle2 size={20} className="text-white" /> : <FileLock2 size={20} className="text-zinc-600" />}
            </div>
            <span className={`text-xs font-bold font-mono tracking-widest uppercase ${node.unlocked ? 'text-purple-400' : 'text-zinc-600'}`}>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Vault = ({ materials }: { materials: Material[] }) => {
  const student = getStudentSession();

  const handleOpenMaterial = async (mat: Material) => {
    try {
      await addDoc(collection(db, "access_logs"), {
        material_id: mat.id,
        material_title: mat.title,
        student_id: student.id,
        student_name: student.name,
        accessed_at: serverTimestamp()
      });
      window.open(mat.url, "_blank");
    } catch(err) {
      console.error("Failed to log access", err);
      window.open(mat.url, "_blank");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">The Vault</h2>
          <p className="text-zinc-400 text-sm mt-1">Access all your cohort's documents, links, and slides.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {materials.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No materials uploaded yet.</div>
        ) : materials.map((res) => {
          let Icon = FileText;
          if(res.type === 'video') Icon = PlayCircle;
          if(res.type === 'link') Icon = Code2;

          return (
            <div key={res.id} className="flex items-center justify-between p-5 rounded-2xl border bg-[#0C0C12]/80 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group" onClick={() => handleOpenMaterial(res)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Icon size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{res.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                    {res.type}
                  </p>
                </div>
              </div>
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dropzone = ({ assignments, student }: { assignments: Assignment[], student: StudentData }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignId, setSelectedAssignId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const q = query(collection(db, "submissions"), where("student_id", "==", student.id));
      const snap = await getDocs(q);
      const data: Submission[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(data);
    };
    fetchSubmissions();
  }, [student.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignId || !file) return;
    setIsUploading(true);

    try {
      const storageRef = ref(storage, `submissions/${student.id}_${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadResult.ref);

      const newSub = {
        assignment_id: selectedAssignId,
        student_id: student.id,
        student_name: student.name,
        cohort: student.cohort,
        file_url: url,
        status: 'pending' as const,
        submitted_at: serverTimestamp()
      };

      await addDoc(collection(db, "submissions"), newSub);
      setSubmissions(prev => [...prev, newSub as Submission]);
      setFile(null);
      setSelectedAssignId("");
      alert("Assignment submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">The Dropzone</h2>
          <p className="text-zinc-400 text-sm mt-1">Submit your assignments for review and grading.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><UploadCloud size={20} className="text-blue-400" /> Submit Work</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Select Assignment</label>
              <select required value={selectedAssignId} onChange={e => setSelectedAssignId(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50">
                <option value="">-- Choose Assignment --</option>
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>{a.title} (Due: {a.due_date})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Upload File (PDF/ZIP)</label>
              <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400" />
            </div>
            <button type="submit" disabled={isUploading || !file || !selectedAssignId} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
              {isUploading ? "Uploading..." : "Submit to Dropzone"}
            </button>
          </form>
        </div>

        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><CheckCircle2 size={20} className="text-green-400" /> Submission Status</h3>
          <div className="space-y-4">
            {submissions.length === 0 && <p className="text-zinc-500 text-sm">No submissions yet.</p>}
            {submissions.map((sub, i) => {
              const assign = assignments.find(a => a.id === sub.assignment_id);
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <h4 className="font-bold text-white">{assign?.title || "Unknown Assignment"}</h4>
                    <p className="text-xs text-zinc-500 uppercase mt-1">Status: <span className={sub.status === 'approved' ? 'text-green-400' : sub.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>{sub.status}</span></p>
                  </div>
                  <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                    <FileText size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> The Hustle Board
        </h2>
        <p className="text-zinc-400 text-sm">Earn XP by submitting assignments early, helping peers, and attending live sessions. Top 3 secure a guaranteed mock interview.</p>
      </div>
      <div className="bg-[#0C0C12]/80 border border-white/10 p-6 rounded-2xl flex items-center gap-6">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Your Rank</p>
          <p className="text-3xl font-black text-white">#{STUDENT.rank}</p>
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Your XP</p>
          <p className="text-3xl font-black text-purple-400">{STUDENT.xp}</p>
        </div>
      </div>
    </div>

    <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Rank</th>
            <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Intern</th>
            <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Track</th>
            <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">XP</th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((student) => (
            <tr key={student.id} className={`border-b border-white/5 last:border-0 ${student.name === STUDENT.name ? 'bg-purple-900/20' : 'hover:bg-white/[0.02]'} transition-colors`}>
              <td className="p-5">
                {student.rank === 1 ? <span className="text-yellow-500 font-black text-xl">1st</span> :
                 student.rank === 2 ? <span className="text-zinc-300 font-black text-xl">2nd</span> :
                 student.rank === 3 ? <span className="text-amber-600 font-black text-xl">3rd</span> :
                 <span className="text-zinc-500 font-bold">#{student.rank}</span>}
              </td>
              <td className="p-5 font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs">
                  {student.name.charAt(0)}
                </div>
                {student.name}
              </td>
              <td className="p-5 text-sm text-zinc-400">{student.track}</td>
              <td className="p-5 text-right font-mono font-bold text-purple-400">{student.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AIMentor = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello Alex! I am your Buildicy AI Mentor. I've analyzed your Week 2 assignment on React Hooks. You did a great job with `useEffect`, but I noticed a potential memory leak. Need help optimizing it?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: "Processing your request... (This is a high-fidelity MVP mockup. In production, this will seamlessly connect to our fine-tuned OpenAI model to instantly debug your code and explain concepts!)" }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-[#0C0C12]/80 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center relative">
            <Bot className="text-purple-400" size={20} />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0C0C12]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Buildicy Mentor</h2>
            <p className="text-xs text-green-400 font-mono">Online • Powered by GPT-4o</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-medium transition-colors">
          Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-sm' 
                : 'bg-white/5 border border-white/10 text-zinc-300 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code, design principles, or career advice..."
            className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

const CareerPrep = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Briefcase size={120} />
      </div>
      <h2 className="text-3xl font-black text-white mb-4 relative z-10">AI Resume Rater</h2>
      <p className="text-zinc-400 max-w-lg mx-auto mb-8 relative z-10">
        Upload your PDF resume or drop your LinkedIn URL. Our AI will analyze your profile against industry ATS standards and give you actionable feedback.
      </p>
      
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
        <input 
          type="text" 
          placeholder="https://linkedin.com/in/your-profile"
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
        />
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          Scan Profile
        </button>
      </div>
      
      <div className="mt-6 text-sm text-zinc-500 font-mono">
        or <button className="text-blue-400 hover:underline">upload a PDF file</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="text-zinc-500" /> Mock Interview Prep
        </h3>
        <p className="text-sm text-zinc-400 mb-6">Schedule a 1-on-1 technical or behavioral mock interview with a Buildicy Senior Engineer.</p>
        <button className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl text-white font-medium transition-colors text-sm">
          Schedule Session
        </button>
      </div>
      <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="text-zinc-500" /> Alumni Job Board
        </h3>
        <p className="text-sm text-zinc-400 mb-6">Unlock exclusive freelance gigs and full-time roles directly from our agency partners upon graduation.</p>
        <button disabled className="w-full py-3 bg-white/5 text-zinc-600 rounded-xl font-medium cursor-not-allowed text-sm flex items-center justify-center gap-2">
          <FileLock2 size={16} /> Unlocks on Week 4
        </button>
      </div>
    </div>
  </div>
);

const PeerReview = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="bg-gradient-to-r from-teal-900/20 to-emerald-900/20 border border-teal-500/20 rounded-3xl p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-teal-400" /> Peer-to-Peer Review
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Review a peer's project to unlock your own Grade & XP.</p>
        </div>
        <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 font-mono text-sm font-bold flex items-center gap-2">
          <ShieldCheck size={16} /> Anonymous Mode Active
        </div>
      </div>

      <div className="bg-[#0C0C12] border border-white/5 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-2 text-lg">Submission #8492 - React Hooks refactor</h3>
        <p className="text-sm text-zinc-400 mb-6">Please review the implementation of useMemo in the provided sandbox.</p>
        
        <div className="flex gap-4 mb-8">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Code2 size={16} /> View Code Sandbox
          </button>
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Globe size={16} /> View Live Demo
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-zinc-300">Constructive Feedback (Required)</label>
          <textarea 
            placeholder="I noticed you used useMemo here, but since the array is small, it might actually degrade performance due to overhead..."
            className="w-full h-32 bg-[#1A1A24]/60 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
          />
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-zinc-300">Grade</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="text-zinc-600 hover:text-teal-400 transition-colors">
                  <Star size={24} />
                </button>
              ))}
            </div>
          </div>
          <button className="mt-4 px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            Submit Review & Unlock My Grade
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LivePortfolio = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0C0C12]/80 to-[#0C0C12]/80 pointer-events-none" />
      <Globe size={48} className="text-blue-400 mx-auto mb-4 relative z-10" />
      <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Your Proof-of-Work Portfolio</h2>
      <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-6 relative z-10">
        Your assignments are automatically compiled into a beautiful, public portfolio. Send this link to recruiters instead of a PDF certificate.
      </p>
      
      <div className="max-w-md mx-auto bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-8 relative z-10">
        <span className="text-zinc-300 font-mono text-sm truncate">buildicy.com/interns/alex-developer</span>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
          Copy Link
        </button>
      </div>

      <div className="w-full aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative z-10 bg-gradient-to-b from-[#1a1a24] to-black p-4 flex flex-col">
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 border border-white/10 rounded-xl bg-[#050507] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-blue-400">AD</span>
          </div>
          <h3 className="text-xl font-bold text-white">Alex Developer</h3>
          <p className="text-blue-400 font-mono text-sm mb-6">Full Stack Engineer</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="h-24 bg-white/5 border border-white/10 rounded-xl" />
            <div className="h-24 bg-white/5 border border-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SnippetVault = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CodeSquare className="text-orange-500" /> Component Vault
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Your personal library of reusable code snippets gathered during the internship.</p>
      </div>
      <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]">
        + New Snippet
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: "useDebounce Hook", lang: "TypeScript", code: "export function useDebounce(value, delay) {..." },
        { title: "Glassmorphism Card", lang: "CSS", code: ".glass { backdrop-filter: blur(10px); ... }" },
        { title: "Axios Interceptor", lang: "JavaScript", code: "axios.interceptors.request.use((config) => {..." },
        { title: "Firebase Auth Flow", lang: "TypeScript", code: "const signIn = async () => {..." }
      ].map((snippet, i) => (
        <div key={i} className="bg-[#0C0C12]/80 border border-white/10 rounded-2xl p-6 group hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-white mb-1">{snippet.title}</h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">{snippet.lang}</span>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
              <Copy size={16} />
            </button>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-sm text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">
            {snippet.code}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FocusMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`transition-all duration-1000 ${isActive ? 'fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center' : 'bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden'}`}>
        
        {isActive && (
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none flex items-center justify-center gap-2">
             {/* Mock visualizer bars */}
             {[...Array(20)].map((_, i) => (
               <motion.div 
                 key={i}
                 animate={{ height: ['20px', `${Math.random() * 200 + 50}px`, '20px'] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                 className="w-2 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full blur-[2px]"
               />
             ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center">
          {!isActive && (
            <>
              <Focus size={48} className="text-pink-500 mb-6" />
              <h2 className="text-3xl font-black text-white mb-2">Deep Work Zone</h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-10">Activate Focus Mode to start a Pomodoro session with built-in lo-fi beats and visualizer. The rest of the dashboard will dim.</p>
            </>
          )}
          
          <div className={`font-mono font-black tabular-nums transition-all ${isActive ? 'text-[12rem] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20' : 'text-6xl text-white mb-8'}`}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md' : 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.3)]'}`}
            >
              {isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            </button>
            {!isActive && (
              <button className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors">
                <Clock size={20} className="text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileCustomization = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Edit Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserCircle className="text-blue-400" /> Identity Matrix
          </h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer relative">
              <span className="text-2xl font-bold text-zinc-500">AD</span>
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud size={20} className="text-white" />
              </div>
            </div>
            <div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors mb-2 block">Upload Avatar</button>
              <p className="text-xs text-zinc-500">JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-zinc-400 block mb-2">Display Name</label>
              <input type="text" defaultValue="Alex Developer" className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-bold text-zinc-400 block mb-2">Short Bio</label>
              <textarea defaultValue="Building the future of the web. Passionate about AI and React." className="w-full h-24 bg-[#1A1A24]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-zinc-400 block mb-2">GitHub URL</label>
                <input type="text" defaultValue="github.com/alexdev" className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 block mb-2">LinkedIn URL</label>
                <input type="text" defaultValue="linkedin.com/in/alexdev" className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none" />
              </div>
            </div>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4">
              Save Profile Identity
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Card Preview */}
      <div className="w-full lg:w-80">
        <div className="sticky top-24">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold mb-4 ml-2">Live Portfolio Preview</p>
          <div className="w-full aspect-[3/4] bg-gradient-to-b from-[#1a1a24] to-black rounded-3xl border border-white/20 shadow-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-[#0C0C12] border-4 border-[#1a1a24] shadow-xl flex items-center justify-center mb-6 z-10">
              <span className="text-3xl font-black text-blue-400">AD</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 z-10">Alex Developer</h3>
            <p className="text-blue-400 font-mono text-sm mb-6 z-10">Full Stack Engineer</p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8 z-10">Building the future of the web. Passionate about AI and React.</p>
            
            <div className="flex gap-4 w-full z-10">
              <div className="flex-1 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer">GitHub</div>
              <div className="flex-1 py-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 transition-colors cursor-pointer">LinkedIn</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
);

// --- MAIN LAYOUT ---

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('mission');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlumniMode, setIsAlumniMode] = useState(false);
  const { isLowEnd } = usePerformance();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const authData = sessionStorage.getItem("studentAuth");
    if (!authData) {
      navigate('/student-login');
      return;
    }
    const parsed: StudentData = JSON.parse(authData);
    setStudent(parsed);

    const fetchMaterials = async () => {
      try {
        const q = query(collection(db, "materials"), where("cohort", "==", parsed.cohort));
        const snap = await getDocs(q);
        const data: Material[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Material));
        setMaterials(data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchAssignments = async () => {
      try {
        const q = query(collection(db, "assignments"), where("cohort", "==", parsed.cohort));
        const snap = await getDocs(q);
        const data: Assignment[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Assignment));
        setAssignments(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchMaterials();
    fetchAssignments();
  }, [navigate]);

  if (!student) return null;

  const STUDENT_TABS = [
    { id: 'mission', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'vault', label: 'The Vault', icon: BookOpen },
    { id: 'dropzone', label: 'Dropzone', icon: UploadCloud }
  ];

  const ALUMNI_TABS = [
    { id: 'alumni_jobs', label: 'Exclusive Jobs', icon: Briefcase },
    { id: 'alumni_network', label: 'Alumni Directory', icon: Users },
    { id: 'portfolio', label: 'My Portfolio', icon: Globe },
  ];

  const TABS = isAlumniMode ? ALUMNI_TABS : STUDENT_TABS;

  // Auto-switch tab if current tab doesn't exist in new mode
  useEffect(() => {
    if (isAlumniMode && !ALUMNI_TABS.find(t => t.id === activeTab)) setActiveTab('alumni_jobs');
    if (!isAlumniMode && !STUDENT_TABS.find(t => t.id === activeTab)) setActiveTab('mission');
  }, [isAlumniMode]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050507] text-white flex flex-col md:flex-row relative z-10 pt-20 md:pt-0">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0C0C12] border-r border-white/5 flex flex-col transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Brand */}
        <div className="p-8 border-b border-white/5 relative overflow-hidden">
          {isAlumniMode && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/5 pointer-events-none" />}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] ${isAlumniMode ? 'bg-yellow-600 shadow-yellow-500/40' : 'bg-purple-600'}`}>
              {isAlumniMode ? <GraduationCap size={20} className="text-white" /> : <Sparkles size={20} className="text-white" />}
            </div>
            <div>
              <h1 className="font-bold tracking-tight">Buildicy OS</h1>
              <p className={`text-[10px] uppercase tracking-widest font-mono ${isAlumniMode ? 'text-yellow-500' : 'text-purple-400'}`}>
                {isAlumniMode ? 'Alumni Network' : 'Student Portal'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 mx-4 mt-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
            {student.name.charAt(0)}
          </div>
            <div className="flex-1 mt-2 md:mt-0 max-w-[200px] md:max-w-none truncate">
              <h1 className="text-lg md:text-xl font-bold text-white truncate">{student.name}</h1>
              <p className="text-xs text-purple-400 font-mono truncate">{student.track} • {student.registration_id}</p>
            </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === tab.id 
                  ? (isAlumniMode ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]') 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-zinc-500"} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Alumni Toggle & Logout */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-2">
          <button 
            onClick={() => setIsAlumniMode(!isAlumniMode)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isAlumniMode ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            <GraduationCap size={18} /> {isAlumniMode ? 'Exit Alumni Mode' : 'Simulate Alumni Mode'}
          </button>
          <button 
            onClick={() => {
              sessionStorage.removeItem("studentAuth");
              navigate('/student-login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Exit Portal
          </button>
        </div>
      </aside>

      {/* Mobile Header Toggle */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-[#0C0C12]/90 backdrop-blur-md border-b border-white/5 z-40 md:hidden flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold">Buildicy OS</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-lg"
        >
          <LayoutDashboard size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-hidden relative">
        {/* Subtle background glow based on tab/mode */}
        {!isLowEnd && (
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 ${isAlumniMode ? 'bg-yellow-900/10' : 'bg-purple-900/10'}`} />
        )}

        <div className="max-w-5xl mx-auto h-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2 font-mono uppercase tracking-widest">
              <span>Portal</span> <ChevronRight size={12} /> <span className={isAlumniMode ? 'text-yellow-500' : 'text-purple-400'}>{TABS.find(t => t.id === activeTab)?.label}</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="text-3xl font-black text-white">
                {isAlumniMode ? `Welcome to the Alumni Network, ${student.name.split(' ')[0]}.` : `Welcome back, ${student.name.split(' ')[0]}.`}
              </h1>
              <div className="flex items-center gap-3 w-full mt-2 md:mt-0 md:w-auto">
                <button className="flex-1 md:flex-none p-3 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-xl md:rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group whitespace-nowrap">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                    <Star size={12} className="text-yellow-500" />
                  </div>
                  <span className="text-sm font-bold text-white">{student.xp || 0} <span className="text-zinc-500">XP</span></span>
                </button>
                <button 
                  onClick={() => {
                    sessionStorage.removeItem("studentAuth");
                    navigate('/student-login');
                  }}
                  className="p-3 w-12 md:w-auto md:px-4 md:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 transition-colors border border-red-500/20 flex-shrink-0"
                  title="Logout"
                >
                  <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'mission' && <MissionControl />}
                {activeTab === 'vault' && <Vault materials={materials} />}
                {activeTab === 'dropzone' && <Dropzone assignments={assignments} student={student} />}
                
                {/* Mock Alumni Views */}
                {activeTab === 'alumni_jobs' && (
                  <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-12 text-center">
                    <Briefcase size={48} className="text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Exclusive Partner Jobs</h2>
                    <p className="text-zinc-400">As a certified Buildicy Alumni, you have priority access to full-time roles and freelance overflow gigs from our agency.</p>
                    <button className="mt-6 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(202,138,4,0.3)]">Browse 14 Open Roles</button>
                  </div>
                )}
                {activeTab === 'alumni_network' && (
                  <div className="bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-12 text-center">
                    <Users size={48} className="text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">The Directory</h2>
                    <p className="text-zinc-400">Network with 4,200+ other alumni. Find co-founders, hire talent, or join an open-source project.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
    </PageTransition>
  );
}
