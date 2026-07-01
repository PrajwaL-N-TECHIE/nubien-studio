import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Zap, CheckCircle2, XCircle, Grid3X3, ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { playTickSound, playCorrectSound, playIncorrectSound } from '@/utils/audio';
import { toast } from "sonner";

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
  const [questionStatus, setQuestionStatus] = useState<'answering' | 'revealed'>('answering');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | 'waiting' | null>(null);

  // Own-pace mode state
  const [gameMode, setGameMode] = useState<'hostPaced' | 'ownPace'>('hostPaced');
  const [localQIndex, setLocalQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionIdx: number]: { selectedOption: number; isCorrect: boolean } }>({});
  const [ownPaceDone, setOwnPaceDone] = useState(false);

  // Listen to room status once joined
  useEffect(() => {
    if (!pin || roomStatus === 'setup') return;
    
    const unsubscribe = onSnapshot(doc(db, "buiz_rooms", pin), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const mode = data.gameMode || 'hostPaced';
        setGameMode(mode);

        if (data.status === 'playing') {
          if (roomStatus === 'waiting') {
            setQuestions(data.questions || []);
            setRoomStatus('playing');
            if (mode === 'ownPace') {
              // In own-pace mode, restore from player doc if available
              setQuestionStatus('answering');
              setOwnPaceDone(false);
            }
          }
          if (mode === 'hostPaced') {
            // Sync with Host
            if (data.currentQIndex !== undefined && data.currentQIndex !== currentQIndex) {
              setCurrentQIndex(data.currentQIndex);
              setSelectedOption(null);
              setShowFeedback(null);
              setTimeLeft(20);
            }
            if (data.questionStatus !== undefined && data.questionStatus !== questionStatus) {
              setQuestionStatus(data.questionStatus);
              if (data.questionStatus === 'revealed') {
                handleHostReveal();
              }
            }
          }
        } else if (data.status === 'finished') {
          setRoomStatus('finished');
        }
      } else {
        toast.error("Room was closed by host.");
        setRoomStatus('setup');
      }
    });

    return () => unsubscribe();
  }, [pin, roomStatus, currentQIndex, questionStatus]);

  // Timer logic for playing (host-paced only)
  useEffect(() => {
    if (roomStatus !== 'playing' || questionStatus === 'revealed' || currentQIndex >= questions.length || gameMode === 'ownPace') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 6 && prev > 1) {
          playTickSound(); // tick sound for last 5 seconds
        }
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQIndex, roomStatus, questionStatus, questions.length]);

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || !name) return;
    
    try {
      const roomRef = doc(db, "buiz_rooms", pin);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        toast.error("Invalid PIN. Room not found.");
        return;
      }
      
      if (roomSnap.data().status !== 'waiting') {
        toast.error("Game has already started or finished!");
        return;
      }
      
      const newPlayerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}${Math.random()}`;
      
      await setDoc(doc(db, `buiz_rooms/${pin}/players`, newPlayerId), {
        name,
        score: 0,
        streak: 0,
        progress: 0,
        avatar: avatarUrl,
        joinedAt: new Date()
      });
      
      setPlayerId(newPlayerId);
      setRoomStatus('waiting');
    } catch (err) {
      console.error(err);
      toast.error("Failed to join. Check your internet connection.");
    }
  };

  const updatePlayerScore = async (newScore: number, newStreak: number, progress: number, answersData?: { [questionIdx: number]: { selectedOption: number; isCorrect: boolean } }) => {
    try {
      await updateDoc(doc(db, `buiz_rooms/${pin}/players`, playerId), {
        score: newScore,
        streak: newStreak,
        progress: progress,
        ...(answersData ? { answers: answersData } : {})
      });
    } catch (err) {
      console.error("Failed to sync score", err);
    }
  };

  const handleAnswer = (selectedIdx: number) => {
    if (questionStatus === 'revealed' || selectedOption !== null) return;
    
    if (gameMode === 'ownPace') {
      const currentIdx = localQIndex;
      const q = questions[currentIdx];
      const isCorrect = selectedIdx === q?.answer;
      
      // Calculate score
      let newScore = score;
      let newStreak = streak;
      
      if (isCorrect) {
        playCorrectSound();
        newStreak += 1;
        const streakBonus = newStreak > 2 ? (newStreak * 100) : 0;
        const earned = 1000 + streakBonus;
        newScore += earned;
      } else {
        playIncorrectSound();
        newStreak = 0;
      }
      
      const newAnswers = { ...answers, [currentIdx]: { selectedOption: selectedIdx, isCorrect } };
      setAnswers(newAnswers);
      setScore(newScore);
      setStreak(newStreak);
      
      const progress = Object.keys(newAnswers).length / questions.length;
      updatePlayerScore(newScore, newStreak, progress, newAnswers);
      
      // Check if all done
      if (Object.keys(newAnswers).length >= questions.length) {
        setOwnPaceDone(true);
      }
    } else {
      // Host-paced: wait for host reveal
      setSelectedOption(selectedIdx);
      setShowFeedback('waiting');
      
      // Optimistically update progress so host sees they answered
      const progress = (currentQIndex + 1) / questions.length;
      updatePlayerScore(score, streak, progress);
    }
  };

  const handleHostReveal = () => {
    // We need fresh state for score, streak, selectedOption, so we use a ref or depend on them in the effect.
    // However, since handleHostReveal is called inside the useEffect which depends on selectedOption, we can access it directly.
    // Wait, the useEffect closure might have stale state. 
    // We will evaluate the score based on the current state variable values when the reveal happens.
  };

  // Own-pace navigation
  const goToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    setLocalQIndex(idx);
    setSelectedOption(answers[idx]?.selectedOption ?? null);
    setShowFeedback(answers[idx] ? (answers[idx].isCorrect ? 'correct' : 'incorrect') : null);
    setQuestionStatus(answers[idx] ? 'revealed' : 'answering');
  };

  // Sync localQIndex to player doc on change
  useEffect(() => {
    if (gameMode === 'ownPace' && roomStatus === 'playing' && playerId) {
      updateDoc(doc(db, `buiz_rooms/${pin}/players`, playerId), { currentQIndex: localQIndex }).catch(() => {});
    }
  }, [localQIndex, gameMode, roomStatus, pin, playerId]);

  // When questionStatus changes to revealed, we evaluate the score
  useEffect(() => {
    if (questionStatus === 'revealed' && roomStatus === 'playing') {
      const q = questions[currentQIndex];
      const isCorrect = selectedOption === q?.answer;
      
      let newScore = score;
      let newStreak = streak;
      
      if (isCorrect) {
        setShowFeedback('correct');
        playCorrectSound();
        const timeBonus = Math.floor((timeLeft / 20) * 1000);
        newStreak += 1;
        const streakBonus = newStreak > 2 ? (newStreak * 100) : 0;
        const earned = 1000 + timeBonus + streakBonus;
        newScore += earned;
      } else {
        setShowFeedback('incorrect');
        playIncorrectSound();
        newStreak = 0;
      }
      
      setScore(newScore);
      setStreak(newStreak);
      
      const progress = (currentQIndex + 1) / questions.length;
      updatePlayerScore(newScore, newStreak, progress);
    }
  }, [questionStatus]);

  // Own-pace completed state
  if (gameMode === 'ownPace' && ownPaceDone && questions.length > 0) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center relative z-10"
        >
          <CheckCircle2 className="text-green-400 mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-black text-white mb-2">All Done!</h2>
          <p className="text-zinc-400 mb-8">You answered all {questions.length} questions.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Your Score</p>
            <p className="text-5xl font-black text-yellow-400 font-mono">{score.toLocaleString()}</p>
            <p className="text-sm text-zinc-500 mt-2">
              {Object.values(answers).filter(a => a.isCorrect).length}/{questions.length} correct
            </p>
          </div>
          
          <p className="text-zinc-500 text-sm">Wait for the host to end the game to see the final podium.</p>
        </motion.div>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/01/29/13/03/confetti-3116032_1280.png')] opacity-30 animate-pulse mix-blend-screen pointer-events-none z-0" />
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
  const displayQIndex = gameMode === 'ownPace' ? localQIndex : currentQIndex;
  const q = questions[displayQIndex];
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
        {showFeedback === 'waiting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-purple-500/10 z-0 pointer-events-none" />
        )}
      </AnimatePresence>
      
      {/* Top HUD */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white font-bold text-sm">{displayQIndex + 1} / {questions.length}</span>
          </div>
          {gameMode === 'ownPace' && (
            <div className="flex items-center gap-1">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === displayQIndex 
                      ? 'bg-purple-500 scale-125' 
                      : answers[idx] 
                        ? (answers[idx].isCorrect ? 'bg-green-500' : 'bg-red-500')
                        : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
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

      {/* Progress Bar Timer (host-paced only) */}
      {gameMode !== 'ownPace' && (
        <div className="w-full h-2 bg-white/5 relative z-10">
          <motion.div 
            className={`h-full ${timeLeft > 10 ? 'bg-purple-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      )}

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full relative z-10 mt-8">
        
        <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 mb-8 shadow-2xl text-center relative">
          {(showFeedback === 'correct' || (gameMode === 'ownPace' && answers[displayQIndex]?.isCorrect)) && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded-full p-2"
            >
              <CheckCircle2 size={40} className="text-green-500" />
            </motion.div>
          )}
          {(showFeedback === 'incorrect' || (gameMode === 'ownPace' && answers[displayQIndex] && !answers[displayQIndex].isCorrect)) && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded-full p-2"
            >
              <XCircle size={40} className="text-red-500" />
            </motion.div>
          )}
          {showFeedback === 'waiting' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600/90 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse whitespace-nowrap">
              Waiting for Host...
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mt-4">{q.question}</h2>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {q.options.map((opt, idx) => {
            
            // Determine button colors based on state
            let bgClass = "bg-[#1A1A24]/60 hover:bg-[#1A1A24] border-white/10 text-white";
            let letterBg = "bg-white/10";
            
            const hasAnswered = questionStatus === 'revealed' || selectedOption !== null || (gameMode === 'ownPace' && answers[displayQIndex] !== undefined);
            const effectiveSelected = gameMode === 'ownPace' ? answers[displayQIndex]?.selectedOption : selectedOption;
            const effectiveRevealed = gameMode === 'ownPace' ? answers[displayQIndex] !== undefined : questionStatus === 'revealed';
            
            if (effectiveRevealed) {
              if (idx === q.answer) {
                bgClass = "bg-green-500 text-white border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]";
                letterBg = "bg-green-600 border border-green-400";
              } else if (idx === effectiveSelected) {
                bgClass = "bg-red-500 text-white border-red-400";
                letterBg = "bg-red-600 border border-red-400";
              } else {
                bgClass = "bg-white/5 border-white/10 text-white/30 opacity-50";
                letterBg = "bg-white/5 border border-white/10";
              }
            } else if (idx === effectiveSelected) {
              bgClass = "bg-purple-600 text-white border-purple-400";
              letterBg = "bg-purple-700 border border-purple-400";
            }

            return (
              <motion.button
                key={idx}
                whileHover={!hasAnswered ? { scale: 1.01, x: 5 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                disabled={hasAnswered}
                onClick={() => handleAnswer(idx)}
                className={`p-5 md:p-6 rounded-2xl border font-bold text-lg md:text-xl transition-all flex items-center text-left shadow-lg ${bgClass} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'} w-full`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm md:text-base mr-4 shrink-0 transition-colors ${letterBg}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-snug">{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Navigation footer for own-pace mode */}
        {gameMode === 'ownPace' && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => goToQuestion(displayQIndex - 1)}
              disabled={displayQIndex === 0}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-all disabled:opacity-30 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <span className="text-xs text-zinc-500 font-mono">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            {displayQIndex < questions.length - 1 ? (
              <button
                onClick={() => goToQuestion(displayQIndex + 1)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <div className="text-green-400 text-sm font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Last Question
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuizClient;
