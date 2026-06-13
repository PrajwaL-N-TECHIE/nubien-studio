import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, ArrowRight, Eye, EyeOff, Search, LogOut, Trash2, Info, X, Edit2, BookOpen, UploadCloud, CheckCircle2, Plus, Download, Settings, Mail, FileText, Link, Calendar, Building, Loader2, Target, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";

import { db, auth, firebaseConfig } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, addDoc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { QUESTIONS } from "@/data/questions";

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

interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  cohort: string;
  created_at: string;
}

interface AccessLog {
  id: string;
  material_title: string;
  student_name: string;
  accessed_at: any;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  cohort: string;
  attachment_url?: string;
  created_at: any;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  cohort: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: any;
  feedback?: string;
}

interface CrucibleQuestion {
  id: string | number;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: number;
}

const trackNames: Record<string, string> = {
  uiux: "UI/UX Designer",
  ai_automation: "AI Automation Engineer",
  fullstack: "Full Stack Developer",
  blockchain: "Blockchain Engineer",
  ai_architect: "AI Architect"
};

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "internships"), orderBy("b_cores", "desc"));
        const snap = await getDocs(q);
        const data: InternshipRecord[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as InternshipRecord));
        
        const sanitizedData = data.map(s => ({ ...s, b_cores: (s as any).b_cores || 0 }));
        sanitizedData.sort((a, b) => ((b as any).b_cores || 0) - ((a as any).b_cores || 0));
        setLeaderboard(sanitizedData);
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center text-zinc-500 py-20 font-mono animate-pulse">Syncing Leaderboard Data...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-black/20">
            <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Rank</th>
            <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Student</th>
            <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Track & Cohort</th>
            <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">B-Cores</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((student, idx) => {
            const rank = idx + 1;
            return (
              <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  {rank === 1 ? <span className="text-yellow-500 font-black">1st</span> :
                   rank === 2 ? <span className="text-zinc-300 font-black">2nd</span> :
                   rank === 3 ? <span className="text-amber-600 font-black">3rd</span> :
                   <span className="text-zinc-500 font-bold">#{rank}</span>}
                </td>
                <td className="p-4">
                  <p className="font-bold text-white">{student.name}</p>
                  <p className="text-xs text-zinc-500">{student.email}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-zinc-300">{trackNames[student.track] || student.track}</p>
                  <p className="text-xs text-blue-400 font-mono">{student.cohort}</p>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg font-mono font-bold border border-purple-500/20">
                    {(student as any).b_cores || 0}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const AdminDashboard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<InternshipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<InternshipRecord | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "", email: "", phone: "", track: "uiux", college: "", degree: "", reason: "", cohort: "batch-1", referral_code: "", registration_id: ""
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [newStudentReceiptFile, setNewStudentReceiptFile] = useState<File | null>(null);

  // Materials State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMatTitle, setNewMatTitle] = useState("");
  const [newMatType, setNewMatType] = useState<'file' | 'link'>('file');
  const [newMatCohort, setNewMatCohort] = useState("batch-1");
  const [newMatFile, setNewMatFile] = useState<File | null>(null);
  const [newMatUrl, setNewMatUrl] = useState("");
  const [isUploadingMat, setIsUploadingMat] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  
  // Edit Material State
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editMatTitle, setEditMatTitle] = useState("");
  const [editMatCohort, setEditMatCohort] = useState("");
  const [isUpdatingMat, setIsUpdatingMat] = useState(false);

  // Edit Assignment State
  const [editingAssign, setEditingAssign] = useState<Assignment | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState("");
  const [editAssignDesc, setEditAssignDesc] = useState("");
  const [editAssignDueDate, setEditAssignDueDate] = useState("");
  const [isUpdatingAssign, setIsUpdatingAssign] = useState(false);

  // Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignDueDate, setNewAssignDueDate] = useState("");
  const [newAssignCohort, setNewAssignCohort] = useState("batch-1");
  const [newAssignFile, setNewAssignFile] = useState<File | null>(null);
  const [isCreatingAssign, setIsCreatingAssign] = useState(false);

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Crucible State
  const [crucibleQuestions, setCrucibleQuestions] = useState<CrucibleQuestion[]>([]);
  const [newCqText, setNewCqText] = useState("");
  const [newCqOptions, setNewCqOptions] = useState(["", "", "", ""]);
  const [newCqAnswer, setNewCqAnswer] = useState(0);
  const [newCqDifficulty, setNewCqDifficulty] = useState("Medium");
  const [newCqTopic, setNewCqTopic] = useState("General");
  const [isSeedingQs, setIsSeedingQs] = useState(false);

  const [activeTab, setActiveTab] = useState<'temp_registrations' | 'perm_registrations' | 'materials' | 'assignments' | 'submissions' | 'settings' | 'leaderboard' | 'crucible'>('temp_registrations');
  const [globalBatch, setGlobalBatch] = useState("batch-1");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const navigate = useNavigate();

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchSettings();
        fetchRecords('temp');
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // fetchRecords and setIsAuthenticated are handled by onAuthStateChanged
    } catch (err: any) {
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

  const fetchRecords = async (type: 'temp' | 'perm') => {
    try {
      const collName = type === 'temp' ? "internships_temp" : "internships";
      const q = query(collection(db, collName), orderBy("created_at", "desc"));
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

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "general"));
      if (snap.exists() && snap.data().currentBatch) {
        setGlobalBatch(snap.data().currentBatch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates: any = { currentBatch: globalBatch };
      await setDoc(doc(db, "settings", "general"), updates, { merge: true });
      alert("Settings saved successfully!");
    } catch(err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const q = query(collection(db, "materials"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data: Material[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Material));
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const q = query(collection(db, "access_logs"), orderBy("accessed_at", "desc"));
      const snap = await getDocs(q);
      const data: AccessLog[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AccessLog));
      setAccessLogs(data);
    } catch (error) {
      console.error("Failed to fetch access logs:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const q = query(collection(db, "assignments"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data: Assignment[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, "submissions"), orderBy("submitted_at", "desc"));
      const snap = await getDocs(q);
      const data: Submission[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  const openEditMaterial = (mat: Material) => {
    setEditingMaterial(mat);
    setEditMatTitle(mat.title);
    setEditMatCohort(mat.cohort);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    setIsUpdatingMat(true);
    try {
      await updateDoc(doc(db, "materials", editingMaterial.id), {
        title: editMatTitle.trim(),
        cohort: editMatCohort.trim()
      });
      
      setMaterials(prev => prev.map(m => 
        m.id === editingMaterial.id 
          ? { ...m, title: editMatTitle.trim(), cohort: editMatCohort.trim() } 
          : m
      ));
      
      setEditingMaterial(null);
      alert("Material updated successfully!");
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material.");
    } finally {
      setIsUpdatingMat(false);
    }
  };

  const fetchCrucibleQuestions = async () => {
    try {
      const snap = await getDocs(collection(db, "crucible_questions"));
      const data: CrucibleQuestion[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as CrucibleQuestion));
      setCrucibleQuestions(data);
    } catch (err) {
      console.error("Failed to fetch crucible questions:", err);
    }
  };

  const handleAddCrucibleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCqText) return;
    try {
      await addDoc(collection(db, "crucible_questions"), {
        question: newCqText,
        options: newCqOptions,
        answer: newCqAnswer,
        difficulty: newCqDifficulty,
        topic: newCqTopic,
        created_at: serverTimestamp()
      });
      setNewCqText("");
      setNewCqOptions(["", "", "", ""]);
      setNewCqAnswer(0);
      setNewCqDifficulty("Medium");
      setNewCqTopic("General");
      fetchCrucibleQuestions();
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Failed to add question.");
    }
  };

  const handleDeleteCrucibleQuestion = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this question from The Crucible?")) return;
    try {
      await deleteDoc(doc(db, "crucible_questions", String(id)));
      setCrucibleQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question.");
    }
  };

  const handleSeedCrucibleQuestions = async () => {
    if (!window.confirm("This will upload all original 100 questions into the Crucible. Continue?")) return;
    setIsSeedingQs(true);
    try {
      for (const q of QUESTIONS) {
        await setDoc(doc(db, "crucible_questions", String(q.id)), {
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options,
          answer: q.answer,
          created_at: serverTimestamp()
        });
      }
      alert("Seeding complete! You now have a full question bank.");
      fetchCrucibleQuestions();
    } catch (err) {
      console.error(err);
      alert("Error seeding questions.");
    } finally {
      setIsSeedingQs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
      fetchAccessLogs();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
      fetchAccessLogs();
    } else if (activeTab === 'submissions') {
      fetchSubmissions();
    } else if (activeTab === 'temp_registrations') {
      fetchRecords('temp');
    } else if (activeTab === 'perm_registrations') {
      fetchRecords('perm');
    } else if (activeTab === 'settings') {
      fetchSettings();
    } else if (activeTab === 'crucible') {
      fetchCrucibleQuestions();
    }
  }, [activeTab]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle || !newAssignCohort || !newAssignDueDate) return;
    setIsCreatingAssign(true);
    try {
      let attachment_url = "";

      if (newAssignFile) {
        const formData = new FormData();
        formData.append('file', newAssignFile);
        formData.append('upload_preset', 'lms_unsigned');
        formData.append('cloud_name', 'dqts6umdd');

        const res = await fetch('https://api.cloudinary.com/v1_1/dqts6umdd/auto/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");

        attachment_url = data.secure_url;
      }

      const assignData: any = {
        title: newAssignTitle,
        description: newAssignDesc,
        due_date: newAssignDueDate,
        cohort: newAssignCohort,
        created_at: serverTimestamp()
      };

      if (attachment_url) {
        assignData.attachment_url = attachment_url;
      }

      await addDoc(collection(db, "assignments"), assignData);

      setNewAssignTitle("");
      setNewAssignDesc("");
      setNewAssignDueDate("");
      setNewAssignFile(null);
      await fetchAssignments();
      alert("Assignment created successfully!");
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment.");
    } finally {
      setIsCreatingAssign(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteDoc(doc(db, "assignments", id));
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    const feedback = window.prompt(`Enter feedback for this student (optional):`, "");
    if (feedback === null) return; // User cancelled

    try {
      await updateDoc(doc(db, "submissions", id), { status, feedback });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, feedback } : s));
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update status.");
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle || !newMatCohort) return;
    setIsUploadingMat(true);

    try {
      let finalUrl = newMatUrl;
      let detectedType = "link";

      if (newMatType === 'file' && newMatFile) {
        const formData = new FormData();
        formData.append('file', newMatFile);
        formData.append('upload_preset', 'lms_unsigned');
        formData.append('cloud_name', 'dqts6umdd');

        const res = await fetch('https://api.cloudinary.com/v1_1/dqts6umdd/auto/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");

        finalUrl = data.secure_url;

        // Auto-detect type
        const mime = newMatFile.type.toLowerCase();
        if (mime.includes('image')) detectedType = "image";
        else if (mime.includes('video')) detectedType = "video";
        else if (mime.includes('audio')) detectedType = "audio";
        else if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z') || mime.includes('compressed')) detectedType = "archive";
        else if (mime.includes('pdf')) detectedType = "pdf";
        else detectedType = "document";
      } else if (newMatType === 'link') {
        if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be') || finalUrl.includes('vimeo.com')) {
          detectedType = "video";
        } else {
          detectedType = "link";
        }
      }

      if (!finalUrl && newMatType !== 'file') {
        alert("Please provide a valid URL.");
        setIsUploadingMat(false);
        return;
      }

      await addDoc(collection(db, "materials"), {
        title: newMatTitle,
        type: detectedType,
        url: finalUrl,
        cohort: newMatCohort,
        created_at: serverTimestamp()
      });

      setNewMatTitle("");
      setNewMatFile(null);
      setNewMatUrl("");
      await fetchMaterials();
      alert("Material uploaded successfully!");
    } catch (error) {
      console.error("Error uploading material:", error);
      alert("Failed to upload material.");
    } finally {
      setIsUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRecords([]);
      setPassword("");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to delete ALL access logs? This action cannot be undone.")) return;
    try {
      const q = query(collection(db, "access_logs"));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(docSnap => deleteDoc(doc(db, "access_logs", docSnap.id)));
      await Promise.all(deletePromises);
      setAccessLogs([]);
      alert("All access logs cleared.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear logs.");
    }
  };

  const handleClearSubmissions = async () => {
    if (!window.confirm("Are you sure you want to delete ALL student submissions? This action cannot be undone.")) return;
    try {
      const q = query(collection(db, "submissions"));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(docSnap => deleteDoc(doc(db, "submissions", docSnap.id)));
      await Promise.all(deletePromises);
      setSubmissions([]);
      alert("All submissions cleared.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear submissions.");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStudent(true);
    try {
      let attachment_url = "placeholder_receipt.png";

      if (newStudentReceiptFile) {
        const formData = new FormData();
        formData.append('file', newStudentReceiptFile);
        formData.append('upload_preset', 'lms_unsigned');
        formData.append('cloud_name', 'dqts6umdd');

        const res = await fetch('https://api.cloudinary.com/v1_1/dqts6umdd/auto/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        attachment_url = data.secure_url;
      }

      let registrationId = newStudent.registration_id?.trim();
      if (!registrationId) {
        const trackPrefix = newStudent.track.substring(0, 4).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        registrationId = `BLDCY-${trackPrefix}-${randomNum}`;
      }

      const cleanEmail = newStudent.email.trim().toLowerCase();

      const studentData = {
        ...newStudent,
        email: cleanEmail,
        receipt: attachment_url,
        registration_id: registrationId,
        cohort: globalBatch,
        created_at: serverTimestamp()
      };

      let existingAccount = false;
      // Create Firebase Auth account for student WITHOUT logging admin out
      try {
        const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, registrationId);
        await signOut(secondaryAuth);
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          existingAccount = true;
        } else {
          throw new Error(authError.message || "Failed to create secure student account.");
        }
      }

      await addDoc(collection(db, "internships"), studentData);
      await addDoc(collection(db, "internships_temp"), studentData);

      if (existingAccount) {
        alert("Student added to database! \n\nNOTE: A login account for this email already existed in the system (likely from when you first added them). Their password remains whatever Registration ID was used the VERY FIRST time they were created.");
      } else {
        alert("Student added successfully! Their password is their Registration ID: " + registrationId);
      }
      setIsAddingStudent(false);
      setNewStudent({ name: "", email: "", phone: "", track: "uiux", college: "", degree: "", reason: "", cohort: "batch-1", referral_code: "", registration_id: "" });
      setNewStudentReceiptFile(null);
      fetchRecords(activeTab === 'perm_registrations' ? 'perm' : 'temp');
    } catch (error: any) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Reason: " + (error.message || error));
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this specific registration?")) {
      return;
    }

    try {
      const collName = activeTab === 'temp_registrations' ? "internships_temp" : "internships";
      await deleteDoc(doc(db, collName, id));
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("An error occurred while deleting the record.");
    }
  };

  const filteredRecords = records.filter(record =>
    (cohortFilter === "all" || (record.cohort || "batch-1") === cohortFilter) &&
    (record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.track.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDownloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "Track", "College", "Degree", "Cohort", "Referral Code", "Registration ID", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(r => [
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${trackNames[r.track] || r.track}"`,
        `"${r.college}"`,
        `"${r.degree}"`,
        `"${r.cohort}"`,
        `"${r.referral_code || ""}"`,
        `"${r.registration_id}"`,
        `"${formatDate(r.created_at)}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Buildicy_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePurgeTempDb = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL records from the Temp Database? Permanent records will be kept safe. This action cannot be undone.")) return;
    try {
      const snap = await getDocs(collection(db, "internships_temp"));
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "internships_temp", d.id)));
      await Promise.all(deletePromises);
      alert("Temp database has been successfully purged!");
      setRecords([]);
    } catch(err) {
      console.error(err);
      alert("Failed to purge temp database.");
    }
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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
            </div>
            
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Internship Portal</h1>
            <p className="text-white/60">Manage all registered applicants and payments.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl border border-white/10 text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sticky top-24 z-20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 px-3">People</h3>
                <div className="space-y-1">
                  <button onClick={() => setActiveTab('temp_registrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'temp_registrations' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><ShieldAlert size={16} /> Temporary Registrations</button>
                  <button onClick={() => setActiveTab('perm_registrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'perm_registrations' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Lock size={16} /> Permanent Interns</button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 px-3">Content</h3>
                <div className="space-y-1">
                  <button onClick={() => setActiveTab('materials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'materials' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><BookOpen size={16} /> Vault Materials</button>
                  <button onClick={() => setActiveTab('assignments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'assignments' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Edit2 size={16} /> Assignments</button>
                  <button onClick={() => setActiveTab('submissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'submissions' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><CheckCircle2 size={16} /> Submissions</button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 px-3">Gamification</h3>
                <div className="space-y-1">
                  <button onClick={() => setActiveTab('leaderboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Trophy size={16} /> Leaderboard</button>
                  <button onClick={() => setActiveTab('crucible')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'crucible' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Target size={16} /> The Crucible</button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 px-3">System</h3>
                <div className="space-y-1">
                  <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><Settings size={16} /> Settings</button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 w-full">

        {(activeTab === 'temp_registrations' || activeTab === 'perm_registrations') && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
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
              <div className="flex items-center gap-4">
                <select
                  value={cohortFilter}
                  onChange={(e) => setCohortFilter(e.target.value)}
                  className="bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm font-bold"
                >
                  <option value="all">All Cohorts</option>
                  <option value="batch-1">Batch 1</option>
                  <option value="batch-2">Batch 2</option>
                  <option value="batch-3">Batch 3</option>
                  <option value="batch-4">Batch 4</option>
                  <option value="batch-5">Batch 5</option>
                  <option value="batch-6">Batch 6</option>
                </select>
                {activeTab === 'temp_registrations' && (
                  <button 
                    onClick={handlePurgeTempDb}
                    className="px-4 py-2 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/20 text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    <Trash2 size={16} /> Purge Temp DB
                  </button>
                )}
                <button 
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-xl border border-green-500/30 text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl border border-purple-500/30 text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Add Student
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
        )}

        {activeTab === 'materials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <UploadCloud className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upload Material to Vault</h2>
                  <p className="text-sm text-white/50">Upload PDFs, Links, or Video URLs for student access.</p>
                </div>
              </div>

              <form onSubmit={handleUploadMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Material Title</label>
                  <input type="text" required value={newMatTitle} onChange={e => setNewMatTitle(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g. Week 1 Slides" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Assign to Cohort</label>
                  <input type="text" required value={newMatCohort} onChange={e => setNewMatCohort(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Type</label>
                  <select value={newMatType} onChange={e => setNewMatType(e.target.value as any)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50">
                    <option value="file">File Upload</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Resource</label>
                  {newMatType === 'file' ? (
                    <input type="file" onChange={e => setNewMatFile(e.target.files?.[0] || null)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400" required />
                  ) : (
                    <input type="url" required value={newMatUrl} onChange={e => setNewMatUrl(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50" placeholder="https://..." />
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button type="submit" disabled={isUploadingMat} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
                    {isUploadingMat ? "Uploading..." : "Publish Material"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#050507]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Cohort</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {materials.map(mat => (
                    <tr key={mat.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-white font-medium">{mat.title}</td>
                      <td className="px-6 py-4 text-white/60 text-sm uppercase tracking-wider">{mat.type}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-white/70">{mat.cohort}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditMaterial(mat)} className="p-2 bg-blue-900/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors" title="Edit Material">
                            <Edit2 size={16} />
                          </button>
                          <a href={mat.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors" title="View Material"><Eye size={16} /></a>
                          <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors" title="Delete Material"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-white/40">No materials uploaded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>


          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Edit2 className="text-purple-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Assignment</h2>
                  <p className="text-sm text-white/50">Push tasks and projects to specific cohorts.</p>
                </div>
              </div>

              <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Title</label>
                  <input type="text" required value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="e.g. Frontend Clone Project" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Description</label>
                  <textarea required value={newAssignDesc} onChange={e => setNewAssignDesc(e.target.value)} rows={3} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="Provide instructions..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Due Date</label>
                  <input type="date" required value={newAssignDueDate} onChange={e => setNewAssignDueDate(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Assign to Cohort</label>
                  <input type="text" required value={newAssignCohort} onChange={e => setNewAssignCohort(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Attachment (Optional)</label>
                  <input type="file" onChange={e => setNewAssignFile(e.target.files?.[0] || null)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-400" />
                  <p className="text-[10px] text-white/30 mt-2">Attach PDF, image, or ZIP file to this assignment.</p>
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button type="submit" disabled={isCreatingAssign} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
                    {isCreatingAssign ? "Creating..." : "Dispatch Assignment"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#050507]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Cohort</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Due Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-white font-medium">{a.title}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-white/70">{a.cohort}</span></td>
                      <td className="px-6 py-4 text-white/60 text-sm">{a.due_date}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteAssignment(a.id)} className="p-2 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-white/40">No assignments created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>



          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><CheckCircle2 className="text-green-400" size={24} /> Submissions Review</h2>
                  <p className="text-sm text-white/50">Approve or reject student submissions here. Students will see the status change immediately.</p>
                </div>
                <button onClick={handleClearSubmissions} className="px-4 py-2 bg-red-900/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20 text-sm font-bold transition-colors flex items-center gap-2">
                  <Trash2 size={16} /> Clear All
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#050507]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Cohort</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">File</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-white font-medium">{sub.student_name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-white/70">{sub.cohort}</span></td>
                      <td className="px-6 py-4">
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1">
                          View Work <ArrowRight size={14} />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            sub.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {sub.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateSubmissionStatus(sub.id, 'approved')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-xs transition-colors">Approve</button>
                            <button onClick={() => handleUpdateSubmissionStatus(sub.id, 'rejected')} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs transition-colors">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-white/40">No submissions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-blue-500/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-blue-400" /> B-Cores Leaderboard
                </h2>
              </div>
              <AdminLeaderboard />
            </div>
          </div>
        )}

        {/* Crucible Tab */}
        {activeTab === 'crucible' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start bg-purple-500/5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Target className="text-purple-400" size={24} /> The Crucible Bank</h2>
                  <p className="text-sm text-white/50">Manage the global question bank for Buiz Arena.</p>
                </div>
                <button 
                  onClick={handleSeedCrucibleQuestions}
                  disabled={isSeedingQs}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSeedingQs ? "Seeding..." : "Seed Default Questions"}
                </button>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8">
                {/* Add New Question Form */}
                <div className="w-full xl:w-1/3 space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">Add New Question</h3>
                  <form onSubmit={handleAddCrucibleQuestion} className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <input 
                      type="text" 
                      placeholder="Enter question text..." 
                      value={newCqText}
                      onChange={e => setNewCqText(e.target.value)}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      {newCqOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="newCqAnswer" 
                            checked={newCqAnswer === idx} 
                            onChange={() => setNewCqAnswer(idx)}
                            className="w-4 h-4 text-purple-600 bg-[#050507] border-white/20"
                          />
                          <input 
                            type="text" 
                            placeholder={`Option ${idx + 1}`} 
                            value={opt}
                            onChange={e => {
                              const newOpts = [...newCqOptions];
                              newOpts[idx] = e.target.value;
                              setNewCqOptions(newOpts);
                            }}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={newCqDifficulty} 
                        onChange={e => setNewCqDifficulty(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Topic (e.g. React)"
                        value={newCqTopic}
                        onChange={e => setNewCqTopic(e.target.value)}
                        className="w-full bg-[#050507] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all text-sm"
                    >
                      Add Question
                    </button>
                  </form>
                </div>

                {/* List of Questions */}
                <div className="flex-1 space-y-4 max-h-[600px] overflow-y-auto pr-4">
                  <h3 className="text-lg font-bold text-white mb-4">Question Bank ({crucibleQuestions.length})</h3>
                  {crucibleQuestions.length === 0 ? (
                    <p className="text-white/40 italic">The Crucible is empty. Seed default questions or add a new one.</p>
                  ) : (
                    crucibleQuestions.map(q => (
                      <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">{q.topic}</span>
                        </div>
                        <p className="text-white font-medium mb-3">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`text-xs p-2 rounded border ${idx === q.answer ? 'bg-green-500/20 border-green-500/50 text-green-400 font-bold' : 'bg-[#050507] border-white/10 text-zinc-400'}`}>
                              {String.fromCharCode(65 + idx)}. {opt}
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleDeleteCrucibleQuestion(q.id)}
                          className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



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
      {/* Add Student Modal */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setIsAddingStudent(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Student</h3>
              <button onClick={() => setIsAddingStudent(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Full Name</label>
                  <input type="text" required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Email</label>
                  <input type="email" required value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Phone Number</label>
                  <input type="text" required value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Track</label>
                  <select required value={newStudent.track} onChange={e => setNewStudent({ ...newStudent, track: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50">
                    {Object.entries(trackNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">College/University</label>
                  <input type="text" required value={newStudent.college} onChange={e => setNewStudent({ ...newStudent, college: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Degree</label>
                  <input type="text" required value={newStudent.degree} onChange={e => setNewStudent({ ...newStudent, degree: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Registration ID (Optional)</label>
                  <input type="text" value={newStudent.registration_id || ""} onChange={e => setNewStudent({ ...newStudent, registration_id: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="Auto-generated if blank" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Referral Code</label>
                  <input type="text" value={newStudent.referral_code} onChange={e => setNewStudent({ ...newStudent, referral_code: e.target.value })} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Reason for Joining</label>
                  <textarea required value={newStudent.reason} onChange={e => setNewStudent({ ...newStudent, reason: e.target.value })} rows={3} className="w-full bg-[#050507] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-purple-500/50"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Receipt Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#050507] border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors">
                      <UploadCloud size={18} className="text-purple-400" />
                      <span className="text-sm text-white/70">{newStudentReceiptFile ? newStudentReceiptFile.name : "Upload Receipt"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setNewStudentReceiptFile(e.target.files?.[0] || null)} />
                    </label>
                    {newStudentReceiptFile && (
                      <button type="button" onClick={() => setNewStudentReceiptFile(null)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmittingStudent} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
                  {isSubmittingStudent ? "Adding..." : "Add Student to Database"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-purple-400" size={24}/> System Settings</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Current Active Batch</label>
                <input type="text" required value={globalBatch} onChange={e => setGlobalBatch(e.target.value)} className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50" placeholder="e.g. batch-2" />
                <p className="text-sm text-white/40 mt-2">New student registrations will automatically be tagged with this cohort name. This affects both databases.</p>
              </div>
              <button type="submit" disabled={isSavingSettings} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50">
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setEditingMaterial(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-blue-500/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="text-blue-400" size={20} /> Edit Material
              </h3>
              <button onClick={() => setEditingMaterial(null)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMaterial} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Material Title</label>
                <input 
                  type="text" 
                  required 
                  value={editMatTitle} 
                  onChange={e => setEditMatTitle(e.target.value)} 
                  className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Assigned Cohort</label>
                <input 
                  type="text" 
                  required 
                  value={editMatCohort} 
                  onChange={e => setEditMatCohort(e.target.value)} 
                  className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors" 
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-yellow-400 shrink-0" size={20} />
                <p className="text-xs text-yellow-200/70 leading-relaxed">
                  Only the Title and Cohort can be edited. If you uploaded the wrong file or link, please delete this material and re-upload it.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingMat} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isUpdatingMat ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editingAssign && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setEditingAssign(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-500/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="text-purple-400" size={20} /> Edit Assignment
              </h3>
              <button onClick={() => setEditingAssign(null)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAssignment} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Assignment Title</label>
                <input 
                  type="text" 
                  required 
                  value={editAssignTitle} 
                  onChange={e => setEditAssignTitle(e.target.value)} 
                  className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Description</label>
                <textarea 
                  required 
                  value={editAssignDesc} 
                  onChange={e => setEditAssignDesc(e.target.value)} 
                  rows={3}
                  className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Due Date</label>
                <input 
                  type="date" 
                  required 
                  value={editAssignDueDate} 
                  onChange={e => setEditAssignDueDate(e.target.value)} 
                  className="w-full bg-[#050507] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors" 
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-yellow-400 shrink-0" size={20} />
                <p className="text-xs text-yellow-200/70 leading-relaxed">
                  Only the Title, Description, and Due Date can be edited. If you assigned the wrong file, please delete this assignment and re-upload it.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingAssign} 
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isUpdatingAssign ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
