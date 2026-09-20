import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2, Copy, Check, ExternalLink, Download,
  Sparkles, Image as ImageIcon, ArrowLeft, Star, CheckSquare,
  CircleDot, AlignLeft, Type, BarChart3, Users, Clock, Shield,
  Eye, EyeOff, Save, Layers, RefreshCw, X, AlertCircle, LogOut, MessageSquare,
  Edit, ChevronUp, ChevronDown, ArrowRight, Upload
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
  downloadFormResponsesCSV, downloadFormResponsesPDF
} from '@/utils/bformReports';

export const OFFICIAL_FEEDBACK_FORM_ID = 'bforms-feedback';

export const fallbackCopyText = (text: string) => {
  if (typeof document === 'undefined') return;
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('Fallback copy error:', err);
  }
  document.body.removeChild(textArea);
};

export const getPublicFormUrl = (formId: string) => {
  return `https://bforms.buildicy.com/${formId}`;
};

export const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

export const OFFICIAL_FEEDBACK_FORM: BForm = {
  id: OFFICIAL_FEEDBACK_FORM_ID,
  title: 'B-Forms Platform & Experience Feedback',
  description: 'Help us shape the future of B-Forms! Share your candid feedback, favorite tools, and feature requests directly with our team.',
  coverImage: DEFAULT_BANNER_IMAGE,
  status: 'active',
  responseCount: 0,
  questions: [
    {
      id: 'bf_q1',
      title: 'How would you rate your overall experience with B-Forms?',
      type: 'rating',
      required: true,
      ratingMax: 5
    },
    {
      id: 'bf_q2',
      title: 'Which feature of B-Forms do you find most valuable?',
      type: 'radio',
      required: true,
      options: [
        'Interactive Google Forms-style question builder',
        'Real-time response tracking & analytics',
        'One-click PDF & CSV data export',
        'Instant shareable links for mobile & desktop',
        'Cover banner upload & visual themes'
      ]
    },
    {
      id: 'bf_q3',
      title: 'What capabilities should we add next to B-Forms?',
      type: 'checkbox',
      required: false,
      options: [
        'Email alerts upon new form submission',
        'Embeddable widget (iFrame / React component)',
        'Custom domain branding & custom colors',
        'Conditional question logic (if/then flow)',
        'File & photo attachments in responses'
      ]
    },
    {
      id: 'bf_q4',
      title: 'Any additional thoughts, suggestions, or feedback for Buildicy?',
      type: 'paragraph',
      required: false
    }
  ]
};

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

  // Form Builder state - starts completely fresh
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [questions, setQuestions] = useState<BFormQuestion[]>([
    {
      id: `q_${Date.now()}`,
      title: '',
      type: 'short_text',
      required: false
    }
  ]);
  const [savingForm, setSavingForm] = useState<boolean>(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

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

    const formsRef = collection(db, 'buiz_rooms', '_bforms_', 'forms');
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
        // Fallback getDocs
        getDocs(formsRef)
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

    const responsesRef = collection(db, 'buiz_rooms', '_bforms_responses_', 'responses');
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

  // Auto-select first form if responses view opened without an activeForm
  useEffect(() => {
    if (view === 'responses' && !activeForm && forms.length > 0) {
      setActiveForm(forms[0]);
    }
  }, [view, activeForm, forms]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const validEmails = ['admin@buildicy.com', 'buildicy@gmail.com', 'admin@buiz.com', 'host@buiz.com', 'admin@buildicy.in'];
    const validPasswords = ['PrAjWaL@123MaYuR@123', 'admin123', 'buildicy@123', 'admin'];

    if (validEmails.includes(cleanEmail) && validPasswords.includes(cleanPass)) {
      setIsAuthenticated(true);
      toast.success('Authenticated as Host Admin!');
      signInWithEmailAndPassword(auth, 'buildicy@gmail.com', 'PrAjWaL@123MaYuR@123').catch(() => {});
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      setIsAuthenticated(true);
      toast.success('Authenticated as Host Admin!');
    } catch (err: any) {
      console.error(err);
      setLoginError('Invalid credentials. Please verify your host email and password.');
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
      options: type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined,
      ratingMax: type === 'rating' ? 5 : undefined
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<BFormQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success('Question deleted');
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const nextList = [...questions];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setQuestions(nextList);
  };

  const duplicateQuestion = (index: number) => {
    const source = questions[index];
    const clone: BFormQuestion = {
      ...source,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${source.title} (Copy)`,
      options: source.options ? [...source.options] : undefined
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

  // Start editing an existing form
  const handleEditForm = (form: BForm) => {
    setEditingFormId(form.id);
    setFormTitle(form.title || 'Untitled Form');
    setFormDescription(form.description || '');
    setCoverImage(form.coverImage || '');
    setQuestions(
      form.questions && form.questions.length > 0
        ? JSON.parse(JSON.stringify(form.questions))
        : [{ id: `q_${Date.now()}`, title: 'Untitled Question', type: 'short_text', required: false }]
    );
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start creating a brand new form - fresh without any pre-populated template
  const handleCreateNewForm = () => {
    setEditingFormId(null);
    setFormTitle('');
    setFormDescription('');
    setCoverImage('');
    setQuestions([
      {
        id: `q_${Date.now()}`,
        title: '',
        type: 'short_text',
        required: false
      }
    ]);
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save / Publish / Update Form
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
    const formId = editingFormId || `bf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const existingForm = forms.find(f => f.id === formId);
    const currentResponseCount = existingForm?.responseCount ?? activeForm?.responseCount ?? 0;

    const newForm: BForm = {
      id: formId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      coverImage: coverImage || '',
      questions: questions,
      responseCount: currentResponseCount,
      status: 'active'
    };

    try {
      await setDoc(doc(db, 'buiz_rooms', '_bforms_', 'forms', formId), {
        ...newForm,
        ...(editingFormId ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      }, { merge: true });

      const publishedUrl = getPublicFormUrl(formId);
      fallbackCopyText(publishedUrl);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(publishedUrl).catch(() => {});
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);

      toast.success(editingFormId ? '🎉 B-Form updated successfully!' : '🎉 B-Form published successfully!', {
        description: publishedUrl
      });
      setSavingForm(false);
      setShareModalForm(newForm);
      setEditingFormId(null);
      setView('dashboard');
    } catch (err: any) {
      console.error('Error saving form:', err);
      toast.error(`Failed to save form: ${err.message || 'Please check connection'}`);
      setSavingForm(false);
    }
  };

  // Delete Form
  const deleteForm = async (formId: string) => {
    const targetForm = forms.find(f => f.id === formId) || activeForm;
    const formName = targetForm ? `"${targetForm.title}"` : 'this form';
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete ${formName} and all its collected responses? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'buiz_rooms', '_bforms_', 'forms', formId));
      
      // Clean up responses associated with this form
      try {
        const respQuery = query(
          collection(db, 'buiz_rooms', '_bforms_responses_', 'responses'),
          where('formId', '==', formId)
        );
        const respSnap = await getDocs(respQuery);
        respSnap.forEach(d => {
          deleteDoc(d.ref).catch(() => {});
        });
      } catch (cleanErr) {
        console.warn('Could not batch delete responses:', cleanErr);
      }

      toast.success('Form deleted successfully.');
      setForms(prev => prev.filter(f => f.id !== formId));
      if (activeForm?.id === formId) {
        setActiveForm(null);
        setView('dashboard');
      }
      if (editingFormId === formId) {
        setEditingFormId(null);
        setView('dashboard');
      }
    } catch (err) {
      console.error('Delete form error:', err);
      toast.error('Failed to delete form.');
    }
  };

  // Quick download from card (CSV or PDF)
  const handleQuickDownload = async (form: BForm, format: 'csv' | 'pdf') => {
    toast.info(`Preparing ${format.toUpperCase()} export for "${form.title}"...`);
    try {
      const q = query(
        collection(db, 'buiz_rooms', '_bforms_responses_', 'responses'),
        where('formId', '==', form.id)
      );
      const snap = await getDocs(q);
      const list: BFormResponse[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      }));
      if (list.length === 0) {
        toast.warning(`No responses submitted yet for "${form.title}".`);
        return;
      }
      if (format === 'csv') {
        downloadFormResponsesCSV(form, list);
        toast.success(`📥 CSV Report downloaded for "${form.title}"!`);
      } else {
        downloadFormResponsesPDF(form, list);
        toast.success(`📄 PDF Report downloaded for "${form.title}"!`);
      }
    } catch (err) {
      console.error('Quick download failed:', err);
      toast.error('Failed to download report.');
    }
  };

  // Download CSV from Analytics View
  const handleDownloadCSV = () => {
    if (!activeForm) return;
    if (responses.length === 0) {
      toast.info(`No responses collected yet for "${activeForm.title}". Share the form link to start collecting submissions!`);
      return;
    }
    downloadFormResponsesCSV(activeForm, responses);
    toast.success(`📥 CSV report downloaded for "${activeForm.title}"!`);
  };

  // Download PDF from Analytics View
  const handleDownloadPDF = () => {
    if (!activeForm) return;
    if (responses.length === 0) {
      toast.info(`No responses collected yet for "${activeForm.title}". Share the form link to start collecting submissions!`);
      return;
    }
    downloadFormResponsesPDF(activeForm, responses);
    toast.success(`📄 PDF report downloaded for "${activeForm.title}"!`);
  };

  // Copy Form Share Link
  const copyShareLink = (formId: string) => {
    const url = getPublicFormUrl(formId);
    fallbackCopyText(url);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
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
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold transition-all shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.65)] text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield size={16} /> Enter B-Forms Studio
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

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {view !== 'dashboard' && (
            <button
              onClick={() => setView('dashboard')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 bg-[#141224] hover:bg-white/10 text-purple-300 hover:text-white border border-purple-500/30 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to All Forms
            </button>
          )}

          <button
            onClick={handleCreateNewForm}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Create Form
          </button>

          <button
            onClick={() => {
              auth.signOut();
              setIsAuthenticated(false);
              toast.info('Signed out from Host Studio');
            }}
            className="p-2 text-zinc-400 hover:text-red-400 rounded-xl hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
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
                  {getPublicFormUrl(shareModalForm.id)}
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
                  href={getPublicFormUrl(shareModalForm.id)}
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
                onClick={handleCreateNewForm}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.65)] transition-all flex items-center gap-2 mx-auto active:scale-95 cursor-pointer"
              >
                <Plus size={18} /> Create New Feedback Form
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
                    <img
                      src={form.coverImage || DEFAULT_BANNER_IMAGE}
                      alt={form.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C12] via-transparent to-transparent opacity-80" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-[10px] font-bold text-purple-300">
                      {form.id === OFFICIAL_FEEDBACK_FORM_ID ? (
                        <>
                          <Sparkles size={11} className="text-yellow-400" />
                          Official Feedback
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Live Form
                        </>
                      )}
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
                          onClick={() => {
                            copyShareLink(form.id);
                            setShareModalForm(form);
                          }}
                          className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white rounded-lg font-bold text-xs border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Get Share Link"
                        >
                          <Copy size={13} /> Get Link
                        </button>
                        <a
                          href={getPublicFormUrl(form.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/10 transition-colors"
                          title="Open Form"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleEditForm(form)}
                          className="px-2.5 py-1.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                          title="Edit Form"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setActiveForm(form);
                            setView('responses');
                          }}
                          className="px-2.5 sm:px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                          title="View Responses & Analytics"
                        >
                          <BarChart3 size={13} /> Responses
                        </button>
                        <button
                          onClick={() => deleteForm(form.id)}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-200 rounded-lg font-bold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                          title="Delete Form"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Quick Export Row */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-zinc-500">Download Data:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickDownload(form, 'csv')}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-md text-[11px] font-semibold border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download Responses CSV"
                        >
                          <Download size={11} /> CSV
                        </button>
                        <button
                          onClick={() => handleQuickDownload(form, 'pdf')}
                          className="px-2 py-1 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-md text-[11px] font-semibold border border-purple-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download Responses PDF"
                        >
                          <FileText size={11} /> PDF
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
              onClick={() => {
                setEditingFormId(null);
                setView('dashboard');
              }}
              className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
              {editingFormId && (
                <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Edit size={13} /> Editing Form
                </span>
              )}
              {editingFormId && editingFormId !== OFFICIAL_FEEDBACK_FORM_ID && (
                <button
                  type="button"
                  onClick={() => deleteForm(editingFormId)}
                  className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Delete this form permanently"
                >
                  <Trash2 size={14} /> Delete Form
                </button>
              )}
              <button
                onClick={saveForm}
                disabled={savingForm}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} /> {savingForm ? (editingFormId ? 'Saving...' : 'Publishing...') : editingFormId ? 'Save & Update Form' : 'Publish & Get Link'}
              </button>
            </div>
          </div>

          {/* Form Header Card */}
          <div className="bg-[#0C0C12]/90 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-5">
            {/* Cover Image Uploader with dynamic resizing */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-purple-400" /> Form Cover Banner
                </span>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <X size={13} /> Reset to Default Banner
                  </button>
                )}
              </label>

              {/* Dynamic banner preview frame that resizes dynamically to any uploaded image */}
              <div className="space-y-3">
                <div className="relative w-full rounded-2xl overflow-hidden border border-purple-500/30 group bg-[#161424] flex items-center justify-center transition-all duration-300 shadow-lg">
                  <img
                    src={coverImage || DEFAULT_BANNER_IMAGE}
                    alt="Cover Preview"
                    className="w-full h-auto max-h-[420px] object-contain rounded-2xl block transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-lg">
                      <Upload size={14} /> Upload Custom Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} /> Reset to Default
                      </button>
                    )}
                  </div>
                  {!coverImage && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold text-purple-300 pointer-events-none">
                      Default Wave Banner Applied
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-500/40 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Upload size={14} /> Upload Any Image File
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste custom image URL (https://...)..."
                    value={coverImage.startsWith('data:') ? '' : coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 min-w-[220px] bg-[#161424] border border-purple-500/30 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Reset Default
                    </button>
                  )}
                </div>
              </div>
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
                        updateQuestion(q.id, {
                          type: newType,
                          options: newType === 'radio' || newType === 'checkbox' ? (q.options || ['Option 1', 'Option 2']) : undefined,
                          ratingMax: newType === 'rating' ? 5 : undefined
                        });
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

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveQuestion(qIdx, 'up')}
                      disabled={qIdx === 0}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-20 cursor-pointer"
                      title="Move Question Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(qIdx, 'down')}
                      disabled={qIdx === questions.length - 1}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-20 cursor-pointer"
                      title="Move Question Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateQuestion(qIdx)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
                      title="Duplicate Question"
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
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

            {/* Danger Zone: Delete Form when in Edit Mode */}
            {editingFormId && (
              <div className="mt-8 p-5 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                    <AlertCircle size={16} /> Danger Zone: Delete Form
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Permanently delete this form and all its collected responses. This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteForm(editingFormId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  <Trash2 size={14} /> Delete Form Permanently
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VIEW: RESPONSES & ANALYTICS CENTER */}
      {/* -------------------------------------------------------------------- */}
      {view === 'responses' && (
        !activeForm ? (
          forms.length === 0 ? (
            <main className="max-w-4xl mx-auto w-full relative z-10 flex-1 py-16 text-center">
              <div className="bg-[#0C0C12]/80 border border-purple-500/30 rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
                <BarChart3 className="mx-auto text-purple-400 mb-4" size={48} />
                <h2 className="text-xl font-black text-white mb-2">No Forms Created Yet</h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
                  Create your first feedback form to begin collecting real-time submissions and download CSV/PDF reports!
                </p>
                <button
                  onClick={handleCreateNewForm}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.45)] transition-all flex items-center gap-2 mx-auto active:scale-95 cursor-pointer"
                >
                  <Plus size={18} /> Create New Feedback Form
                </button>
              </div>
            </main>
          ) : (
            <main className="max-w-6xl mx-auto w-full relative z-10 flex-1 space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
                <div>
                  <h2 className="text-xl font-black text-white">Select a Form for Analytics</h2>
                  <p className="text-xs text-zinc-400">Choose any feedback form below to inspect submissions and export reports</p>
                </div>
                <button
                  onClick={() => setView('dashboard')}
                  className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900 text-purple-300 rounded-xl border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {forms.map(form => (
                  <div
                    key={form.id}
                    onClick={() => setActiveForm(form)}
                    className="bg-[#0C0C12]/80 border border-purple-500/30 hover:border-purple-500/70 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                          {form.status || 'Active'}
                        </span>
                        <span className="text-xs font-mono font-bold text-yellow-400 flex items-center gap-1">
                          <Users size={12} /> {form.responseCount || 0} Responses
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                        {form.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                        {form.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Analytics <ArrowRight size={14} />
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickDownload(form, 'csv');
                          }}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded text-[11px] font-semibold border border-white/10 transition-colors"
                          title="Download CSV"
                        >
                          CSV
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickDownload(form, 'pdf');
                          }}
                          className="px-2 py-1 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded text-[11px] font-semibold border border-purple-500/30 transition-colors"
                          title="Download PDF"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          )
        ) : (
          <main className="max-w-6xl mx-auto w-full relative z-10 flex-1 space-y-6">
            {/* Header & Export controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setView('dashboard')}
                  className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 transition-all shrink-0 active:scale-95 cursor-pointer"
                  title="Back to Forms"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate max-w-lg">
                      {activeForm.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30 shrink-0">
                      Live Analytics
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Live responses, data distribution & export center</p>
                </div>
              </div>

              {/* Structured Action Toolbar */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                {forms.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-[#141224] px-2.5 py-1 rounded-xl border border-purple-500/30">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Form:</span>
                    <select
                      value={activeForm.id}
                      onChange={(e) => {
                        const found = forms.find(f => f.id === e.target.value);
                        if (found) setActiveForm(found);
                      }}
                      className="bg-transparent text-purple-200 text-xs font-bold focus:outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      {forms.map(f => (
                        <option key={f.id} value={f.id} className="bg-[#0C0C12] text-white">
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form Management Pill */}
                <div className="flex items-center bg-[#141224] p-1 rounded-xl border border-purple-500/30 shadow-sm">
                  <button
                    onClick={() => handleEditForm(activeForm)}
                    className="px-2.5 sm:px-3 py-1.5 hover:bg-purple-900/50 text-purple-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Edit Form Questions & Banner"
                  >
                    <Edit size={13} /> <span>Edit</span>
                  </button>
                  <button
                    onClick={() => copyShareLink(activeForm.id)}
                    className="px-2.5 sm:px-3 py-1.5 hover:bg-purple-900/50 text-purple-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Copy Form Public Link"
                  >
                    <Copy size={13} /> <span>Share</span>
                  </button>
                  <a
                    href={getPublicFormUrl(activeForm.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Open Form in New Tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Export Data Pill */}
                <div className="flex items-center bg-[#141224] p-1 rounded-xl border border-purple-500/30 shadow-sm">
                  <button
                    onClick={handleDownloadCSV}
                    className="px-2.5 sm:px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white rounded-lg font-bold text-xs border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                    title="Download CSV Spreadsheet"
                  >
                    <Download size={13} /> <span>CSV</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer active:scale-95"
                    title="Download PDF Report"
                  >
                    <FileText size={13} /> <span>PDF Report</span>
                  </button>
                </div>

                {/* Delete Form */}
                {activeForm.id !== OFFICIAL_FEEDBACK_FORM_ID && (
                  <button
                    onClick={() => deleteForm(activeForm.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 transition-all cursor-pointer active:scale-95"
                    title="Delete this form"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
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
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => copyShareLink(activeForm.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Copy size={13} /> Copy Share Link
                </button>
                <a
                  href={getPublicFormUrl(activeForm.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-white/10"
                >
                  <ExternalLink size={13} /> Open & Test Form
                </a>
              </div>
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
                                  className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500"
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
        )
      )}
    </div>
  );
};

export default BForms;
