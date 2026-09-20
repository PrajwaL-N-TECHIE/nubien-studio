import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertCircle, Star, Sparkles, Send,
  ArrowRight, ShieldCheck, RefreshCw, User, Mail, HelpCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment
} from 'firebase/firestore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { BForm, BFormQuestion } from '@/utils/bformReports';
import { OFFICIAL_FEEDBACK_FORM, OFFICIAL_FEEDBACK_FORM_ID, DEFAULT_BANNER_IMAGE } from './BForms';

const BFormView = () => {
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<BForm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Respondent answers: { [questionId: string]: any }
  const [answers, setAnswers] = useState<{ [qId: string]: any }>({});
  const [respondentName, setRespondentName] = useState<string>('');
  const [respondentEmail, setRespondentEmail] = useState<string>('');

  // Validation state: list of invalid question IDs
  const [invalidQuestions, setInvalidQuestions] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // References for scrolling to invalid questions
  const questionRefs = useRef<{ [qId: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!id) {
      setError('Invalid Form Link');
      setLoading(false);
      return;
    }

    const fetchForm = async () => {
      try {
        const docRef = doc(db, 'buiz_rooms', '_bforms_', 'forms', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // If accessing the official feedback form and not yet created in Firestore, load default
          if (id === OFFICIAL_FEEDBACK_FORM_ID) {
            setForm(OFFICIAL_FEEDBACK_FORM);
            setLoading(false);
            return;
          }
          setError('Form Not Found. This form may have been deleted or the link is invalid.');
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setForm({
          id: docSnap.id,
          title: data.title || 'Untitled Feedback Form',
          description: data.description || '',
          coverImage: data.coverImage || '',
          questions: data.questions || [],
          status: data.status || 'active'
        });
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching form:', err);
        if (id === OFFICIAL_FEEDBACK_FORM_ID) {
          setForm(OFFICIAL_FEEDBACK_FORM);
          setLoading(false);
          return;
        }
        setError('Failed to load form. Please check your internet connection.');
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  // Handle answers update
  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
    // Clear validation error for this question if answered
    if (invalidQuestions.has(qId)) {
      setInvalidQuestions(prev => {
        const next = new Set(prev);
        next.delete(qId);
        return next;
      });
    }
  };

  // Toggle checkbox array
  const handleCheckboxToggle = (qId: string, option: string) => {
    const currentList: string[] = Array.isArray(answers[qId]) ? [...answers[qId]] : [];
    const index = currentList.indexOf(option);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(option);
    }
    handleAnswerChange(qId, currentList);
  };

  // Submit form with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const unfulfilled = new Set<string>();

    form.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          unfulfilled.add(q.id);
        }
      }
    });

    if (unfulfilled.size > 0) {
      setInvalidQuestions(unfulfilled);
      toast.error('Please answer all required questions highlighted in red!');

      // Scroll smoothly to the first unanswered question
      const firstInvalidId = Array.from(unfulfilled)[0];
      const targetElement = questionRefs.current[firstInvalidId];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      // 1. Record response in Firestore
      await addDoc(collection(db, 'buiz_rooms', '_bforms_responses_', 'responses'), {
        formId: form.id,
        submittedAt: serverTimestamp(),
        answers: answers,
        respondentName: respondentName.trim() || 'Anonymous',
        respondentEmail: respondentEmail.trim() || ''
      });

      // 2. Increment response counter in parent form
      try {
        await updateDoc(doc(db, 'buiz_rooms', '_bforms_', 'forms', form.id), {
          responseCount: increment(1)
        });
      } catch (countErr) {
        console.warn('Could not increment response counter:', countErr);
      }

      // 3. Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#eab308', '#22c55e']
      });

      setSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Failed to submit response. Please try again.');
      setSubmitting(false);
    }
  };

  // Reset form to submit again
  const handleReset = () => {
    setAnswers({});
    setRespondentName('');
    setRespondentEmail('');
    setInvalidQuestions(new Set());
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4">
        <RefreshCw className="animate-spin text-purple-500 mb-4" size={36} />
        <p className="text-white font-bold text-lg">Loading B-Form...</p>
        <p className="text-zinc-500 text-xs mt-1">Connecting to Buildicy cloud...</p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------------------------------
  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#0C0C12] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Form Unavailable</h2>
          <p className="text-zinc-400 text-sm mb-6">{error || 'Unable to open form.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all"
          >
            Visit Buildicy Home <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SUBMITTED SUCCESS STATE
  // --------------------------------------------------------------------------
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0C0C12]/90 border border-purple-500/40 rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center backdrop-blur-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6 text-green-400 shadow-inner">
            <CheckCircle2 size={40} />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Response Recorded!</h2>
          <p className="text-purple-300 font-medium text-sm mb-4">
            Thank you for sharing your feedback on <span className="font-bold text-white">"{form.title}"</span>.
          </p>
          <p className="text-zinc-400 text-xs mb-8">
            Your answers have been safely received and stored in our database. We appreciate your time!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold transition-all"
            >
              Submit Another Response
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              Back to Buildicy <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: RESPONDENT FORM VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center py-8 px-4 sm:px-6 relative">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        {/* Dynamic Cover Image Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl bg-[#0C0C12]/90 flex items-center justify-center transition-all duration-300">
          <img
            src={form.coverImage || DEFAULT_BANNER_IMAGE}
            alt={form.title}
            className="w-full h-auto max-h-[480px] object-contain rounded-3xl block transition-all"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C12]/60 via-transparent to-transparent pointer-events-none rounded-3xl" />
        </div>

        {/* Form Title & Description Card */}
        <div className="bg-[#0C0C12]/90 border-t-4 border-t-purple-600 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-purple-400" /> B-Forms by Buildicy
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {form.questions.length} Questions
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {form.title}
          </h1>

          {form.description && (
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {form.description}
            </p>
          )}

          <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-red-400 font-semibold">
            <span>* Indicates required question</span>
          </div>
        </div>

        {/* Optional Respondent Details Card */}
        <div className="bg-[#0C0C12]/80 border border-purple-500/25 rounded-2xl p-5 backdrop-blur-xl shadow-md space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <User size={13} className="text-purple-400" /> Your Information (Optional)
          </h3>
          <p className="text-[11px] text-zinc-400">
            You can provide your details or submit completely anonymously.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className="w-full bg-[#141224] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your Email (Optional)"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              className="w-full bg-[#141224] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Questions List */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.questions.map((q, idx) => {
            const isInvalid = invalidQuestions.has(q.id);

            return (
              <div
                key={q.id}
                ref={(el) => { questionRefs.current[q.id] = el; }}
                className={`bg-[#0C0C12]/90 border rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all shadow-md space-y-4 ${
                  isInvalid
                    ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : 'border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                {/* Question Title */}
                <div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h2 className="text-base font-bold text-white leading-snug">
                      {q.title}
                      {q.required && <span className="text-red-400 font-bold ml-1.5">*</span>}
                    </h2>
                  </div>
                  {isInvalid && (
                    <p className="text-red-400 text-xs font-semibold mt-1.5 flex items-center gap-1 pl-8">
                      <AlertCircle size={13} /> This question is required
                    </p>
                  )}
                </div>

                {/* Input Controls based on Question Type */}
                <div className="pt-1">
                  {/* Short Text */}
                  {q.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder="Your answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full bg-[#141224] border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                    />
                  )}

                  {/* Paragraph */}
                  {q.type === 'paragraph' && (
                    <textarea
                      rows={4}
                      placeholder="Type your detailed thoughts here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full bg-[#141224] border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all resize-y"
                    />
                  )}

                  {/* Radio Options */}
                  {q.type === 'radio' && q.options && (
                    <div className="space-y-2.5">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <label
                            key={opt}
                            onClick={() => handleAnswerChange(q.id, opt)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                                : 'bg-[#141224]/50 border-white/10 hover:bg-[#141224] text-zinc-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-purple-500 bg-purple-600' : 'border-zinc-600'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Checkbox Options */}
                  {q.type === 'checkbox' && q.options && (
                    <div className="space-y-2.5">
                      {q.options.map((opt) => {
                        const selectedList: string[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                        const isChecked = selectedList.includes(opt);

                        return (
                          <label
                            key={opt}
                            onClick={() => handleCheckboxToggle(q.id, opt)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                                : 'bg-[#141224]/50 border-white/10 hover:bg-[#141224] text-zinc-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? 'border-purple-500 bg-purple-600 text-white' : 'border-zinc-600'
                            }`}>
                              {isChecked && <CheckCircle2 size={14} />}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Star Rating */}
                  {q.type === 'rating' && (
                    <div className="p-3 bg-[#141224]/70 rounded-xl border border-purple-500/20 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const currentVal = Number(answers[q.id] || 0);
                          const isFilled = star <= currentVal;

                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, star)}
                              className="p-1 text-yellow-400 hover:scale-125 transition-transform active:scale-95 focus:outline-none"
                              title={`Rate ${star} of 5`}
                            >
                              <Star
                                size={32}
                                fill={isFilled ? 'currentColor' : 'none'}
                                className={isFilled ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-500'}
                              />
                            </button>
                          );
                        })}
                      </div>
                      {answers[q.id] && (
                        <span className="text-xs font-mono font-bold text-yellow-300 bg-yellow-500/20 border border-yellow-500/40 px-2.5 py-1 rounded-full">
                          {answers[q.id]} / 5 Stars
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Submit Action Bar */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-2xl font-black text-base shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 tracking-wide cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Submitting Feedback...
                </>
              ) : (
                <>
                  Submit Feedback <Send size={18} />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-3 pb-8 space-y-2">
            <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-purple-400" /> Never submit passwords or confidential banking info through this form.
            </p>
            <p className="text-[11px] text-zinc-500">
              Powered by <span className="text-purple-400 font-bold">B-Forms</span> • <a href="https://bforms.buildicy.com/bforms-feedback" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white underline decoration-purple-500/40 font-medium transition-colors">Give B-Form Feedback</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BFormView;
