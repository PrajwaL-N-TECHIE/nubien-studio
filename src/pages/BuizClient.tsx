import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Award,
  Sparkles,
  Search,
  Users,
  Flame,
  RotateCcw,
  BarChart3,
  Medal,
  ChevronDown,
  ChevronUp,
  Dices
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { playTickSound, playCorrectSound, playIncorrectSound } from '@/utils/audio';
import { toast } from "sonner";
import { downloadStudentScorecardPDF } from '@/utils/quizReports';

interface Question {
  id: number | string;
  topic: string;
  difficulty: string;
  question: string;
  options: string[];
  answer: number;
  points?: number;
}

const AVATAR_PRESETS = [
  'CosmicHero',
  'CodeNinja',
  'NeonTiger',
  'PixelWizard',
  'CyberKnight',
  'AstroFox',
  'QuantumPanda',
  'ViperRacer'
];

const BuizClient = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(() => AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
  const [playerId, setPlayerId] = useState('');
  
  const [roomStatus, setRoomStatus] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('Buiz Arena Quiz');
  const [totalQuizPoints, setTotalQuizPoints] = useState<number>(0);
  
  // Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<'answering' | 'revealed'>('answering');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | 'waiting' | null>(null);
  const [recentReward, setRecentReward] = useState<{ earned: number; base: number; speed: number; streak: number } | null>(null);

  // Finished & Rank State
  const [finalRank, setFinalRank] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(1);
  const [allLeaderboardPlayers, setAllLeaderboardPlayers] = useState<any[]>([]);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [finishedTab, setFinishedTab] = useState<'scorecard' | 'leaderboard'>('scorecard');
  const [showAllContenders, setShowAllContenders] = useState(false);
  const [isDownloadingScorecard, setIsDownloadingScorecard] = useState<boolean>(false);
  const myPlayerRowRef = useRef<HTMLDivElement | null>(null);

  // Own-pace mode state
  const [gameMode, setGameMode] = useState<'hostPaced' | 'ownPace'>('hostPaced');
  const [localQIndex, setLocalQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionIdx: number]: { selectedOption: number; isCorrect: boolean; earnedPoints?: number } }>({});
  const [ownPaceDone, setOwnPaceDone] = useState(false);

  // Listen to room status once joined
  useEffect(() => {
    if (!pin || roomStatus === 'setup') return;

    let isSubscribed = true;

    const handleRoomData = (data: any) => {
      if (!data) return;
      const mode = data.game_mode || data.gameMode || 'hostPaced';
      setGameMode(mode);

      if (data.quiz_name || data.quizName) setQuizTitle(data.quiz_name || data.quizName);
      if (data.total_possible_points !== undefined || data.totalPossiblePoints !== undefined) {
        setTotalQuizPoints(data.total_possible_points ?? data.totalPossiblePoints);
      }

      const statusVal = data.status;
      if (statusVal === 'playing') {
        if (roomStatus === 'waiting') {
          setQuestions(data.questions || []);
          setRoomStatus('playing');
          if (mode === 'ownPace') {
            setQuestionStatus('answering');
            setOwnPaceDone(false);
          }
        }
        if (mode === 'hostPaced') {
          const qIdx = data.current_q_index !== undefined ? data.current_q_index : data.currentQIndex;
          if (qIdx !== undefined && qIdx !== currentQIndex) {
            setCurrentQIndex(qIdx);
            setSelectedOption(null);
            setShowFeedback(null);
            setRecentReward(null);
            setTimeLeft(20);
          }
          const qStatus = data.question_status || data.questionStatus;
          if (qStatus !== undefined && qStatus !== questionStatus) {
            setQuestionStatus(qStatus);
          }
        }
      } else if (statusVal === 'finished') {
        setRoomStatus('finished');
      }
    };

    // 1. Supabase Realtime Listener
    let channel: any = null;
    if (isSupabaseConfigured) {
      supabase
        .from('buiz_rooms')
        .select('*')
        .eq('pin', pin)
        .maybeSingle()
        .then(({ data, error }) => {
          if (isSubscribed && data && !error) {
            handleRoomData(data);
          }
        });

      channel = supabase
        .channel(`buiz_client_room_${pin}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'buiz_rooms', filter: `pin=eq.${pin}` },
          (payload) => {
            if (isSubscribed && payload.new) {
              handleRoomData(payload.new);
            }
          }
        )
        .subscribe();
    }

    // 2. Firestore Listener (Fallback & Dual-Sync)
    const unsubscribeFs = onSnapshot(doc(db, "buiz_rooms", pin), (docSnap) => {
      if (!isSubscribed) return;
      if (docSnap.exists()) {
        handleRoomData(docSnap.data());
      } else if (!isSupabaseConfigured) {
        toast.error("Room was closed by host.");
        setRoomStatus('setup');
      }
    });

    return () => {
      isSubscribed = false;
      if (channel) supabase.removeChannel(channel);
      unsubscribeFs();
    };
  }, [pin, roomStatus, currentQIndex, questionStatus]);

  // Fetch final leaderboard & student rank when game finishes
  useEffect(() => {
    if (roomStatus === 'finished' && pin) {
      const fetchFinalRank = async () => {
        let list: any[] = [];
        
        // 1. Check Supabase
        if (isSupabaseConfigured) {
          try {
            const { data: sbPlayers, error } = await supabase
              .from('buiz_players')
              .select('*')
              .eq('room_pin', pin)
              .order('score', { ascending: false });
            if (!error && sbPlayers && sbPlayers.length > 0) {
              list = sbPlayers.map((p: any) => ({
                id: p.id,
                name: p.name,
                score: p.score || 0,
                streak: p.streak || 0,
                progress: Number(p.progress) || 0,
                avatar: p.avatar,
                currentQIndex: p.current_q_index,
                answers: p.answers || {}
              }));
            }
          } catch (err) {
            console.warn("Supabase final rank fetch warning:", err);
          }
        }

        // 2. Fallback to Firestore
        if (list.length === 0) {
          try {
            const snap = await getDocs(collection(db, `buiz_rooms/${pin}/players`));
            snap.forEach(d => list.push({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.score || 0) - (a.score || 0));
          } catch (err) {
            console.error("Failed to fetch final rank from Firestore", err);
          }
        }

        setAllLeaderboardPlayers(list);
        const myIndex = list.findIndex(p => p.id === playerId);
        if (myIndex !== -1) {
          setFinalRank(myIndex + 1);
        }
        setTotalParticipants(list.length || 1);
      };
      fetchFinalRank();
    }
  }, [roomStatus, pin, playerId]);

  // Timer logic for playing (host-paced only)
  useEffect(() => {
    if (roomStatus !== 'playing' || questionStatus === 'revealed' || currentQIndex >= questions.length || gameMode === 'ownPace') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 6 && prev > 1) {
          playTickSound();
        }
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQIndex, roomStatus, questionStatus, questions.length, gameMode]);

  const rollAvatar = () => {
    const nextIdx = Math.floor(Math.random() * AVATAR_PRESETS.length);
    setAvatarSeed(`${AVATAR_PRESETS[nextIdx]}_${Math.floor(Math.random() * 1000)}`);
  };

  const currentAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    const cleanName = name.trim();
    if (!cleanPin || !cleanName) return;
    
    try {
      let roomFound = false;
      let roomStatusVal = 'waiting';

      // 1. Check Supabase
      if (isSupabaseConfigured) {
        try {
          const { data: sbRoom } = await supabase
            .from('buiz_rooms')
            .select('*')
            .eq('pin', cleanPin)
            .maybeSingle();
          if (sbRoom) {
            roomFound = true;
            roomStatusVal = sbRoom.status;
          }
        } catch (sbErr) {
          console.warn("Supabase room check warning:", sbErr);
        }
      }

      // 2. Check Firestore if not found in Supabase
      if (!roomFound) {
        const roomRef = doc(db, "buiz_rooms", cleanPin);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          roomFound = true;
          roomStatusVal = roomSnap.data().status;
        }
      }

      if (!roomFound) {
        toast.error("Invalid PIN. Room not found.");
        return;
      }
      
      if (roomStatusVal !== 'waiting') {
        toast.error("Game has already started or finished!");
        return;
      }
      
      const newPlayerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      const nowIso = new Date().toISOString();

      // 1. Insert into Supabase
      if (isSupabaseConfigured) {
        try {
          await supabase.from('buiz_players').upsert({
            id: newPlayerId,
            room_pin: cleanPin,
            name: cleanName,
            score: 0,
            streak: 0,
            progress: 0,
            avatar: currentAvatarUrl,
            current_q_index: 0,
            answers: {},
            joined_at: nowIso,
            updated_at: nowIso
          });
        } catch (sbErr) {
          console.warn("Supabase player join warning:", sbErr);
        }
      }

      // 2. Mirror into Firestore
      try {
        await setDoc(doc(db, `buiz_rooms/${cleanPin}/players`, newPlayerId), {
          name: cleanName,
          score: 0,
          streak: 0,
          progress: 0,
          avatar: currentAvatarUrl,
          joinedAt: new Date()
        });
      } catch (fsErr) {
        console.warn("Firestore player join warning:", fsErr);
      }
      
      setPlayerId(newPlayerId);
      setRoomStatus('waiting');
    } catch (err) {
      console.error(err);
      toast.error("Failed to join. Check your internet connection.");
    }
  };

  const updatePlayerScore = async (
    newScore: number,
    newStreak: number,
    progress: number,
    answersData?: { [questionIdx: number]: { selectedOption: number; isCorrect: boolean } }
  ) => {
    if (!playerId) return;

    // 1. Supabase Update
    if (isSupabaseConfigured) {
      const sbPlayerUpdate: any = {
        score: newScore,
        streak: newStreak,
        progress: progress,
        updated_at: new Date().toISOString()
      };
      if (answersData) sbPlayerUpdate.answers = answersData;

      supabase
        .from('buiz_players')
        .update(sbPlayerUpdate)
        .eq('id', playerId)
        .then(({ error }) => {
          if (error) console.warn("Supabase score sync warning:", error);
        });
    }

    // 2. Firestore Mirror
    try {
      await updateDoc(doc(db, `buiz_rooms/${pin}/players`, playerId), {
        score: newScore,
        streak: newStreak,
        progress: progress,
        ...(answersData ? { answers: answersData } : {})
      });
    } catch (err) {
      console.error("Failed to sync score to Firestore", err);
    }
  };

  const handleAnswer = (selectedIdx: number) => {
    if (questionStatus === 'revealed') return;
    
    if (gameMode === 'ownPace') {
      if (answers[localQIndex] !== undefined) return;
      const currentIdx = localQIndex;
      const q = questions[currentIdx];
      const isCorrect = selectedIdx === q?.answer;
      const basePoints = q?.points || 1000;
      
      let newScore = score;
      let newStreak = streak;
      let earned = 0;
      let speedBonus = 0;
      let streakBonus = 0;
      
      if (isCorrect) {
        playCorrectSound();
        newStreak += 1;
        streakBonus = newStreak > 2 ? Math.floor(newStreak * (basePoints * 0.1)) : 0;
        earned = basePoints + streakBonus;
        newScore += earned;
        setRecentReward({ earned, base: basePoints, speed: 0, streak: streakBonus });
      } else {
        playIncorrectSound();
        newStreak = 0;
        setRecentReward({ earned: 0, base: 0, speed: 0, streak: 0 });
      }
      
      const newAnswers = { ...answers, [currentIdx]: { selectedOption: selectedIdx, isCorrect, earnedPoints: earned } };
      setAnswers(newAnswers);
      setScore(newScore);
      setStreak(newStreak);
      
      const progress = Object.keys(newAnswers).length / questions.length;
      updatePlayerScore(newScore, newStreak, progress, newAnswers);
      
      if (Object.keys(newAnswers).length >= questions.length) {
        setOwnPaceDone(true);
      }
    } else {
      setSelectedOption(selectedIdx);
      setShowFeedback('waiting');
      
      const currentIdx = currentQIndex;
      const q = questions[currentIdx];
      const isCorrect = selectedIdx === q?.answer;
      const immediateAnswers = {
        ...answers,
        [currentIdx]: { selectedOption: selectedIdx, isCorrect, timeLeft }
      };
      setAnswers(immediateAnswers);

      const progress = (currentQIndex + 1) / (questions.length || 1);
      updatePlayerScore(score, streak, progress, immediateAnswers);
    }
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
      if (isSupabaseConfigured) {
        supabase
          .from('buiz_players')
          .update({ current_q_index: localQIndex, updated_at: new Date().toISOString() })
          .eq('id', playerId)
          .then(() => {});
      }
      updateDoc(doc(db, `buiz_rooms/${pin}/players`, playerId), { currentQIndex: localQIndex }).catch(() => {});
    }
  }, [localQIndex, gameMode, roomStatus, pin, playerId]);

  // When questionStatus changes to revealed, evaluate score with custom question points + time/streak bonus
  useEffect(() => {
    if (questionStatus === 'revealed' && roomStatus === 'playing' && gameMode === 'hostPaced') {
      const q = questions[currentQIndex];
      const currentSelected = selectedOption;
      const isCorrect = currentSelected !== null && currentSelected === q?.answer;
      const basePoints = q?.points || 1000;
      
      let newScore = score;
      let newStreak = streak;
      let earned = 0;
      let timeBonus = 0;
      let streakBonus = 0;
      
      if (isCorrect) {
        setShowFeedback('correct');
        playCorrectSound();
        timeBonus = Math.floor((timeLeft / 20) * (basePoints * 0.5));
        newStreak += 1;
        streakBonus = newStreak > 2 ? Math.floor(newStreak * (basePoints * 0.1)) : 0;
        earned = basePoints + timeBonus + streakBonus;
        newScore += earned;
        setRecentReward({ earned, base: basePoints, speed: timeBonus, streak: streakBonus });
      } else {
        setShowFeedback('incorrect');
        playIncorrectSound();
        newStreak = 0;
        setRecentReward({ earned: 0, base: 0, speed: 0, streak: 0 });
      }
      
      setScore(newScore);
      setStreak(newStreak);
      
      const progress = (currentQIndex + 1) / (questions.length || 1);
      const updatedAnswers = {
        ...answers,
        [currentQIndex]: { selectedOption: currentSelected ?? -1, isCorrect, earnedPoints: earned, timeLeft }
      };
      setAnswers(updatedAnswers);
      updatePlayerScore(newScore, newStreak, progress, updatedAnswers);
    }
  }, [questionStatus, roomStatus, gameMode, currentQIndex, selectedOption, timeLeft, score, streak, questions]);

  // Memoized filter for 50-200+ students on mobile
  const filteredLeaderboard = useMemo(() => {
    if (!leaderboardSearch.trim()) return allLeaderboardPlayers;
    const term = leaderboardSearch.toLowerCase().trim();
    return allLeaderboardPlayers.filter(p => (p.name || '').toLowerCase().includes(term));
  }, [allLeaderboardPlayers, leaderboardSearch]);

  const displayedLeaderboard = useMemo(() => {
    if (showAllContenders || leaderboardSearch.trim()) {
      return filteredLeaderboard;
    }
    return filteredLeaderboard.slice(0, 25);
  }, [filteredLeaderboard, showAllContenders, leaderboardSearch]);

  const scrollToMyRow = () => {
    if (myPlayerRowRef.current) {
      myPlayerRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      myPlayerRowRef.current.classList.add('ring-4', 'ring-purple-400');
      setTimeout(() => {
        myPlayerRowRef.current?.classList.remove('ring-4', 'ring-purple-400');
      }, 2000);
    } else {
      setShowAllContenders(true);
      setTimeout(() => {
        myPlayerRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // 1. Own-pace completed state
  if (gameMode === 'ownPace' && ownPaceDone && questions.length > 0) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0C0C12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 max-w-md w-full text-center relative z-10 shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-2xl flex items-center justify-center mx-auto text-green-400">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">All Questions Answered!</h2>
            <p className="text-zinc-400 text-sm mt-1">You submitted all {questions.length} arena questions.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Your Total Score</p>
            <p className="text-4xl sm:text-5xl font-black text-yellow-400 font-mono">{score.toLocaleString()}</p>
            <p className="text-xs text-zinc-400 mt-2">
              {Object.values(answers).filter(a => a.isCorrect).length} of {questions.length} correct answers
            </p>
          </div>
          
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={() => {
                setOwnPaceDone(false);
                setLocalQIndex(0);
              }}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto active:scale-95 cursor-pointer"
            >
              <Search size={14} /> Review My Answers
            </button>
            <p className="text-zinc-500 text-xs sm:text-sm">
              Please wait for the host to finish the room to view the final rankings and download your official scorecard.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Setup / Join State (Mobile Optimized with Number Pad, Avatar Chooser, High-Volume Friendly)
  if (roomStatus === 'setup') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 max-w-md w-full relative z-10 shadow-2xl"
        >
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300 mb-3">
              <Zap size={13} className="text-yellow-400" /> Buiz Live Arena
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Join Arena</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">Ready to battle and test your business acumen</p>
          </div>

          {/* Interactive Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-600/30 to-yellow-500/20 border-2 border-purple-500/50 p-1 flex items-center justify-center shadow-lg overflow-hidden">
                <img src={currentAvatarUrl} alt="Your Avatar" className="w-full h-full object-contain" />
              </div>
              <button
                type="button"
                onClick={rollAvatar}
                className="absolute -bottom-2 -right-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg border border-purple-400/50 transition-transform active:scale-90"
                title="Randomize Avatar"
              >
                <Dices size={15} />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-medium">Tap dice to pick avatar</p>
          </div>
          
          <form onSubmit={joinRoom} className="space-y-4">
            {/* Game PIN with numeric keyboard trigger on mobile */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Game PIN</label>
              <input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000" 
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 px-4 text-2xl sm:text-3xl font-black text-center text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all tracking-[0.2em] font-mono"
                required
                maxLength={6}
              />
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Your Nickname</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 px-4 text-base sm:text-lg font-bold text-center text-white placeholder-white/20 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
                required
                maxLength={18}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Enter Game <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
              <Users size={13} className="text-purple-400" /> Optimized for high student volume & mobile play
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Waiting Lobby State (Mobile Optimized with tips & rules)
  if (roomStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10 max-w-sm w-full"
        >
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-purple-600/20 border-2 border-purple-500 rounded-3xl p-2 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)]">
              <img src={currentAvatarUrl} alt={name} className="w-full h-full object-contain" />
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-green-300 shadow">
              Ready
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">You&apos;re in, {name}!</h2>
          <p className="text-zinc-400 text-sm mt-1">Room PIN: <strong className="font-mono text-purple-300">{pin}</strong></p>
          
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl py-3 px-5 inline-flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
            <p className="text-yellow-300 font-bold text-xs uppercase tracking-wider">Waiting for Host to Start</p>
          </div>

          {/* Quick Arena Tips for Mobile Users */}
          <div className="mt-8 grid grid-cols-3 gap-2 text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Points</p>
              <p className="text-xs text-white font-semibold mt-0.5">Per-question custom scores</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Speed</p>
              <p className="text-xs text-white font-semibold mt-0.5">Faster gives up to +50%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Streak</p>
              <p className="text-xs text-white font-semibold mt-0.5">3+ chains stack multipliers</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Finished State (Full Mobile Leaderboard + Personal Scorecard PDF)
  if (roomStatus === 'finished') {
    const correctCount = Object.values(answers).filter(a => a?.isCorrect).length;
    const totalQ = questions.length || 1;
    const accuracy = Math.round((correctCount / totalQ) * 100);
    const maxPoints = totalQuizPoints || questions.reduce((sum, q) => sum + (q.points || 1000), 0) || totalQ * 1000;
    const scorePct = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;

    const handleDownloadScorecard = () => {
      setIsDownloadingScorecard(true);
      try {
        downloadStudentScorecardPDF({
          studentName: name || 'Student',
          quizTitle: quizTitle,
          pin: pin,
          rank: finalRank || 1,
          totalPlayers: totalParticipants || 1,
          score: score,
          maxPossiblePoints: maxPoints,
          totalQuestions: totalQ,
          correctCount: correctCount,
          streak: streak,
          date: new Date()
        });
        toast.success("Scorecard PDF downloaded successfully!");
      } catch (err) {
        console.error("Scorecard download error", err);
        toast.error("Failed to generate scorecard PDF.");
      } finally {
        setIsDownloadingScorecard(false);
      }
    };

    const top3 = allLeaderboardPlayers.slice(0, 3);

    return (
      <div className="min-h-screen bg-[#050507] flex flex-col p-4 sm:p-6 pb-24 relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/01/29/13/03/confetti-3116032_1280.png')] opacity-25 animate-pulse mix-blend-screen pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-xl mx-auto w-full relative z-10 flex flex-col">
          {/* Top Tab Selector: Scorecard vs Live Arena Leaderboard */}
          <div className="flex items-center gap-1.5 bg-[#0C0C12]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl mb-6 shadow-xl">
            <button
              onClick={() => setFinishedTab('scorecard')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                finishedTab === 'scorecard' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award size={16} /> My Scorecard
            </button>
            <button
              onClick={() => setFinishedTab('leaderboard')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                finishedTab === 'leaderboard' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy size={16} /> Leaderboard
              <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">{totalParticipants}</span>
            </button>
          </div>

          {/* TAB 1: Personal Scorecard */}
          {finishedTab === 'scorecard' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0C0C12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6"
            >
              {/* Header Rank Badge */}
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-500/20 border border-yellow-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                  <Trophy className="text-yellow-400" size={44} />
                </div>
                {finalRank && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-xs uppercase px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    {finalRank === 1 ? '🥇 1st Place' : finalRank === 2 ? '🥈 2nd Place' : finalRank === 3 ? '🥉 3rd Place' : `Rank #${finalRank}`}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{name}&apos;s Results</h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  {finalRank ? (
                    <span>You ranked <strong className="text-yellow-400 font-bold">#{finalRank}</strong> out of {totalParticipants} contenders</span>
                  ) : (
                    <span>Quiz finished! Check your personal stats below</span>
                  )}
                </p>
              </div>
              
              {/* Primary Score Hero Card */}
              <div className="bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Your Total Score</p>
                <p className="text-4xl sm:text-5xl font-black text-yellow-400 font-mono tracking-tight">{score.toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Out of {maxPoints.toLocaleString()} possible points ({scorePct}%)
                </p>
              </div>

              {/* Quick KPI Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Accuracy</p>
                  <p className={`text-lg sm:text-xl font-black font-mono mt-1 ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Correct</p>
                  <p className="text-lg sm:text-xl font-black text-white font-mono mt-1">{correctCount} / {totalQ}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Best Streak</p>
                  <p className="text-lg sm:text-xl font-black text-orange-400 font-mono mt-1">{streak} 🔥</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleDownloadScorecard}
                  disabled={isDownloadingScorecard}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-base transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <FileText size={18} /> {isDownloadingScorecard ? 'Generating PDF...' : 'Download My Scorecard (PDF)'}
                </button>

                <button 
                  onClick={() => setFinishedTab('leaderboard')}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Trophy size={16} className="text-yellow-400" /> View All {totalParticipants} Players
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Full Arena Leaderboard for 50-200+ Students */}
          {finishedTab === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Mobile Compact Top 3 Podium */}
              {top3.length > 0 && (
                <div className="bg-[#0C0C12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
                  <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Podium Spotlight</p>
                  <div className="flex items-end justify-center gap-2 sm:gap-4">
                    {/* 2nd Place */}
                    {top3[1] && (
                      <div className="flex-1 flex flex-col items-center max-w-[110px]">
                        <span className="text-xl">🥈</span>
                        <p className="text-xs font-bold text-white truncate max-w-full mt-1">{top3[1].name}</p>
                        <p className="text-[11px] font-mono text-zinc-400">{top3[1].score?.toLocaleString()} pts</p>
                        <div className="w-full h-14 bg-zinc-700/50 rounded-t-xl mt-2 flex items-center justify-center border-t border-zinc-400">
                          <span className="text-xs font-black text-zinc-300">2</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                      <div className="flex-1 flex flex-col items-center max-w-[130px]">
                        <span className="text-2xl">👑</span>
                        <p className="text-sm font-black text-yellow-400 truncate max-w-full mt-1">{top3[0].name}</p>
                        <p className="text-xs font-mono text-yellow-300/80 font-bold">{top3[0].score?.toLocaleString()} pts</p>
                        <div className="w-full h-20 bg-yellow-600/40 rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                          <span className="text-sm font-black text-yellow-300">1</span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                      <div className="flex-1 flex flex-col items-center max-w-[110px]">
                        <span className="text-xl">🥉</span>
                        <p className="text-xs font-bold text-white truncate max-w-full mt-1">{top3[2].name}</p>
                        <p className="text-[11px] font-mono text-zinc-400">{top3[2].score?.toLocaleString()} pts</p>
                        <div className="w-full h-10 bg-amber-800/40 rounded-t-xl mt-2 flex items-center justify-center border-t border-orange-400">
                          <span className="text-xs font-black text-orange-300">3</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Bar for 50-200+ Students */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder={`Search among ${allLeaderboardPlayers.length} students...`}
                  value={leaderboardSearch}
                  onChange={e => setLeaderboardSearch(e.target.value)}
                  className="w-full bg-[#0C0C12]/90 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors shadow-lg"
                />
              </div>

              {/* Scrollable Leaderboard List */}
              <div className="space-y-2">
                {displayedLeaderboard.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 bg-[#0C0C12]/80 border border-white/10 rounded-2xl">
                    No students found matching &ldquo;{leaderboardSearch}&rdquo;
                  </div>
                ) : (
                  displayedLeaderboard.map((p) => {
                    const rank = allLeaderboardPlayers.findIndex(item => item.id === p.id) + 1;
                    const isMe = p.id === playerId;

                    return (
                      <div
                        key={p.id}
                        ref={isMe ? myPlayerRowRef : undefined}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isMe 
                            ? 'bg-purple-600/25 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                            : 'bg-[#0C0C12]/80 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            rank === 1 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' 
                              : rank === 2 
                                ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/40' 
                                : rank === 3 
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' 
                                  : 'bg-white/5 text-zinc-400'
                          }`}>
                            {rank}
                          </span>
                          
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {(p.name || 'S').slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div className="truncate">
                            <p className="text-white text-sm font-bold truncate flex items-center gap-1.5">
                              {p.name}
                              {isMe && (
                                <span className="px-1.5 py-0.2 bg-purple-500 text-white rounded text-[9px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              {p.streak ? `${p.streak} streak` : '0 streak'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-yellow-400 font-mono">{p.score?.toLocaleString() || 0}</p>
                          <p className="text-[10px] text-zinc-500">points</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Show All Toggle for High-Volume Roster */}
              {allLeaderboardPlayers.length > 25 && !leaderboardSearch && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllContenders(!showAllContenders)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all inline-flex items-center gap-1.5"
                  >
                    {showAllContenders ? (
                      <>Collapse to Top 25 <ChevronUp size={14} /></>
                    ) : (
                      <>Show All {allLeaderboardPlayers.length} Contenders <ChevronDown size={14} /></>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Sticky Bottom My Standing Bar (Never lose track of rank in 50-200+ students) */}
          {finishedTab === 'leaderboard' && finalRank && (
            <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 bg-[#12121C]/95 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-3 px-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <span className="px-2 py-1 bg-purple-600 text-white rounded-lg text-xs font-black font-mono">
                  #{finalRank}
                </span>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">You ({name})</p>
                  <p className="text-[11px] font-mono text-yellow-400 font-bold">{score.toLocaleString()} pts</p>
                </div>
              </div>
              <button
                onClick={scrollToMyRow}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                Jump to Me
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Playing State (Fully Mobile-Optimized HUD, Large Arena Tap Cards, Reward Animations)
  const displayQIndex = gameMode === 'ownPace' ? localQIndex : currentQIndex;
  const q = questions[displayQIndex];
  if (!q) return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono">Loading question data...</div>;

  const currentPoints = q.points || 1000;

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col relative overflow-x-hidden select-none">
      {/* Dynamic Background Glow on Answer Result */}
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
      
      {/* Mobile-First Streamlined HUD */}
      <div className="relative z-10 p-3 sm:p-4 bg-[#0C0C12]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-2">
        {/* Left: Question counter + Points Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-white font-bold text-xs sm:text-sm font-mono">{displayQIndex + 1}/{questions.length}</span>
          </div>

          <div className="bg-yellow-500/15 border border-yellow-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-mono font-bold text-yellow-300">
            <Award size={13} className="text-yellow-400" />
            <span>{currentPoints.toLocaleString()} pts</span>
          </div>

          {streak >= 3 && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-2 py-1 rounded-xl font-black text-xs flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
            >
              <Flame size={13} fill="currentColor" /> {streak}
            </motion.div>
          )}
        </div>
        
        {/* Right: Score Display */}
        <div className="bg-white/5 border border-white/10 px-3.5 py-1 rounded-xl flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-zinc-400 uppercase font-bold">Score</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar Timer (host-paced only) */}
      {gameMode !== 'ownPace' && (
        <div className="w-full h-2 bg-white/5 relative z-10">
          <motion.div 
            className={`h-full ${timeLeft > 10 ? 'bg-purple-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'}`}
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      )}

      {/* Main Question & Answer Play Area */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-3xl mx-auto w-full relative z-10 justify-between">
        
        {/* Question Card (Optimized max height for phone screens) */}
        <div className="bg-[#0C0C12]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 mb-3 sm:mb-6 shadow-2xl text-center relative max-h-[32vh] overflow-y-auto">
          {/* Status Badge Overlays */}
          {showFeedback === 'correct' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-black px-3.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-lg"
            >
              <CheckCircle2 size={14} /> Correct!
            </motion.div>
          )}
          {showFeedback === 'incorrect' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-lg"
            >
              <XCircle size={14} /> Incorrect
            </motion.div>
          )}
          {showFeedback === 'waiting' && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase animate-pulse shadow-lg">
              Answer Submitted • Waiting for Host
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400">
              {q.topic || 'Buiz Arena'}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
              q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {q.difficulty || 'Medium'}
            </span>
          </div>

          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug">{q.question}</h2>

          {/* Reward pill if correct */}
          {recentReward && showFeedback === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-xl text-xs font-mono font-bold text-green-300"
            >
              <span>+{recentReward.earned.toLocaleString()} pts</span>
              {recentReward.speed > 0 && <span className="text-[10px] text-green-400/70">(+{recentReward.speed} speed)</span>}
              {recentReward.streak > 0 && <span className="text-[10px] text-orange-400">(+{recentReward.streak} streak)</span>}
            </motion.div>
          )}
        </div>

        {/* 4 Arena Answer Cards (Mobile First: 1 Col on Small Phones, 2 Cols on Tablets/Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 flex-1 content-center">
          {q.options.map((opt, idx) => {
            const hasAnswered = questionStatus === 'revealed' || (gameMode === 'ownPace' && answers[displayQIndex] !== undefined);
            const effectiveSelected = gameMode === 'ownPace' ? answers[displayQIndex]?.selectedOption : selectedOption;
            const effectiveRevealed = gameMode === 'ownPace' ? answers[displayQIndex] !== undefined : questionStatus === 'revealed';
            
            // Arena Shape and Theme Styling
            const shapes = ['▲', '◆', '●', '■'];
            const themeBorders = [
              'border-red-500/30 hover:border-red-500/60 bg-gradient-to-r from-red-950/30 to-[#12121A]',
              'border-blue-500/30 hover:border-blue-500/60 bg-gradient-to-r from-blue-950/30 to-[#12121A]',
              'border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-r from-amber-950/30 to-[#12121A]',
              'border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-r from-emerald-950/30 to-[#12121A]'
            ];
            const shapePillBgs = [
              'bg-red-500/20 text-red-400 border border-red-500/30',
              'bg-blue-500/20 text-blue-400 border border-blue-500/30',
              'bg-amber-500/20 text-amber-400 border border-amber-500/30',
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            ];

            let cardClasses = `${themeBorders[idx % 4]} text-white`;
            let badgeClasses = shapePillBgs[idx % 4];

            if (effectiveRevealed) {
              if (idx === q.answer) {
                cardClasses = "bg-green-600 text-white border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)]";
                badgeClasses = "bg-green-700 text-white border border-green-300";
              } else if (idx === effectiveSelected) {
                cardClasses = "bg-red-600 text-white border-red-400";
                badgeClasses = "bg-red-700 text-white border border-red-300";
              } else {
                cardClasses = "bg-white/5 border-white/5 text-white/30 opacity-40";
                badgeClasses = "bg-white/5 text-zinc-600 border-transparent";
              }
            } else if (idx === effectiveSelected) {
              cardClasses = "bg-purple-600/90 text-white border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)]";
              badgeClasses = "bg-purple-800 text-purple-200 border border-purple-400";
            }

            return (
              <motion.button
                key={idx}
                whileTap={!hasAnswered ? { scale: 0.97 } : {}}
                disabled={hasAnswered}
                onClick={() => handleAnswer(idx)}
                className={`p-3.5 sm:p-4 rounded-2xl border font-bold text-sm sm:text-base transition-all flex items-center text-left shadow-md min-h-[56px] sm:min-h-[64px] active:scale-[0.98] ${cardClasses} ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'} w-full`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm mr-3 shrink-0 font-black ${badgeClasses}`}>
                  {shapes[idx % 4]}
                </div>
                <span className="flex-1 leading-snug line-clamp-2">{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Navigation Footer for Own-Pace Mode */}
        {gameMode === 'ownPace' && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => goToQuestion(displayQIndex - 1)}
              disabled={displayQIndex === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs sm:text-sm text-white transition-all disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft size={15} /> Prev
            </button>
            <span className="text-xs text-zinc-500 font-mono">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            {displayQIndex < questions.length - 1 ? (
              <button
                onClick={() => goToQuestion(displayQIndex + 1)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-xs sm:text-sm text-white transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <div className="text-green-400 text-xs sm:text-sm font-bold flex items-center gap-1">
                <CheckCircle2 size={15} /> Finish
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuizClient;
