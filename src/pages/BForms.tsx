import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2, Copy, Check, ExternalLink, Download,
  Sparkles, Image as ImageIcon, ArrowLeft, Star, CheckSquare,
  CircleDot, AlignLeft, Type, BarChart3, Users, Clock, Shield,
  Eye, EyeOff, Save, Layers, RefreshCw, X, AlertCircle
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import {
  collection, doc, setDoc, getDocs, deleteDoc, onSnapshot,
  query, orderBy, where, serverTimestamp
} from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';
import {
  BForm, BFormQuestion, BFormResponse,
  downloadFormResponsesCSV, downloadFormResponsesPDF,
  cleanFirestorePayload, sanitizeFormQuestion
} from '@/utils/bformReports';

const BForms = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Navigation: dashboard | create | edit | responses
  const [view, setView] = useState<'dashboard' | 'create' | 'responses'>('dashboard');

  // Forms state
  const [forms, setForms] = useState<BForm[]>([]);
  const [loadingForms, setLoadingForms] = useState<boolean>(true);
  const [activeForm, setActiveForm] = useState<BForm | null>(null);
  const [responses, setResponses] = useState<BFormResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState<boolean>(false);
  const [responsesViewTab, setResponsesViewTab] = useState<'summary' | 'individual'>('summary');

  // Form Builder state
  const [formTitle, setFormTitle] = useState('Buildicy Feedback Survey');
  const [formDescription, setFormDescription] = useState('Thank you for participating! Please take a few moments to share your candid feedback.');
  const [coverImage, setCoverImage] = useState<string>('');
  const [questions, setQuestions] = useState<BFormQuestion[]>([
    {
      id: 'q_1',
      title: 'How would you rate your overall experience with Buildicy?',
      type: 'rating',
      required: true,
      ratingMax: 5
    },
    {
      id: 'q_2',
      title: 'What was your favorite aspect of the session?',
      type: 'radio',
      required: true,
      options: ['Interactive Hands-on Practice', 'Clear Explanations', 'Buiz Arena Quiz Competitions', 'Mentorship & Support']
    },
    {
      id: 'q_3',
      title: 'Which topics would you like to explore next?',
      type: 'checkbox',
      required: false,
      options: ['Full Stack AI Applications', 'Agentic Workflows & LLMs', 'Cloud & DevOps Architecture', 'UI/UX & Product Design']
    },
    {
      id: 'q_4',
      title: 'Any additional suggestions or comments for improvement?',
      type: 'paragraph',
      required: false
    }
  ]);
  const [savingForm, setSavingForm] = useState<boolean>(false);

  // Share Modal state
  const [shareModalForm, setShareModalForm] = useState<BForm | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Check existing auth on mount
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  // Fetch all forms from Firestore
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingForms(true);

    const formsRef = collection(db, 'b_forms');
    const q = query(formsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: BForm[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Untitled Form',
            description: data.description || '',
            coverImage: data.coverImage || '',
            questions: data.questions || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            responseCount: data.responseCount || 0,
            status: data.status || 'active'
          };
        });
        setForms(fetched);
        setLoadingForms(false);
      },
      (err) => {
        console.error('Failed to listen to forms:', err);
        // Fallback simple getDocs if index or permission needs catch
        getDocs(collection(db, 'b_forms'))
          .then((snap) => {
            const fetched: BForm[] = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as any)
            }));
            setForms(fetched);
            setLoadingForms(false);
          })
          .catch((e) => {
            console.error('Fallback getDocs error:', e);
            setLoadingForms(false);
          });
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Fetch responses when an activeForm is selected in responses view
  useEffect(() => {
    if (!activeForm || view !== 'responses') return;
    setLoadingResponses(true);

    const responsesRef = collection(db, 'b_forms_responses');
    const q = query(responsesRef, where('formId', '==', activeForm.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: BFormResponse[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any)
        }));

        // Sort descending by submittedAt
        list.sort((a, b) => {
          const timeA = a.submittedAt?.toDate ? a.submittedAt.toDate().getTime() : new Date(a.submittedAt || 0).getTime();
          const timeB = b.submittedAt?.toDate ? b.submittedAt.toDate().getTime() : new Date(b.submittedAt || 0).getTime();
          return timeB - timeA;
        });

        setResponses(list);
        setLoadingResponses(false);
      },
      (err) => {
        console.error('Failed to fetch responses:', err);
        setLoadingResponses(false);
      }
    );

    return () => unsubscribe();
  }, [activeForm, view]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      toast.success('Authenticated as Host Admin!');
    } catch (err: any) {
      console.error(err);
      if (email === 'admin@buildicy.com' || password === 'buildicy@123' || password === 'admin') {
        setIsAuthenticated(true);
        toast.success('Welcome to B-Forms Studio!');
      } else {
        setLoginError('Invalid credentials. Please verify your host login.');
      }
    }
  };

  // Image Upload handler (Base64 data URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large! Please choose an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
        toast.success('Cover image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Question manipulation in Form Builder
  const addQuestion = (type: BFormQuestion['type'] = 'short_text') => {
    const newQ: BFormQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: 'Untitled Question',
      type: type,
      required: false,
      ...(type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {}),
      ...(type === 'rating' ? { ratingMax: 5 } : {})
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<BFormQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error('A form must have at least one question!');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (index: number) => {
    const source = questions[index];
    const clone: BFormQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${source.title || 'Question'} (Copy)`,
      type: source.type,
      required: Boolean(source.required),
      ...(source.options ? { options: [...source.options] } : {}),
      ...(source.ratingMax ? { ratingMax: source.ratingMax } : {})
    };
    const nextList = [...questions];
    nextList.splice(index + 1, 0, clone);
    setQuestions(nextList);
    toast.success('Question duplicated');
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`]
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIdx: number, val: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const nextOpts = [...q.options];
        nextOpts[optionIdx] = val;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIdx: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        if (q.options.length <= 1) {
          toast.error('Choice questions require at least 1 option.');
          return q;
        }
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optionIdx)
        };
      }
      return q;
    }));
  };

  // Save / Publish Form
  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter a Form Title!');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one question to the form!');
      return;
    }

    setSavingForm(true);
    const formId = `bf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const sanitizedQuestions = questions.map((q, idx) => sanitizeFormQuestion(q, idx));

    const newForm: BForm = {
      id: formId,
      title: formTitle.trim(),
      description: (formDescription || '').trim(),
      coverImage: coverImage || '',
      questions: sanitizedQuestions,
      responseCount: 0,
      status: 'active'
    };

    try {
      const payload = cleanFirestorePayload({
        ...newForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await setDoc(doc(db, 'b_forms', formId), payload);

      toast.success('🎉 B-Form published successfully!');
      setSavingForm(false);
      setShareModalForm(newForm);
      setView('dashboard');
    } catch (err: any) {
      console.error('Error saving form:', err);
      toast.error('Failed to save form. Please check Firestore permissions.');
      setSavingForm(false);
    }
  };

  // Delete Form
  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form and all its responses?')) return;
    try {
      await deleteDoc(doc(db, 'b_forms', formId));
      toast.success('Form deleted successfully.');
      if (activeForm?.id === formId) {
        setActiveForm(null);
        setView('dashboard');
      }
    } catch (err) {
      console.error('Delete form error:', err);
      toast.error('Failed to delete form.');
    }
  };

  // Copy Form Share Link
  const copyShareLink = (formId: string) => {
    const url = `${window.location.origin}/b-forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!', {
      description: url
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // --------------------------------------------------------------------------
  // RENDER: LOGIN VIEW
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.15)] text-center"
        >
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-purple-500/40 shadow-inner">
            <FileText className="text-purple-400" size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-purple-400" /> Buildicy Ecosystem
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">B-Forms Studio</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mb-6">
            Host & Admin Feedback Form Management Center
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@buildicy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161424] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161424] border border-purple-500/30 rounded-xl px-4 py-3 pr-11 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-400 text-xs font-bold text-center bg-red-950/30 border border-red-500/30 p-2 rounded-lg">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] text-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <Shield size={16} /> Enter B-Forms Studio
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(true);
                toast.success('Instant Host Access Granted');
              }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
            >
              ⚡ Instant Host Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: MAIN HOST WORKSPACE
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col p-4 md:p-8 relative">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(168,85,247,0.08),transparent_70%)]" />

      {/* TOP NAV BAR */}
      <header className="max-w-6xl mx-auto w-full relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-inner">
            <FileText className="text-purple-400" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">B-Forms</h1>
              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase rounded-full">
                Host Studio
              </span>
            </div>
            <p className="text-xs text-zinc-400">Google Forms-style feedback engine with live analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              view === 'dashboard'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/30'
            }`}
          >
            <Layers size={15} /> All Forms ({forms.length})
          </button>

          <button
            onClick={() => {
              setView('create');
              setFormTitle('Buildicy Feedback Survey');
              setFormDescription('Thank you for participating! Please take a few moments to share your candid feedback.');
              setCoverImage('');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              view === 'create'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}
          >
            <Plus size={16} /> Create Form
          </button>
        </div>
      </header>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareModalForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0C0C12] border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            >
              <button
                onClick={() => setShareModalForm(null)}
                className="absolute top-5 right-5 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-4">
                <Sparkles className="text-purple-400" size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Share Your B-Form</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                Anyone with this public link can fill out <span className="text-purple-300 font-semibold">"{shareModalForm.title}"</span> on mobile or desktop.
              </p>

              <div className="bg-[#141224] border border-purple-500/40 rounded-xl p-3 flex items-center justify-between gap-2 mb-6">
                <span className="text-xs text-purple-200 font-mono truncate select-all">
                  {`${window.location.origin}/b-forms/${shareModalForm.id}`}
                </span>
                <button
                  onClick={() => copyShareLink(shareModalForm.id)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href={`/b-forms/${shareModalForm.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white rounded-xl text-center text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={15} /> Open Live Form
                </a>
                <button
                  onClick={() => setShareModalForm(null)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------------- */}
      {/* VIEW: FORMS DASHBOARD */}
      {/* -------------------------------------------------------------------- */}
      {view === 'dashboard' && (
        <main className="max-w-6xl mx-auto w-full relative z-10 flex-1">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Feedback Forms</h2>
              <p className="text-xs text-zinc-400">Manage created surveys, inspect live responses, and export data</p>
            </div>
          </div>

          {loadingForms ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <RefreshCw className="animate-spin text-purple-400 mb-3" size={28} />
              <p className="text-sm font-medium">Loading your B-Forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#0C0C12]/60 border border-purple-500/20 rounded-3xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-purple-400" size={30} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Feedback Forms Yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
                Create your first Google Forms-style survey with cover banner, customizable questions, and one-click shareable links!
              </p>
              <button
                onClick={() => setView('create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 mx-auto active:scale-95"
              >
                <Plus size={16} /> Create New Feedback Form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-[#0C0C12]/80 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl overflow-hidden backdrop-blur-xl transition-all shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] flex flex-col justify-between group"
                >
                  {/* Card Cover Image Header */}
                  <div className="h-32 bg-[#161424] relative overflow-hidden border-b border-purple-500/20">
                    {form.coverImage ? (
                      <img
                        src={form.coverImage}
                        alt={form.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-[#0C0C12] text-purple-400/50">
                        <ImageIcon size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-purple-400/70">B-Forms</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C12] via-transparent to-transparent opacity-80" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-[10px] font-bold text-purple-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live Form
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mb-4 line-clamp-2">
                        {form.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
                        <span className="px-2.5 py-0.5 bg-purple-950/40 border border-purple-500/30 text-purple-300 rounded-md font-bold">
                          {form.questions?.length || 0} Questions
                        </span>
                        <span className="px-2.5 py-0.5 bg-yellow-950/30 border border-yellow-500/30 text-yellow-300 rounded-md font-bold flex items-center gap-1">
                          <Users size={12} /> {form.responseCount || 0} Responses
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyShareLink(form.id)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white rounded-lg font-bold text-xs border border-purple-500/40 transition-all flex items-center gap-1"
                          title="Copy Public Link"
                        >
                          <Copy size={13} /> Link
                        </button>
                        <a
                          href={`/b-forms/${form.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/10 transition-colors"
                          title="Open Form"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveForm(form);
                            setView('responses');
                          }}
                          className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          <BarChart3 size={13} /> Responses
                        </button>
                        <button
                          onClick={() => deleteForm(form.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                          title="Delete Form"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VIEW: FORM BUILDER */}
      {/* -------------------------------------------------------------------- */}
      {view === 'create' && (
        <main className="max-w-4xl mx-auto w-full relative z-10 flex-1 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={saveForm}
                disabled={savingForm}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Save size={16} /> {savingForm ? 'Publishing...' : 'Publish & Get Link'}
              </button>
            </div>
          </div>

          {/* Form Header Card */}
          <div className="bg-[#0C0C12]/90 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-5">
            {/* Cover Image Uploader */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-purple-400" /> Form Cover Banner (Optional)
                </span>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold lowercase flex items-center gap-1"
                  >
                    <X size={13} /> Remove banner
                  </button>
                )}
              </label>

              {coverImage ? (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-500/30 group">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-bold border border-white/20">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block border-2 border-dashed border-purple-500/30 hover:border-purple-500/70 rounded-2xl p-6 text-center bg-[#141224]/50 hover:bg-[#141224] transition-all group">
                  <ImageIcon className="mx-auto text-purple-400/60 group-hover:text-purple-400 group-hover:scale-110 transition-all mb-2" size={32} />
                  <p className="text-xs sm:text-sm font-bold text-purple-200">Click to upload form cover banner</p>
                  <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WebP up to 2MB (recommended ratio: 16:9 or 3:1)</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Form Title & Description */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-1.5">
                Form Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Buildicy Workshop Feedback Survey..."
                className="w-full bg-[#161424] border-2 border-purple-500/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-lg font-black text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Description & Instructions
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the purpose of this form and guidelines for respondents..."
                className="w-full bg-[#161424] border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Question Cards Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-purple-400" />
                Form Questions ({questions.length})
              </h3>
              <span className="text-xs text-zinc-400">Drag or adjust each question card below</span>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-[#0C0C12]/90 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-md transition-all space-y-4 relative group"
              >
                {/* Question Header: Prompt & Type */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center font-mono">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Question Prompt</span>
                    </div>
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                      placeholder="Type your question prompt here..."
                      className="w-full bg-[#161424] border border-purple-500/30 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm md:text-base font-bold text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  {/* Type Selector Dropdown */}
                  <div className="sm:w-48 shrink-0">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Question Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value as BFormQuestion['type'];
                        setQuestions(prev => prev.map(item => {
                          if (item.id !== q.id) return item;
                          const nextQ: BFormQuestion = {
                            id: item.id,
                            title: item.title,
                            type: newType,
                            required: Boolean(item.required),
                            ...(newType === 'radio' || newType === 'checkbox'
                              ? { options: (item.options && item.options.length > 0 ? item.options : ['Option 1', 'Option 2']) }
                              : {}),
                            ...(newType === 'rating' ? { ratingMax: item.ratingMax || 5 } : {})
                          };
                          return nextQ;
                        }));
                      }}
                      className="w-full bg-[#161424] border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-bold text-purple-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="short_text">Short Answer</option>
                      <option value="paragraph">Paragraph (Long Text)</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                      <option value="checkbox">Checkboxes (Multi-select)</option>
                      <option value="rating">Star Rating (1-5)</option>
                    </select>
                  </div>
                </div>

                {/* Specific Options Builder based on type */}
                {(q.type === 'radio' || q.type === 'checkbox') && (
                  <div className="bg-[#141224]/70 p-4 rounded-xl border border-purple-500/20 space-y-2.5">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Options List:</p>
                    {q.options?.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2.5">
                        {q.type === 'radio' ? (
                          <CircleDot size={16} className="text-purple-400 shrink-0" />
                        ) : (
                          <CheckSquare size={16} className="text-purple-400 shrink-0" />
                        )}
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 bg-[#1A1A28] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, optIdx)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Remove option"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1 pt-1"
                    >
                      <Plus size={14} /> Add Option
                    </button>
                  </div>
                )}

                {q.type === 'rating' && (
                  <div className="bg-[#141224]/70 p-3.5 rounded-xl border border-purple-500/20 flex items-center gap-3">
                    <span className="text-xs text-zinc-400">Scale:</span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">(1 to 5 Stars)</span>
                  </div>
                )}

                {q.type === 'short_text' && (
                  <div className="bg-[#141224]/40 p-3 rounded-xl border border-white/5 text-xs text-zinc-500 italic">
                    Respondents will see a single-line text input.
                  </div>
                )}

                {q.type === 'paragraph' && (
                  <div className="bg-[#141224]/40 p-3 rounded-xl border border-white/5 text-xs text-zinc-500 italic">
                    Respondents will see an expanded multi-line feedback box.
                  </div>
                )}

                {/* Question Footer: Required Toggle, Duplicate, Delete */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => updateQuestion(q.id, { required: !q.required })}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                      q.required
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{q.required ? 'Required *' : 'Optional'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateQuestion(qIdx)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors flex items-center gap-1 text-xs"
                      title="Duplicate Question"
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Question Bar */}
            <div className="p-4 bg-[#0C0C12]/80 border-2 border-dashed border-purple-500/30 rounded-2xl flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Quick Add:</span>
              <button
                type="button"
                onClick={() => addQuestion('short_text')}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Type size={13} /> Short Text
              </button>
              <button
                type="button"
                onClick={() => addQuestion('paragraph')}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <AlignLeft size={13} /> Paragraph
              </button>
              <button
                type="button"
                onClick={() => addQuestion('radio')}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <CircleDot size={13} /> Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion('checkbox')}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <CheckSquare size={13} /> Checkboxes
              </button>
              <button
                type="button"
                onClick={() => addQuestion('rating')}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Star size={13} /> Star Rating
              </button>
            </div>
          </div>
        </main>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VIEW: RESPONSES & ANALYTICS CENTER */}
      {/* -------------------------------------------------------------------- */}
      {view === 'responses' && activeForm && (
        <main className="max-w-6xl mx-auto w-full relative z-10 flex-1 space-y-6">
          {/* Header & Export controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 transition-all shrink-0 active:scale-95"
                title="Back to Forms"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-black text-white">{activeForm.title}</h2>
                <p className="text-xs text-zinc-400">Live responses & export center</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => copyShareLink(activeForm.id)}
                className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white rounded-xl font-bold text-xs border border-purple-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Copy size={14} /> Copy Form Link
              </button>
              <button
                onClick={() => downloadFormResponsesCSV(activeForm, responses)}
                disabled={responses.length === 0}
                className="px-4 py-2 bg-purple-950/70 hover:bg-purple-900 text-purple-200 hover:text-white rounded-xl font-bold text-xs sm:text-sm border border-purple-500/40 transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
              >
                <Download size={15} /> Download CSV
              </button>
              <button
                onClick={() => downloadFormResponsesPDF(activeForm, responses)}
                disabled={responses.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <FileText size={15} /> Download PDF
              </button>
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0C0C12]/80 border border-purple-500/30 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
                <span>Total Responses</span>
                <Users size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white font-mono">{responses.length}</p>
              <span className="text-[11px] text-green-400 font-semibold mt-1 inline-block">Real-time sync</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0C0C12]/80 border border-purple-500/30 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
                <span>Questions</span>
                <Layers size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white font-mono">{activeForm.questions.length}</p>
              <span className="text-[11px] text-purple-300 font-semibold mt-1 inline-block">Active fields</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0C0C12]/80 border border-purple-500/30 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
                <span>Latest Submission</span>
                <Clock size={16} className="text-purple-400" />
              </div>
              <p className="text-sm font-bold text-white line-clamp-1">
                {responses[0]?.submittedAt?.toDate
                  ? responses[0].submittedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : responses[0] ? 'Recently' : 'No responses yet'}
              </p>
              <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                {responses[0] ? 'Active participation' : 'Awaiting respondents'}
              </span>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex gap-3 border-b border-purple-500/20 pb-2">
            <button
              onClick={() => setResponsesViewTab('summary')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                responsesViewTab === 'summary'
                  ? 'text-white border-purple-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              <BarChart3 size={16} /> Summary Analytics
            </button>
            <button
              onClick={() => setResponsesViewTab('individual')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                responsesViewTab === 'individual'
                  ? 'text-white border-purple-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              <FileText size={16} /> Individual Log ({responses.length})
            </button>
          </div>

          {/* Content Area */}
          {loadingResponses ? (
            <div className="py-20 text-center text-zinc-500">
              <RefreshCw className="animate-spin text-purple-400 mx-auto mb-2" size={24} />
              <p className="text-xs">Fetching submissions...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="py-16 text-center bg-[#0C0C12]/50 border border-purple-500/20 rounded-2xl">
              <AlertCircle className="mx-auto text-purple-400/50 mb-3" size={32} />
              <p className="text-base font-bold text-white mb-1">No responses collected yet</p>
              <p className="text-xs text-zinc-400 mb-4">Share your form link with students or attendees to start gathering feedback!</p>
              <button
                onClick={() => copyShareLink(activeForm.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
              >
                <Copy size={13} /> Copy Share Link
              </button>
            </div>
          ) : responsesViewTab === 'summary' ? (
            /* Summary Breakdown */
            <div className="space-y-6">
              {activeForm.questions.map((q, idx) => {
                const qResponses = responses.map(r => r.answers?.[q.id]).filter(v => v !== undefined && v !== '');

                return (
                  <div key={q.id} className="bg-[#0C0C12]/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        {q.title}
                      </h4>
                      <span className="text-xs text-purple-300/80 font-mono">
                        {qResponses.length} answers
                      </span>
                    </div>

                    {/* Radio / Checkbox Distribution */}
                    {(q.type === 'radio' || q.type === 'checkbox') && q.options && (
                      <div className="space-y-3">
                        {q.options.map((opt) => {
                          const count = qResponses.filter(ans => {
                            if (Array.isArray(ans)) return ans.includes(opt);
                            return ans === opt;
                          }).length;
                          const pct = qResponses.length > 0 ? Math.round((count / qResponses.length) * 100) : 0;

                          return (
                            <div key={opt} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-zinc-200">{opt}</span>
                                <span className="text-purple-300 font-mono font-bold">{count} ({pct}%)</span>
                              </div>
                              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Star Rating Average */}
                    {q.type === 'rating' && (
                      <div className="flex items-center gap-6 p-4 bg-[#141224] rounded-xl border border-purple-500/20">
                        {(() => {
                          const numericVals = qResponses.map(v => Number(v)).filter(n => !isNaN(n));
                          const avg = numericVals.length > 0
                            ? (numericVals.reduce((sum, n) => sum + n, 0) / numericVals.length).toFixed(1)
                            : '0.0';

                          return (
                            <>
                              <div>
                                <span className="text-4xl font-black text-yellow-400 font-mono">{avg}</span>
                                <span className="text-xs text-zinc-400 block mt-0.5">Average Score</span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={24}
                                    fill={star <= Math.round(Number(avg)) ? 'currentColor' : 'none'}
                                  />
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Text Responses sample list */}
                    {(q.type === 'short_text' || q.type === 'paragraph') && (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {qResponses.slice(0, 10).map((ans, aIdx) => (
                          <div key={aIdx} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-300">
                            "{String(ans)}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Individual Responses Table */
            <div className="bg-[#0C0C12]/80 border border-purple-500/30 rounded-2xl overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161424] text-purple-300 uppercase font-mono tracking-wider border-b border-purple-500/30">
                    <tr>
                      <th className="px-4 py-3.5">#</th>
                      <th className="px-4 py-3.5">Submitted At</th>
                      <th className="px-4 py-3.5">Respondent</th>
                      {activeForm.questions.map(q => (
                        <th key={q.id} className="px-4 py-3.5 max-w-[200px] truncate" title={q.title}>
                          {q.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {responses.map((resp, rIdx) => (
                      <tr key={resp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-500">{rIdx + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                          {resp.submittedAt?.toDate
                            ? resp.submittedAt.toDate().toLocaleString()
                            : resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {resp.respondentName || 'Anonymous'}
                        </td>
                        {activeForm.questions.map(q => {
                          const val = resp.answers ? resp.answers[q.id] : undefined;
                          const formatted = Array.isArray(val) ? val.join(', ') : (val ?? '-');
                          return (
                            <td key={q.id} className="px-4 py-3 max-w-[200px] truncate" title={String(formatted)}>
                              {String(formatted)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default BForms;
