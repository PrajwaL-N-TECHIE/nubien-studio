import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, ArrowRight, Eye, Search, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface InternshipRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  track: string;
  college: string;
  degree: string;
  reason: string;
  receipt: string;
  registration_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Load auth state from session storage to prevent re-login on refresh
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("adminAuth");
    if (sessionAuth === "admin@123") {
      setIsAuthenticated(true);
      fetchRecords("admin@123");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/internships?password=${password}`);
      if (!response.ok) {
        throw new Error("Invalid password");
      }
      
      const data = await response.json();
      setRecords(data);
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", password);
    } catch (err) {
      setError("Unauthorized access. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (pass: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/internships?password=${pass}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
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
      const response = await fetch(`${API_URL}/api/admin/internships?password=${password}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert("Database has been successfully cleared.");
        setRecords([]);
      } else {
        alert("Failed to clear database. Unauthorized.");
      }
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("An error occurred while clearing the database.");
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this specific registration?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/internships/${id}?password=${password}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Failed to delete record. Unauthorized.");
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
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
          {['UI/UX Designer', 'AI Automation Engineer', 'Full Stack Developer', 'Blockchain Engineer', 'AI Architect'].map((track, i) => {
            const count = records.filter(r => r.track === track).length;
            return (
              <motion.div 
                key={track}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg"
              >
                <p className="text-[10px] text-white/50 font-bold uppercase mb-1 line-clamp-1">{track.replace(' Engineer', '').replace(' Developer', '').replace(' Designer', '')}</p>
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
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
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
                          {record.track}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white/80">{record.email}</div>
                        <div className="text-xs text-white/40 mt-1">{record.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`${API_URL}/uploads/${record.receipt}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                          >
                            <Eye size={16} /> View
                          </a>
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
    </div>
  );
};

export default AdminDashboard;
