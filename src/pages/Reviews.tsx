import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  PlusCircle,
  Wand2,
  ArrowRight,
  Star,
  Quote,
  Layers,
  Database,
  X,
  Send,
  Loader2
} from "lucide-react";
import SEO from "@/components/SEO";
import PageTransition from "@/components/PageTransition";
import { workshopReviews, StudentReview, StudentReviewCard } from "@/components/TestimonialsSection";
import Magnetic from "@/components/Magnetic";
import { toast } from "sonner";
import {
  syncSeedSessionsToDb,
  getWorkshopSessionsFromDb,
  getSessionReviewsFromDb,
  addWorkshopSessionToDb,
  addStudentReviewToDb
} from "@/lib/reviewsDb";

// Session definition interface so future workshops can be added seamlessly
export interface WorkshopSession {
  id: string;
  institution: string;
  shortName: string;
  location: string;
  audience: string;
  topic: string;
  date: string;
  trainers: string[];
  satisfactionRate: string;
  mindsetShiftRate: string;
  reviewsCount: number;
  toolsCovered: string[];
  reviews: StudentReview[];
}

export const allSessions: WorkshopSession[] = [
  {
    id: "monti-mba-2026",
    institution: "Monti International Institute of Management Studies",
    shortName: "Monti International (MBA Y1)",
    location: "Perunthalmanna, Kerala",
    audience: "First Year MBA Students",
    topic: "Gen AI Tools For Business",
    date: "September 22 - 25, 2026",
    trainers: ["Prajwal N (Founder & AI Engineer)", "Mayur P (Co-Founder & Tech Lead)"],
    satisfactionRate: "100%",
    mindsetShiftRate: "100%",
    reviewsCount: workshopReviews.length,
    toolsCovered: ["NotebookLM", "Gamma AI", "ChatGPT", "Perplexity AI", "Canva AI"],
    reviews: workshopReviews,
  }
];

const Reviews = () => {
  const [sessions, setSessions] = useState<WorkshopSession[]>(allSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>("monti-mba-2026");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "marquee">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state for creating a new workshop session
  const [newSession, setNewSession] = useState({
    institution: "",
    shortName: "",
    location: "",
    audience: "",
    topic: "",
    date: "",
    trainers: "Prajwal N, Mayur P",
    toolsCovered: "NotebookLM, Gamma, ChatGPT, Perplexity",
  });

  // On mount, sync initial seed data to Firestore DB and load dynamic sessions
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        await syncSeedSessionsToDb();
        const dbSessions = await getWorkshopSessionsFromDb();
        if (isMounted && dbSessions.length > 0) {
          // Merge with local reviews for initial session if empty
          const merged = dbSessions.map((s) => {
            if (s.id === "monti-mba-2026" || s.id === "monti-mba-2024") {
              return { ...s, id: "monti-mba-2026", reviews: workshopReviews, reviewsCount: workshopReviews.length, date: "September 22 - 25, 2026" };
            }
            return s;
          });
          setSessions(merged);
        }
      } catch (err) {
        console.warn("DB connection notice:", err);
        setIsDbConnected(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Filter reviews for current active session
  const activeReviews = currentSession.reviews && currentSession.reviews.length > 0 
    ? currentSession.reviews 
    : (activeSessionId === "monti-mba-2026" ? workshopReviews : []);

  const filteredReviews = activeReviews.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ? true : item.category === activeFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryTool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.verdict.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const midPoint = Math.ceil(activeReviews.length / 2);
  const rowOne = activeReviews.slice(0, midPoint);
  const rowTwo = activeReviews.slice(midPoint);

  // Handle adding a new future session to the DB
  const handleAddSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.institution || !newSession.topic) {
      toast.error("Please fill in the institution and topic.");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = `session_${Date.now()}`;
      const sessionObj: WorkshopSession = {
        id: generatedId,
        institution: newSession.institution,
        shortName: newSession.shortName || newSession.institution,
        location: newSession.location || "India",
        audience: newSession.audience || "Students & Executives",
        topic: newSession.topic,
        date: newSession.date || "Upcoming 2026",
        trainers: newSession.trainers.split(",").map((t) => t.trim()),
        satisfactionRate: "100%",
        mindsetShiftRate: "100%",
        reviewsCount: 0,
        toolsCovered: newSession.toolsCovered.split(",").map((t) => t.trim()),
        reviews: [],
      };

      await addWorkshopSessionToDb(sessionObj);
      setSessions((prev) => [...prev, sessionObj]);
      setActiveSessionId(generatedId);
      setIsModalOpen(false);
      setNewSession({
        institution: "",
        shortName: "",
        location: "",
        audience: "",
        topic: "",
        date: "",
        trainers: "Prajwal N, Mayur P",
        toolsCovered: "NotebookLM, Gamma, ChatGPT, Perplexity",
      });
      toast.success("Workshop session added to database successfully!");
    } catch (error) {
      console.error("Error creating session in DB:", error);
      toast.error("Could not save to DB. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEO
        title="Campus Masterclasses & Reviews | Buildicy"
        description="Explore authentic feedback and verified student reviews from university workshops (including Monti International Institute of Management Studies, Sep 22-25, 2026) conducted by Buildicy leadership."
        canonicalUrl="/reviews"
      />

      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-white">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl mb-6 shadow-xl"
          >
            <GraduationCap size={15} className="text-purple-400" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-300">
              Verified Campus Workshops & Masterclasses
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">DB Synced</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            Campus Masterclasses & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
              Student Reviews.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light mb-10"
          >
            Real feedback, mindset transformations, and verified ratings from students and faculty trained directly by Buildicy leadership in Generative AI for enterprise and management.
          </motion.p>

          {/* GLOBAL STATS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">5.0 / 5.0</div>
              <div className="text-xs text-zinc-400">Cohort Satisfaction</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">100%</div>
              <div className="text-xs text-zinc-400">Mindset Shift (Hard &rarr; Easy)</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">2,500+</div>
              <div className="text-xs text-zinc-400">Students Reached</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">4-Day Format</div>
              <div className="text-xs text-zinc-400">Intensive Bootcamp</div>
            </div>
          </div>
        </div>

        {/* SESSION SELECTOR TABS (Extensible for all future sessions!) */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <School size={16} className="text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-mono">
                Workshop Sessions In Database
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/40 transition-all"
              >
                <PlusCircle size={13} />
                <span>Add Future Session</span>
              </button>
              <span className="text-xs text-zinc-500 font-mono">
                {sessions.length} Recorded
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setActiveFilter("all");
                }}
                className={`p-6 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden ${
                  activeSessionId === session.id
                    ? "bg-purple-950/30 border-purple-500/50 shadow-xl shadow-purple-500/10"
                    : "bg-[#0C0C14] border-white/5 hover:border-white/15"
                }`}
              >
                {activeSessionId === session.id && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold tracking-wider uppercase border border-purple-500/30">
                    <CheckCircle2 size={10} /> Active Session
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-2">
                  <Calendar size={12} /> {session.date}
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
                  {session.institution}
                </h3>
                <p className="text-xs text-zinc-400 mb-4 flex items-center gap-1">
                  <MapPin size={12} className="text-zinc-500 shrink-0" /> {session.location} • {session.audience}
                </p>
                <div className="flex items-center justify-between text-xs pt-4 border-t border-white/5">
                  <span className="text-zinc-400 font-medium">Topic: {session.topic}</span>
                  <span className="font-bold text-purple-300">
                    {session.id === "monti-mba-2026" ? workshopReviews.length : session.reviewsCount} Reviews
                  </span>
                </div>
              </button>
            ))}

            {/* UPCOMING / HOST A WORKSHOP CARD */}
            <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-2">
                  <PlusCircle size={13} className="text-purple-400" /> Host On Your Campus
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Book Buildicy For Next Cohort
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Invite Buildicy leadership (Prajwal & Mayur) for hands-on sessions on Gen AI Tools, SaaS Engineering, and Modern Tech Trends.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  <PlusCircle size={13} /> Add Session
                </button>
                <a
                  href="mailto:contact@buildicy.com?subject=Campus%20Workshop%20Invitation"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  <span>Inquire</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE SESSION DETAILS BANNER */}
        <div className="p-8 rounded-3xl bg-[#0C0C14] border border-white/10 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                <span className="flex items-center gap-1"><School size={14} /> {currentSession.audience}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={13} /> {currentSession.date}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">4-Day Bootcamp</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {currentSession.institution}
              </h2>
              <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed mb-4">
                Masterclass on <strong className="text-white font-semibold">"{currentSession.topic}"</strong> conducted by {currentSession.trainers.join(" & ")} at {currentSession.location}.
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSession.toolsCovered.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center w-full sm:w-auto">
                <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                  5.0 <Star size={18} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Average Rating</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center w-full sm:w-auto">
                <div className="text-3xl font-extrabold text-emerald-400">
                  {activeReviews.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Verified Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: CATEGORY FILTER, SEARCH & VIEW SWITCHER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: `All Reviews (${activeReviews.length})` },
              { id: "mindset", label: "Mindset Transformation" },
              { id: "trainers", label: "Prajwal & Mayur Praise" },
              { id: "tools", label: "AI Tools Mastery" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  if (tab.id !== "all" && viewMode === "marquee") {
                    setViewMode("grid");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeFilter === tab.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & View Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-grow md:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search student, tool or quote..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Grid ({filteredReviews.length})
              </button>
              <button
                onClick={() => setViewMode("marquee")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "marquee"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Live Stream
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: COMPREHENSIVE CARD GRID */}
        {viewMode === "grid" && (
          <div>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                No student reviews match your criteria. Try adjusting your search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviews.map((review) => (
                  <StudentReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DUAL-ROW MARQUEE */}
        {viewMode === "marquee" && (
          <div className="relative flex flex-col gap-6 py-4 overflow-hidden -mx-6">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes review-marquee-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes review-marquee-right {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
              .animate-reviews-left {
                animation: review-marquee-left 75s linear infinite;
                will-change: transform;
              }
              .animate-reviews-right {
                animation: review-marquee-right 75s linear infinite;
                will-change: transform;
              }
              .animate-reviews-left:hover, .animate-reviews-right:hover {
                animation-play-state: paused;
              }
            `,
              }}
            />

            <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#050507] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#050507] to-transparent z-20 pointer-events-none" />

            {/* Row 1 */}
            <div className="flex w-max animate-reviews-left transform-gpu">
              {[...rowOne, ...rowOne].map((review, i) => (
                <div key={`${review.id}-${i}`} className="w-[360px] md:w-[420px] flex-shrink-0 pr-6">
                  <StudentReviewCard review={review} />
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex w-max animate-reviews-right transform-gpu">
              {[...rowTwo, ...rowTwo].map((review, i) => (
                <div key={`${review.id}-row2-${i}`} className="w-[360px] md:w-[420px] flex-shrink-0 pr-6">
                  <StudentReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM CALLOUT: HOST A MASTERCLASS */}
        <div className="mt-24 p-10 rounded-3xl bg-gradient-to-br from-purple-900/20 via-[#0C0C14] to-indigo-900/20 border border-purple-500/20 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono font-bold text-purple-300 uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Invite Buildicy Founders
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Bring Gen AI Tools to Your Campus
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              We deliver high-impact, 4-day intensive workshops tailored for MBA programs, computer science colleges, and leadership teams. Students learn by creating real deliverables.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:contact@buildicy.com?subject=Inquiry:%20Host%20Campus%20Workshop"
                className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
              >
                <span>Schedule a Workshop</span>
                <ArrowRight size={15} />
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-scouter"))}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-sm border border-white/10 transition-colors"
              >
                Speak with Coordinators
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD FUTURE WORKSHOP SESSION TO DATABASE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0F0F16] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Database size={14} /> Database Record Creator
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Add Workshop Session</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Record a new campus workshop session into Firestore DB so reviews and metrics are instantly accessible.
              </p>

              <form onSubmit={handleAddSessionSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indian Institute of Technology"
                    value={newSession.institution}
                    onChange={(e) => setNewSession({ ...newSession, institution: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Short Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Madras (B.Tech Y3)"
                      value={newSession.shortName}
                      onChange={(e) => setNewSession({ ...newSession, shortName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai, Tamil Nadu"
                      value={newSession.location}
                      onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MBA Cohort or Final Year"
                      value={newSession.audience}
                      onChange={(e) => setNewSession({ ...newSession, audience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Dates Conducted
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. October 10 - 14, 2026"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    Session Topic *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gen AI Tools for Business or Full Stack AI"
                    value={newSession.topic}
                    onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Save to Database
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Reviews;
