import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Trophy, Copy, CheckCircle2, Target, StopCircle, Plus, Lock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, getDocs } from 'firebase/firestore';

import { QUESTIONS } from '@/data/questions';

interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  answer: number;
  difficulty: string;
  topic: string;
  imageUrl?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  progress: number;
  avatar?: string;
}

const BuizHost = () => {
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'login' | 'setup' | 'configure' | 'waiting' | 'playing' | 'finished'>('login');
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Host config state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number | string>>(new Set());
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [podiumPhase, setPodiumPhase] = useState<0 | 1 | 2 | 3>(0); // 0=none, 1=3rd, 2=2nd, 3=1st

  // Custom Q Form State
  const [cqText, setCqText] = useState('');
  const [cqImageUrl, setCqImageUrl] = useState('');
  const [cqOptions, setCqOptions] = useState(['', '', '', '']);
  const [cqAnswer, setCqAnswer] = useState(0);

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
        createdAt: new Date()
      });

      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Make sure you updated your Firebase Rules to allow writing to buiz_rooms!");
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
      topic: 'Custom',
      imageUrl: cqImageUrl.trim() || undefined
    };
    setCustomQuestions([...customQuestions, newQ]);
    setCqText('');
    setCqImageUrl('');
    setCqOptions(['', '', '', '']);
    setCqAnswer(0);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@buildicy.com' && password === 'admin@123') {
      setStatus('setup');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const startGame = async () => {
    if (!pin) return;
    await updateDoc(doc(db, "buiz_rooms", pin), {
      status: 'playing',
      startedAt: new Date()
    });
    setStatus('playing');
  };

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
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
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
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-lg w-full text-center relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.1)]"
        >
          <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-purple-500/30">
            <Target className="text-purple-400" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Host Buiz Arena</h1>
          <p className="text-zinc-400 mb-8 text-lg">Create a live multiplayer session. Students will join via a game PIN.</p>

          <button
            onClick={() => setStatus('configure')}
            className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" size={24} /> Configure Game
          </button>
        </motion.div>
      </div>
    );
  }

  if (status === 'configure') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">Configure Arena</h1>
              <p className="text-zinc-400 mt-1">{selectedQuestions.size} from Bank, {customQuestions.length} Custom</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleQuickPick} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm border border-white/10">
                Quick Pick 10
              </button>
              <button
                onClick={generateRoom}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                Launch Arena <Target size={16} />
              </button>
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
                <input
                  type="url"
                  placeholder="Optional: Image URL (e.g. https://example.com/image.png)"
                  value={cqImageUrl}
                  onChange={e => setCqImageUrl(e.target.value)}
                  className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 text-sm"
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
              <h2 className="text-2xl font-black text-white">Live Leaderboard</h2>
            </div>

            {players.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Users className="text-white/10 mb-4" size={64} />
                <p className="text-zinc-500 text-xl font-medium">Waiting for players to join via PIN...</p>
                <p className="text-zinc-600 mt-2">Go to /buiz to join</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-4 flex-1">
                <AnimatePresence>
                  {players.map((p, index) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border ${status !== 'waiting' && index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                          status !== 'waiting' && index === 1 ? 'bg-zinc-300/10 border-zinc-300/30' :
                            status !== 'waiting' && index === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                              'bg-white/5 border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${status !== 'waiting' && index === 0 ? 'bg-yellow-500 text-black' :
                            status !== 'waiting' && index === 1 ? 'bg-zinc-300 text-black' :
                              status !== 'waiting' && index === 2 ? 'bg-orange-500 text-black' :
                                'bg-white/10 text-white/50'
                          }`}>
                          {index + 1}
                        </div>
                        {p.avatar && (
                          <div className="w-12 h-12 bg-white/5 rounded-full p-1 border border-white/10 shrink-0">
                            <img src={p.avatar} alt="Avatar" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-lg ${status !== 'waiting' && index < 3 ? 'text-white' : 'text-zinc-300'}`}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {p.streak >= 3 && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded flex items-center gap-1">
                                🔥 {p.streak} Streak
                              </span>
                            )}
                            <span className="text-xs text-white/40 font-mono">Progress: {Math.round((p.progress || 0) * 10)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-2xl font-mono ${status !== 'waiting' && index === 0 ? 'text-yellow-400' :
                            status !== 'waiting' && index === 1 ? 'text-zinc-300' :
                              status !== 'waiting' && index === 2 ? 'text-orange-400' :
                                'text-white'
                          }`}>
                          {p.score.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/30 uppercase font-bold tracking-widest mt-1">Points</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                  <li>Share the PIN with students.</li>
                  <li>Students go to <b>/buiz</b> to join.</li>
                  <li>Wait for all students to appear on the leaderboard.</li>
                  <li>Click <b>START NOW</b>.</li>
                  <li>Students will answer 10 random questions at their own pace.</li>
                </ol>
              </div>

              <div className="pt-6 border-t border-purple-500/20">
                <p className="text-xs text-purple-300/70 font-bold uppercase tracking-widest mb-2">Current Mode</p>
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <p className="font-bold text-white text-sm mb-1">Player Paced (Quizizz Style)</p>
                  <p className="text-xs text-zinc-500">Students answer on their own devices asynchronously. Faster answers yield higher scores.</p>
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
