import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, ArrowRight, Eye, EyeOff, Search, LogOut, Trash2, Info, X, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";

interface InternshipRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  track: string;
  college: string;
  degree: string;
  reason: string;
  receipt: string;
  registration_id: string;
  referral_code: string | null;
  cohort: string;
  created_at: string;
}

const trackNames: Record<string, string> = {
  uiux: "UI/UX Designer",
  ai_automation: "AI Automation Engineer",
  fullstack: "Full Stack Developer",
  blockchain: "Blockchain Engineer",
  ai_architect: "AI Architect"
};

const AdminDashboard = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<InternshipRecord | null>(null);
  
  const navigate = useNavigate();

  // Load auth state from session storage to prevent re-login on refresh
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("adminAuth");
    if (sessionAuth === "admin@123") {
      setIsAuthenticated(true);
      fetchRecords();
    }

    // Auto-logout when navigating away from the admin dashboard
    return () => {
      sessionStorage.removeItem("adminAuth");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (password !== "admin@123") {
        throw new Error("Invalid password");
      }
      
      await fetchRecords();
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", password);
    } catch (err) {
      setError("Unauthorized access. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCohort = async (id: string, currentCohort: string) => {
    const newCohort = window.prompt("Enter new cohort label for this student:", currentCohort || "batch-1");
    if (newCohort === null || newCohort.trim() === "") return; // Cancelled or empty

    try {
      await updateDoc(doc(db, "internships", id), {
        cohort: newCohort.trim()
      });
      // Update local state
      setRecords(prev => prev.map(r => r.id === id ? { ...r, cohort: newCohort.trim() } : r));
    } catch (error) {
      console.error("Error updating cohort:", error);
      alert("Failed to update cohort label.");
    }
  };

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, "internships"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data: InternshipRecord[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as InternshipRecord);
      });
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setRecords([]);
    setPassword("");
  };

  const handleDeleteDatabase = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL internship registrations? This action cannot be undone.")) {
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, "internships"));
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, "internships", document.id)));
      await Promise.all(deletePromises);

      alert("Database has been successfully cleared.");
      setRecords([]);
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("An error occurred while clearing the database.");
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this specific registration?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "internships", id));
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("An error occurred while deleting the record.");
    }
  };

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.track.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex flex-col items-center justify-center relative overflow-hidden bg-[#050507]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-red-900/30 rounded-full border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Restricted Access</h2>
          <p className="text-white/50 text-center mb-8 text-sm">Buildicy Internal Admin Portal</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : (
                <>Authenticate <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative bg-[#050507]">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Internship Portal</h1>
            <p className="text-white/60">Manage all registered applicants and payments.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
              />
            </div>
            
            <button 
              onClick={handleDeleteDatabase}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/20 text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              <Trash2 size={16} /> Purge Database
            </button>

            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl border border-white/10 text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg"
          >
            <p className="text-xs text-purple-400 font-bold uppercase mb-1">Total</p>
            <p className="text-3xl font-extrabold text-white">{records.length}</p>
          </motion.div>
          {Object.entries(trackNames).map(([rawTrack, friendlyName], i) => {
            const count = records.filter(r => r.track === rawTrack).length;
            return (
              <motion.div 
                key={rawTrack}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg"
              >
                <p className="text-[10px] text-white/50 font-bold uppercase mb-1 line-clamp-1">
                  {friendlyName.replace(' Engineer', '').replace(' Developer', '').replace(' Designer', '')}
                </p>
                <p className="text-2xl font-extrabold text-white/90">{count}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#050507]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider">Cohort / Referral</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-white">{record.name}</div>
                        <div className="text-xs text-white/40 font-['DM_Mono'] mt-1">{record.registration_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-purple-900/30 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400">
                          {trackNames[record.track] || record.track}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{record.email}</div>
                        <div className="text-xs text-white/40">{record.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2 items-start">
                          <div className="flex items-center gap-2 group/edit">
                            <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                              {record.cohort || "batch-1"}
                            </span>
                            <button 
                              onClick={() => handleEditCohort(record.id, record.cohort)}
                              className="text-white/20 hover:text-blue-400 transition-colors opacity-0 group-hover/edit:opacity-100"
                              title="Edit Cohort Label"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                          {record.referral_code && (
                            <span className="px-2 py-0.5 bg-green-900/30 border border-green-500/20 rounded text-[10px] font-bold text-green-400 font-mono">
                              Ref: {record.referral_code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white/60">
                        {formatDate(record.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudent(record)}
                            className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors group/btn"
                            title="View Full Details"
                          >
                            <Info size={16} className="text-blue-400 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const isBase64 = record.receipt.startsWith('data:');
                              setViewReceiptUrl(isBase64 ? record.receipt : `${API_URL}/uploads/${record.receipt}`);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 rounded-lg transition-colors"
                            title="Delete this record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Receipt Image Modal */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" onClick={() => setViewReceiptUrl(null)}>
          <div className="relative max-w-md w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setViewReceiptUrl(null)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] flex items-center justify-center p-2 shadow-2xl">
              <img src={viewReceiptUrl} alt="Payment Receipt" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{selectedStudent.name}</h3>
                <p className="text-sm font-['DM_Mono'] text-purple-400 mt-1">{selectedStudent.registration_id}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Email Address</p>
                <p className="text-white text-sm">{selectedStudent.email}</p>
              </div>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Phone Number</p>
                <p className="text-white text-sm">{selectedStudent.phone}</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:col-span-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">College / University</p>
                <p className="text-white text-sm">{selectedStudent.college}</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Degree / Major</p>
                <p className="text-white text-sm">{selectedStudent.degree}</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Program Track</p>
                <p className="text-white text-sm font-bold text-purple-400">{trackNames[selectedStudent.track] || selectedStudent.track}</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:col-span-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Why They Want to Join</p>
                <p className="text-white/80 text-sm italic leading-relaxed">"{selectedStudent.reason}"</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
