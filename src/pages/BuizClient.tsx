import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';

interface Question {
  id: number | string;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: number;
}

const BuizClient = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');
  
  const [roomStatus, setRoomStatus] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Listen to room status once joined
  useEffect(() => {
    if (!pin || roomStatus === 'setup') return;
    
    const unsubscribe = onSnapshot(doc(db, "buiz_rooms", pin), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'playing' && roomStatus === 'waiting') {
          // Game just started!
          setQuestions(data.questions || []);
          setRoomStatus('playing');
        } else if (data.status === 'finished') {
          setRoomStatus('finished');
        }
      } else {
        alert("Room was closed by host.");
        setRoomStatus('setup');
      }
    });

    return () => unsubscribe();
  }, [pin, roomStatus]);

  // Timer logic for playing
  useEffect(() => {
    if (roomStatus !== 'playing' || showFeedback || currentQIndex >= questions.length) return;
    
    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQIndex, roomStatus, showFeedback, questions.length]);

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !name) return;
    
    try {
      const roomRef = doc(db, "buiz_rooms", pin);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        alert("Invalid PIN. Room not found.");
        return;
      }
      
      if (roomSnap.data().status !== 'waiting') {
        alert("Game has already started or finished!");
        return;
      }
      
      const newPlayerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, `buiz_rooms/${pin}/players`, newPlayerId), {
        name,
        score: 0,
        streak: 0,
        progress: 0,
        joinedAt: new Date()
      });
      
      setPlayerId(newPlayerId);
      setRoomStatus('waiting');
    } catch (err) {
      console.error(err);
      alert("Failed to join. Check your internet connection.");
    }
  };

  const updatePlayerScore = async (newScore: number, newStreak: number, progress: number) => {
    try {
      await updateDoc(doc(db, `buiz_rooms/${pin}/players`, playerId), {
        score: newScore,
        streak: newStreak,
        progress: progress
      });
    } catch (err) {
      console.error("Failed to sync score", err);
    }
  };

  const handleTimeUp = () => {
    handleAnswer(-1); // -1 means missed
  };

  const handleAnswer = (selectedIdx: number) => {
    if (showFeedback) return;
    setSelectedOption(selectedIdx);
    
    const q = questions[currentQIndex];
    const isCorrect = selectedIdx === q.answer;
    
    let newScore = score;
    let newStreak = streak;
    
    if (isCorrect) {
      setShowFeedback('correct');
      // Base points 1000, max time bonus 1000 based on timeLeft/20, streak multiplier
      const timeBonus = Math.floor((timeLeft / 20) * 1000);
      newStreak += 1;
      const streakBonus = newStreak > 2 ? (newStreak * 100) : 0;
      const earned = 1000 + timeBonus + streakBonus;
      newScore += earned;
    } else {
      setShowFeedback('incorrect');
      newStreak = 0;
    }
    
    setScore(newScore);
    setStreak(newStreak);
    
    const progress = (currentQIndex + 1) / 10; // assuming 10 questions
    updatePlayerScore(newScore, newStreak, progress);
    
    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(null);
      setSelectedOption(null);
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        setRoomStatus('finished');
      }
    }, 2000);
  };

  if (roomStatus === 'setup') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-md w-full relative z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Buiz</h1>
            <p className="text-zinc-400">Enter game PIN to join the arena</p>
          </div>
          
          <form onSubmit={joinRoom} className="space-y-4">
            <input 
              type="text" 
              placeholder="Game PIN" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-2xl font-bold text-center text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all uppercase tracking-widest"
              required
              maxLength={6}
            />
            <input 
              type="text" 
              placeholder="Your Nickname" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg font-bold text-center text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
              required
              maxLength={15}
            />
            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-white text-black hover:bg-purple-100 rounded-2xl font-black text-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Enter Game
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (roomStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 bg-purple-600/20 border-2 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" />
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">You're in, {name}!</h2>
          <p className="text-zinc-400 text-lg">See your nickname on screen?</p>
          
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl py-4 px-8 inline-block">
            <p className="text-white/50 font-bold uppercase tracking-widest text-sm mb-1 animate-pulse">Waiting for host to start</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (roomStatus === 'finished') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center relative z-10"
        >
          <Trophy className="text-yellow-400 mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-black text-white mb-2">Game Over!</h2>
          <p className="text-zinc-400 mb-8">Look at the host screen for the final podium.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Your Final Score</p>
            <p className="text-5xl font-black text-yellow-400 font-mono">{score.toLocaleString()}</p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Playing State
  const q = questions[currentQIndex];
  if (!q) return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono">Loading question data...</div>;

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col relative overflow-hidden">
      {/* Dynamic Background based on feedback */}
      <AnimatePresence>
        {showFeedback === 'correct' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-green-500/20 z-0 pointer-events-none" />
        )}
        {showFeedback === 'incorrect' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-500/20 z-0 pointer-events-none" />
        )}
      </AnimatePresence>
      
      {/* Top HUD */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white font-bold text-sm">{currentQIndex + 1} / {questions.length}</span>
          </div>
          {streak >= 3 && (
            <motion.div 
              initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              className="bg-orange-500/20 border border-orange-500/50 text-orange-400 px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              <Zap size={16} fill="currentColor" /> {streak} Streak!
            </motion.div>
          )}
        </div>
        
        <div className="bg-black/50 backdrop-blur-md border border-white/10 px-6 py-2 rounded-xl flex items-center gap-4">
          <div>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest text-right">Score</p>
            <p className="text-xl font-black text-white font-mono leading-none">{score.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar Timer */}
      <div className="w-full h-2 bg-white/5 relative z-10">
        <motion.div 
          className={`h-full ${timeLeft > 10 ? 'bg-purple-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 20) * 100}%` }}
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full relative z-10 mt-8">
        
        <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 mb-8 shadow-2xl text-center relative">
          {showFeedback && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded-full p-2"
            >
              {showFeedback === 'correct' ? <CheckCircle2 size={40} className="text-green-500" /> : <XCircle size={40} className="text-red-500" />}
            </motion.div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mt-4">{q.question}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {q.options.map((opt, idx) => {
            
            // Determine button colors based on state
            let bgClass = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
            
            if (showFeedback) {
              if (idx === q.answer) {
                bgClass = "bg-green-500 text-white border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]";
              } else if (idx === selectedOption) {
                bgClass = "bg-red-500 text-white border-red-400";
              } else {
                bgClass = "bg-white/5 border-white/10 text-white/30 opacity-50";
              }
            }

            // A Quizizz style distinct color per option if no feedback
            if (!showFeedback) {
              bgClass = idx === 0 ? "bg-blue-600 hover:bg-blue-500 border-blue-400" :
                        idx === 1 ? "bg-red-600 hover:bg-red-500 border-red-400" :
                        idx === 2 ? "bg-yellow-600 hover:bg-yellow-500 border-yellow-400" :
                        "bg-green-600 hover:bg-green-500 border-green-400";
            }

            return (
              <button
                key={idx}
                disabled={!!showFeedback}
                onClick={() => handleAnswer(idx)}
                className={`p-6 rounded-2xl border-b-4 font-bold text-lg md:text-xl transition-all active:translate-y-1 active:border-b-0 flex items-center justify-center text-center ${bgClass} disabled:transform-none disabled:cursor-not-allowed`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuizClient;
