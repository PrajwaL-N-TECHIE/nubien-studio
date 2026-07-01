import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Trophy, Copy, CheckCircle2, Target, StopCircle, Plus, Lock, Trash2, Save, Eye, EyeOff, Zap, Clock, Grid3X3 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { QUESTIONS } from '@/data/questions';

interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  difficulty: string;
  topic: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  progress: number;
  avatar?: string;
  currentQIndex?: number;
  answers?: { [questionIdx: string]: { selectedOption: number; isCorrect: boolean; timeLeft: number } };
}

const BuizHost = () => {
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'login' | 'setup' | 'configure' | 'waiting' | 'playing' | 'finished'>('login');
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);

  // Host Paced Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<'answering' | 'revealed'>('answering');
  const [roomQuestions, setRoomQuestions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Host config state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number | string>>(new Set());
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [podiumPhase, setPodiumPhase] = useState<0 | 1 | 2 | 3>(0); // 0=none, 1=3rd, 2=2nd, 3=1st
  const [gameMode, setGameMode] = useState<'hostPaced' | 'ownPace'>('hostPaced');

  // Custom Q Form State
  const [cqText, setCqText] = useState('');
  const [cqOptions, setCqOptions] = useState(['', '', '', '']);
  const [cqAnswer, setCqAnswer] = useState(0);

  // Saved Quizzes & History State
  const [quizName, setQuizName] = useState('');
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [setupTab, setSetupTab] = useState<'saved' | 'history'>('saved');

  useEffect(() => {
    if (!pin) return;

    // Listen to players joining
    const unsubscribe = onSnapshot(collection(db, `buiz_rooms/${pin}/players`), (snapshot) => {
      const playersData: Player[] = [];
      snapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      // Sort by score for leaderboard
      playersData.sort((a, b) => b.score - a.score);
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, [pin]);

  // 1. Host Timer Logic (Max 20s per question)
  useEffect(() => {
    if (status === 'playing' && questionStatus === 'answering') {
      setTimeLeft(20);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time's up! Force reveal
            setQuestionStatus('revealed');
            if (pin) updateDoc(doc(db, "buiz_rooms", pin), { questionStatus: 'revealed' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, questionStatus, pin]);

  // 2. Dynamic Skip (If all players answered early)
  useEffect(() => {
    if (status === 'playing' && questionStatus === 'answering' && players.length > 0 && roomQuestions.length > 0) {
      const targetProgress = (currentQIndex + 1) / roomQuestions.length;
      // Use a small epsilon for float comparison just in case, though they should be exact
      const answeredCount = players.filter(p => (p.progress || 0) >= targetProgress - 0.001).length;
      
      if (answeredCount === players.length) {
        // Everyone has answered! Skip the timer and reveal
        setQuestionStatus('revealed');
        if (pin) updateDoc(doc(db, "buiz_rooms", pin), { questionStatus: 'revealed' });
      }
    }
  }, [players, status, questionStatus, currentQIndex, roomQuestions.length, pin]);

  // 3. Auto-Advance to Next Question
  useEffect(() => {
    if (status === 'playing' && questionStatus === 'revealed') {
      const timer = setTimeout(() => {
        if (currentQIndex + 1 < roomQuestions.length) {
          setCurrentQIndex(prev => prev + 1);
          setQuestionStatus('answering');
          if (pin) updateDoc(doc(db, "buiz_rooms", pin), {
            currentQIndex: currentQIndex + 1,
            questionStatus: 'answering'
          });
        } else {
          endGame();
        }
      }, 5000); // 5 seconds to view answers/leaderboard
      return () => clearTimeout(timer);
    }
  }, [questionStatus, status, currentQIndex, roomQuestions.length, pin]);

  useEffect(() => {
    if (status === 'setup') {
      const fetchQuizzes = async () => {
        try {
          const snap = await getDocs(collection(db, 'buiz_saved_quizzes'));
          const quizzes: any[] = [];
          snap.forEach(doc => quizzes.push({ id: doc.id, ...doc.data() }));
          setSavedQuizzes(quizzes);

          const histSnap = await getDocs(collection(db, 'buiz_history'));
          const history: any[] = [];
          histSnap.forEach(doc => history.push({ id: doc.id, ...doc.data() }));
          // sort by date descending
          history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setQuizHistory(history);
        } catch (err) {
          console.error("Failed to fetch saved quizzes", err);
        }
      };
      fetchQuizzes();
    }
  }, [status]);

  const generateRoom = async () => {
    if (selectedQuestions.size === 0 && customQuestions.length === 0) {
      alert("Please select or create at least one question!");
      return;
    }

    // Generate a random 6 digit pin
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const selectedQs = QUESTIONS.filter(q => selectedQuestions.has(q.id));
      const finalPayload = [...selectedQs, ...customQuestions];

      await setDoc(doc(db, "buiz_rooms", newPin), {
        pin: newPin,
        status: 'waiting',
        hostId: 'admin',
        questions: finalPayload,
        currentQIndex: 0,
        questionStatus: 'answering',
        gameMode: gameMode,
        createdAt: new Date()
      });

      setRoomQuestions(finalPayload);
      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Make sure you updated your Firebase Rules to allow writing to buiz_rooms!");
    }
  };

  const saveQuiz = async () => {
    if (!quizName.trim()) {
      alert("Please enter a name for this quiz session!");
      return;
    }
    if (selectedQuestions.size === 0 && customQuestions.length === 0) {
      alert("Please select or create at least one question!");
      return;
    }

    try {
      const selectedQs = QUESTIONS.filter(q => selectedQuestions.has(q.id));
      const finalPayload = [...selectedQs, ...customQuestions];

      await addDoc(collection(db, "buiz_saved_quizzes"), {
        name: quizName,
        questions: finalPayload,
        createdAt: new Date().toISOString()
      });

      alert("Quiz saved successfully!");
      setStatus('setup');
      setQuizName('');
      setSelectedQuestions(new Set());
      setCustomQuestions([]);
    } catch (err) {
      console.error("Failed to save quiz", err);
      alert("Failed to save. Check your Firebase permissions.");
    }
  };

  const deleteSavedQuiz = async (quizId: string) => {
    try {
      await deleteDoc(doc(db, "buiz_saved_quizzes", quizId));
      setSavedQuizzes(savedQuizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }
  };

  const deleteQuizHistory = async (historyId: string) => {
    try {
      await deleteDoc(doc(db, "buiz_history", historyId));
      setQuizHistory(quizHistory.filter(h => h.id !== historyId));
    } catch (err) {
      console.error("Failed to delete history", err);
    }
  };

  const launchSavedQuiz = async (quiz: any) => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await setDoc(doc(db, "buiz_rooms", newPin), {
        pin: newPin,
        status: 'waiting',
        hostId: 'admin',
        questions: quiz.questions,
        currentQIndex: 0,
        questionStatus: 'answering',
        gameMode: 'hostPaced',
        createdAt: new Date()
      });

      setRoomQuestions(quiz.questions);
      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room from saved quiz", err);
      alert("Failed to launch. Check your Firebase permissions.");
    }
  };

  const handleQuickPick = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    const selectedIds = new Set(shuffled.slice(0, 10).map(q => q.id));
    setSelectedQuestions(selectedIds);
  };

  const toggleQuestion = (id: number | string) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestions(newSet);
  };

  const addCustomQuestion = () => {
    if (!cqText.trim() || cqOptions.some(opt => !opt.trim())) {
      alert("Please fill out the question and all 4 options.");
      return;
    }
    const newQ: CustomQuestion = {
      id: `custom_${Date.now()}`,
      question: cqText,
      options: [...cqOptions],
      answer: cqAnswer,
      difficulty: 'Medium',
      topic: 'Custom'
    };
    setCustomQuestions([...customQuestions, newQ]);
    setCqText('');
    setCqOptions(['', '', '', '']);
    setCqAnswer(0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('setup');
      setLoginError('');
    } catch (err) {
      setLoginError('Invalid secure credentials');
    }
  };

  const startGame = async () => {
    if (!pin) return;
    setCurrentQIndex(0);
    setQuestionStatus('answering');
    if (gameMode === 'ownPace') {
      await updateDoc(doc(db, "buiz_rooms", pin), {
        status: 'playing',
        startedAt: new Date()
      });
    } else {
      await updateDoc(doc(db, "buiz_rooms", pin), {
        status: 'playing',
        currentQIndex: 0,
        questionStatus: 'answering',
        startedAt: new Date()
      });
    }
    setStatus('playing');
  };

  // handleNextState removed since it's fully automatic now

  const endGame = async () => {
    if (!pin) return;
    await updateDoc(doc(db, "buiz_rooms", pin), {
      status: 'finished'
    });
    setStatus('finished');

    // Start dramatic podium sequence
    setTimeout(() => setPodiumPhase(1), 1000);
    setTimeout(() => setPodiumPhase(2), 4000);
    setTimeout(() => setPodiumPhase(3), 8000);
    
    // Save to history
    try {
      const top3 = players.slice(0, 3).map(p => ({ name: p.name, score: p.score }));
      await addDoc(collection(db, "buiz_history"), {
        quizName: quizName || 'Quick Session',
        date: new Date().toISOString(),
        winners: top3,
        totalPlayers: players.length
      });
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'login') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
        >
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <Lock className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 text-center">Host Login</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Secure access to the Buiz Arena Host Panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-4 mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (status === 'setup') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.1)]"
        >
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 shrink-0">
              <Target className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Host Buiz Arena</h1>
              <p className="text-zinc-400 text-sm">Create a live multiplayer session or launch a saved quiz.</p>
            </div>
          </div>

          <button
            onClick={() => setStatus('configure')}
            className="w-full py-4 mb-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3"
          >
            <Plus size={24} /> Create New Quiz Session
          </button>

          <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
            <button 
              onClick={() => setSetupTab('saved')} 
              className={`text-lg font-bold pb-2 transition-colors border-b-2 ${setupTab === 'saved' ? 'text-white border-purple-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Saved Quizzes
            </button>
            <button 
              onClick={() => setSetupTab('history')} 
              className={`text-lg font-bold pb-2 transition-colors border-b-2 ${setupTab === 'history' ? 'text-white border-purple-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Quiz History
            </button>
          </div>

          <div>
            {setupTab === 'saved' ? (
              savedQuizzes.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 border border-white/5 rounded-xl bg-white/[0.02]">No saved quizzes yet. Create one above!</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {savedQuizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <h3 className="font-bold text-white text-lg">{quiz.name}</h3>
                        <p className="text-xs text-zinc-400 font-mono mt-1">{quiz.questions?.length || 0} Questions • {new Date(quiz.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => launchSavedQuiz(quiz)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold transition-colors text-sm flex items-center gap-2"
                        >
                          <Play fill="currentColor" size={14} /> Launch
                        </button>
                        <button
                          onClick={() => deleteSavedQuiz(quiz.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              quizHistory.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 border border-white/5 rounded-xl bg-white/[0.02]">No quiz history found.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {quizHistory.map(hist => (
                    <div key={hist.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">{hist.quizName}</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-zinc-400 font-mono">{new Date(hist.date).toLocaleString()}</p>
                          <button
                            onClick={() => deleteQuizHistory(hist.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Delete History"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {hist.winners && hist.winners.map((w: any, idx: number) => (
                          <div key={idx} className="bg-black/30 border border-white/10 px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
                            <span className={idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : 'text-orange-400'}>
                              #{idx + 1}
                            </span>
                            <span className="text-white font-bold">{w.name}</span>
                            <span className="text-purple-400 font-mono">{w.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'configure') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Quiz Session Name (e.g. Friday Code Battle)"
                value={quizName}
                onChange={e => setQuizName(e.target.value)}
                className="w-full bg-transparent border-none text-3xl font-black text-white placeholder-zinc-600 focus:outline-none"
              />
              <p className="text-zinc-400 mt-2 text-sm">{selectedQuestions.size} from Bank, {customQuestions.length} Custom</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-[#1A1A24] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setGameMode('hostPaced')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${gameMode === 'hostPaced' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Clock size={14} /> Host Paced
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('ownPace')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${gameMode === 'ownPace' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Zap size={14} /> Own Pace
                </button>
              </div>
              <button onClick={handleQuickPick} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm border border-white/10">
                Quick Pick 10
              </button>
              <button
                onClick={saveQuiz}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 border border-white/10"
              >
                <Save size={16} /> Save For Later
              </button>
              <button
                onClick={generateRoom}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                Launch Now <Target size={16} />
                when               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-6 h-[60vh]">

            {/* Custom Question Builder */}
            <div className="p-6 bg-purple-900/10 border border-purple-500/30 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={18} /> Create Custom Question</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your question..."
                  value={cqText}
                  onChange={e => setCqText(e.target.value)}
                  className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                />
                <div className="grid grid-cols-2 gap-4">
                  {cqOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={cqAnswer === idx}
                        onChange={() => setCqAnswer(idx)}
                        className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-600"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...cqOptions];
                          newOpts[idx] = e.target.value;
                          setCqOptions(newOpts);
                        }}
                        className={`w-full bg-[#1A1A24]/50 border rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${cqAnswer === idx ? 'border-green-500/50' : 'border-white/10'}`}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCustomQuestion}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm border border-white/10"
                >
                  Add to Arena
                </button>
              </div>

              {customQuestions.length > 0 && (
                <div className="mt-6 space-y-2 border-t border-purple-500/20 pt-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Added Custom Questions</p>
                  {customQuestions.map(q => (
                    <div key={q.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <p className="text-white text-sm font-medium truncate">{q.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6">
              <h2 className="text-lg font-bold text-white mb-4">Select from Question Bank</h2>
              {QUESTIONS.length === 0 ? (
                <p className="text-white/40 text-sm italic">Loading questions or The Crucible is empty...</p>
              ) : (
                <div className="space-y-2">
                  {QUESTIONS.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${selectedQuestions.has(q.id) ? 'bg-purple-600/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${selectedQuestions.has(q.id) ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-500 text-transparent'}`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">{q.topic}</span>
                        </div>
                        <p className="text-white font-medium">{q.question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished State - Dramatic Podium
  if (status === 'finished') {
    const top3 = players.slice(0, 3);

    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {podiumPhase === 3 && <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/01/29/13/03/confetti-3116032_1280.png')] opacity-30 animate-pulse mix-blend-screen pointer-events-none z-20" />}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-yellow-500/10 rounded-full blur-[200px] pointer-events-none" />

        <h1 className="text-5xl font-black text-white mb-20 relative z-30 uppercase tracking-[0.2em]">Final Results</h1>

        <div className="flex items-end justify-center gap-4 md:gap-8 h-96 relative z-30">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-32 md:w-48">
            <AnimatePresence>
              {podiumPhase >= 2 && top3[1] && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                  <p className="text-xl font-bold text-white">{top3[1].name}</p>
                  <p className="text-sm text-zinc-400 font-mono">{top3[1].score}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: podiumPhase >= 2 ? 160 : 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="w-full bg-gradient-to-t from-zinc-800 to-zinc-400/50 rounded-t-lg flex items-start justify-center pt-4 border-t-2 border-zinc-400 shadow-[0_0_30px_rgba(161,161,170,0.2)]"
            >
              {podiumPhase >= 2 && <span className="text-3xl font-black text-zinc-300">2</span>}
            </motion.div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-40 md:w-56 z-10">
            <AnimatePresence>
              {podiumPhase >= 3 && top3[0] && (
                <motion.div initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="text-center mb-4">
                  <Trophy className="text-yellow-400 mx-auto mb-2" size={40} />
                  <p className="text-3xl font-black text-yellow-400">{top3[0].name}</p>
                  <p className="text-lg text-yellow-500/70 font-mono font-bold">{top3[0].score}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: podiumPhase >= 3 ? 240 : 0 }}
              transition={{ duration: 1, type: "spring", delay: 0.2 }}
              className="w-full bg-gradient-to-t from-yellow-900/50 to-yellow-500/50 rounded-t-lg flex items-start justify-center pt-4 border-t-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              {podiumPhase >= 3 && <span className="text-5xl font-black text-yellow-300 relative z-10 drop-shadow-md">1</span>}
            </motion.div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-32 md:w-48">
            <AnimatePresence>
              {podiumPhase >= 1 && top3[2] && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                  <p className="text-lg font-bold text-white">{top3[2].name}</p>
                  <p className="text-sm text-zinc-400 font-mono">{top3[2].score}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: podiumPhase >= 1 ? 120 : 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="w-full bg-gradient-to-t from-orange-900/50 to-orange-500/30 rounded-t-lg flex items-start justify-center pt-4 border-t-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
            >
              {podiumPhase >= 1 && <span className="text-2xl font-black text-orange-400">3</span>}
            </motion.div>
          </div>
        </div>

        {podiumPhase >= 3 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            onClick={() => window.location.reload()}
            className="mt-20 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all relative z-30 backdrop-blur-md"
          >
            Start New Game
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col relative overflow-hidden p-6 md:p-12">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl">
              <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-1">Game PIN</p>
              <div className="text-5xl font-black text-white tracking-widest flex items-center gap-4">
                {pin}
                <button onClick={copyPin} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  {copied ? <CheckCircle2 className="text-green-400" size={28} /> : <Copy className="text-white/40 hover:text-white" size={28} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">Status</p>
              <p className="text-2xl font-bold text-white capitalize">{status === 'waiting' ? 'Waiting for players...' : status === 'playing' ? 'Game in progress!' : 'Game Over'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-6 border-r border-white/10">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Players</p>
              <p className="text-3xl font-black text-white flex items-center gap-2 justify-center"><Users size={24} className="text-purple-400" /> {players.length}</p>
            </div>

            {status === 'waiting' && (
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                <Play fill="currentColor" size={20} /> START NOW
              </button>
            )}

            {status === 'playing' && (
              <button
                onClick={endGame}
                className="px-8 py-4 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
              >
                <StopCircle size={20} /> Force End
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stage */}
          <div className="lg:col-span-2 bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-yellow-500" size={28} />
              <h2 className="text-2xl font-black text-white">{status === 'waiting' ? 'Lobby' : 'Live Leaderboard'}</h2>
            </div>

            {players.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Users className="text-white/10 mb-4" size={64} />
                <p className="text-zinc-500 text-xl font-medium">Waiting for players to join via PIN...</p>
                <p className="text-zinc-600 mt-2">Go to /buiz to join</p>
              </div>
            ) : status === 'waiting' ? (
              <div className="flex-1 flex flex-wrap gap-4 items-start content-start">
                <AnimatePresence>
                  {players.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      {p.avatar && <img src={p.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-black/20" />}
                      <span className="text-white font-bold text-sm">{p.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : gameMode === 'ownPace' ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Grid3X3 size={20} className="text-purple-400" />
                    <span className="text-white font-bold">Progress Matrix</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400 font-bold">{players.filter(p => {
                      const answered = Object.keys(p.answers || {}).length;
                      return answered >= roomQuestions.length;
                    }).length} / {players.length} done</span>
                    <span className="text-zinc-400">
                      Avg completion: {players.length > 0 ? Math.round(players.reduce((sum, p) => sum + (Object.keys(p.answers || {}).length), 0) / players.length / roomQuestions.length * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 pr-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Player</th>
                        <th className="text-left py-2 pr-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Score</th>
                        {roomQuestions.map((_, qi) => (
                          <th key={qi} className="text-center py-2 px-1.5 text-zinc-500 font-bold uppercase tracking-widest text-[10px] w-8">Q{qi + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...players].sort((a, b) => b.score - a.score).map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2.5 pr-4 text-white font-bold flex items-center gap-2">
                            {p.avatar && <img src={p.avatar} className="w-5 h-5 rounded-full" alt="" />}
                            {p.name}
                          </td>
                          <td className="py-2.5 pr-4 text-purple-400 font-mono font-bold">{p.score.toLocaleString()}</td>
                          {roomQuestions.map((q, qi) => {
                            const answer = p.answers?.[qi];
                            let cellClass = "bg-white/5 text-zinc-600";
                            let cellText = "\u2014";
                            if (answer) {
                              cellText = String.fromCharCode(65 + answer.selectedOption);
                              cellClass = answer.isCorrect ? "bg-green-500/20 text-green-400 font-bold" : "bg-red-500/20 text-red-400 font-bold";
                            }
                            return (
                              <td key={qi} className="text-center py-2.5 px-1.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-[11px] ${cellClass}`}>
                                  {cellText}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Answer Distribution (Current Progress)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roomQuestions.map((q, qi) => {
                      const totalAnswers = players.filter(p => p.answers?.[qi]).length;
                      const correctAnswers = players.filter(p => p.answers?.[qi]?.isCorrect).length;
                      return (
                        <div key={qi} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Q{qi + 1}</p>
                          <p className="text-white font-bold text-sm truncate">{q.question}</p>
                          <p className="text-xs text-zinc-400 mt-1">{totalAnswers} answers &bull; {correctAnswers} correct ({totalAnswers > 0 ? Math.round(correctAnswers / totalAnswers * 100) : 0}%)</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {roomQuestions[currentQIndex] && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <span className="bg-white/10 px-4 py-1.5 rounded-full text-white/70 font-bold text-sm">
                        Question {currentQIndex + 1} of {roomQuestions.length}
                      </span>
                      <div className="flex gap-3 items-center">
                        {questionStatus === 'answering' && (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}>
                            {timeLeft}
                          </div>
                        )}
                        <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${questionStatus === 'answering' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                          {questionStatus === 'answering' ? `Waiting for answers (${players.filter(p => (p.progress || 0) >= (currentQIndex + 1) / roomQuestions.length).length}/${players.length})` : 'Answer Revealed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-8 mb-8 text-center shadow-xl">
                      <h2 className="text-3xl font-black text-white">{roomQuestions[currentQIndex].question}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {roomQuestions[currentQIndex].options.map((opt: string, idx: number) => {
                        const isCorrect = idx === roomQuestions[currentQIndex].answer;
                        let bgClass = "bg-white/5 border-white/10 text-white/50";
                        
                        if (questionStatus === 'revealed') {
                          if (isCorrect) {
                            bgClass = "bg-green-500/20 border-green-500 text-green-400 font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                          } else {
                            bgClass = "bg-white/5 border-white/10 text-white/20 opacity-50";
                          }
                        } else {
                          bgClass = "bg-white/10 border-white/20 text-white";
                        }
                        
                        return (
                          <div key={idx} className={`p-6 rounded-xl border text-xl flex items-center transition-all ${bgClass}`}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black bg-black/20 mr-4 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Top Players</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {players.slice(0, 5).map((p, idx) => (
                          <div key={p.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 shrink-0">
                            <span className="text-zinc-500 font-bold">#{idx + 1}</span>
                            <span className="text-white font-bold">{p.name}</span>
                            <span className="text-purple-400 font-mono font-bold">{p.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6">Game Info</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-purple-300/70 font-bold uppercase tracking-widest mb-2">Instructions</p>
                <ol className="text-sm text-zinc-300 space-y-3 list-decimal list-inside">
                  {gameMode === 'hostPaced' ? (
                    <>
                      <li>Share the PIN with students.</li>
                      <li>Students go to <b>/buiz</b> to join.</li>
                      <li>Wait for all students to appear on the leaderboard.</li>
                      <li>Click <b>START NOW</b>.</li>
                      <li>Students will answer each question in sync with the host timer.</li>
                    </>
                  ) : (
                    <>
                      <li>Share the PIN with students.</li>
                      <li>Students go to <b>/buiz</b> to join.</li>
                      <li>Wait for all students to appear on the leaderboard.</li>
                      <li>Click <b>START NOW</b>.</li>
                      <li>Students answer all questions at their own pace. Watch the progress matrix fill up in real-time!</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="pt-6 border-t border-purple-500/20">
                <p className="text-xs text-purple-300/70 font-bold uppercase tracking-widest mb-2">Current Mode</p>
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <p className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    {gameMode === 'hostPaced' ? <Clock size={14} className="text-purple-400" /> : <Zap size={14} className="text-green-400" />}
                    {gameMode === 'hostPaced' ? 'Host Paced (Kahoot Style)' : 'Own Pace (Async)'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {gameMode === 'hostPaced' 
                      ? 'Host controls the question flow. Students answer in real-time on their devices.'
                      : 'Students answer at their own pace. Host sees live progress in the matrix.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuizHost;
