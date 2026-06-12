import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Trophy, Copy, CheckCircle2, Target, StopCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { QUESTIONS } from '@/data/questions';

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  progress: number;
}

const BuizHost = () => {
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);

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
    // Generate a random 6 digit pin
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Pick 10 random questions from the pool
      const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
      const selectedQs = shuffled.slice(0, 10);

      await setDoc(doc(db, "buiz_rooms", newPin), {
        pin: newPin,
        status: 'waiting',
        hostId: 'admin',
        questions: selectedQs,
        createdAt: new Date()
      });
      
      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Make sure you updated your Firebase Rules to allow writing to buiz_rooms!");
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
  };

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            onClick={generateRoom}
            className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" size={24} /> Generate Game PIN
          </button>
        </motion.div>
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
              <p className="text-3xl font-black text-white flex items-center gap-2 justify-center"><Users size={24} className="text-purple-400"/> {players.length}</p>
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
                      className={`flex items-center justify-between p-4 rounded-2xl border ${
                        index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                        index === 1 ? 'bg-zinc-300/10 border-zinc-300/30' :
                        index === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-zinc-300 text-black' :
                          index === 2 ? 'bg-orange-500 text-black' :
                          'bg-white/10 text-white/50'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${index < 3 ? 'text-white' : 'text-zinc-300'}`}>{p.name}</p>
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
                        <p className={`font-black text-2xl font-mono ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-zinc-300' :
                          index === 2 ? 'text-orange-400' :
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
