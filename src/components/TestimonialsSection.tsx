import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Star,
  Quote,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Search,
  School,
  Brain,
  Wand2
} from "lucide-react";

export interface StudentReview {
  id: string;
  name: string;
  role: string;
  institution: string;
  rating: number;
  usefulness: string;
  engagement: string;
  confidence: string;
  primaryTool: string;
  activity: string;
  quote: string;
  trainerFeedback: string;
  beforePerception: string;
  afterPerception: string;
  verdict: string;
  finalMessage?: string;
  category: "mindset" | "trainers" | "tools" | "general";
  avatar: string;
}

export const workshopReviews: StudentReview[] = [
  {
    id: "amaljith",
    name: "Amaljith P",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Extremely Useful",
    engagement: "Very Engaging",
    confidence: "Extremely Confident",
    primaryTool: "NotebookLM",
    activity: "AI Presentation Activity",
    quote: "They are amazing persons — they are young people but they know a lot of things. Before this workshop, I thought AI was difficult. Now I think AI is an amazing tool!",
    trainerFeedback: "Young, highly knowledgeable, and deeply engaging speaking style.",
    beforePerception: "Thought AI was difficult & complicated",
    afterPerception: "Now I think AI is an amazing, practical business tool",
    verdict: "A1 & Fantastic",
    finalMessage: "Buildicy is good",
    category: "mindset",
    avatar: "AP"
  },
  {
    id: "jawahara",
    name: "Nellamreth Jawahara KK",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Logic Quiz & Business AI",
    activity: "Practical Demonstrations & Logic Quiz",
    quote: "Thank you for an amazing and informative workshop! I liked the practical demonstrations and hands-on activities the most. Before this workshop, I thought AI was complicated and difficult. Now I think AI is an easy and powerful tool for business.",
    trainerFeedback: "They interacted closely with us and explained every concept with clarity.",
    beforePerception: "Thought AI was complicated & difficult",
    afterPerception: "Now I think AI is an easy and powerful tool",
    verdict: "Inspiring",
    finalMessage: "I really enjoyed the session and learned new things about AI. Keep going!",
    category: "mindset",
    avatar: "NJ"
  },
  {
    id: "nihas",
    name: "Abdulla Nihas V",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Extremely Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT & AI for Business",
    activity: "Logo guessing, live logic & career tools",
    quote: "Before this workshop, I thought AI was only for tech experts. Now I think anyone can use AI very easily. The trainers communicated with us so well. Congratulations for the startup company Buildicy, all the best guys!",
    trainerFeedback: "Communicated concepts seamlessly with high clarity and approachable energy.",
    beforePerception: "Thought AI was only for tech experts",
    afterPerception: "Anyone can use AI very easily for business",
    verdict: "Very Good Session",
    finalMessage: "Congratulations for the startup company. All the best guys!",
    category: "trainers",
    avatar: "AN"
  },
  {
    id: "ansar",
    name: "Mohammed Ansar MT",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & Gamma",
    activity: "Logo quiz activity & HR / marketing concepts",
    quote: "I thought AI was hard — now I think AI is crazy good! I really liked Mayur's training and Prajwal's ideas. Thank you for the amazing class both of you and best wishes for your future!",
    trainerFeedback: "Liked Mayur's structured training and Prajwal's innovative ideas.",
    beforePerception: "Thought AI was hard and intimidating",
    afterPerception: "Now I think AI is crazy good and accessible",
    verdict: "Amazing",
    finalMessage: "Thank you for the amazing class both of you and best wishes for your future!",
    category: "trainers",
    avatar: "MA"
  },
  {
    id: "fayizah",
    name: "Fathima Fayizah KT",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Perplexity AI",
    activity: "Interactive sessions & business research",
    quote: "Both of them explained everything very clearly. Prajwal was very fun and talkative, and Mayur cleared our doubts about the purpose. Before this, I thought AI was not helpful; now I know it is very helpful!",
    trainerFeedback: "Prajwal was fun & engaging, Mayur clarified core purpose & doubts.",
    beforePerception: "Thought AI was not helpful",
    afterPerception: "Understood that AI is deeply helpful for management",
    verdict: "Useful & Clarifying",
    finalMessage: "All topics were very useful to me",
    category: "trainers",
    avatar: "FF"
  },
  {
    id: "hiba",
    name: "Hiba A",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & Gamma",
    activity: "Brand identification & AI business productivity",
    quote: "Before this workshop, I thought AI was complicated. Now I think AI is useful and easy to use. I loved learning about the new AI tools they introduced to us!",
    trainerFeedback: "Energetic dynamic between the trainers and great delivery.",
    beforePerception: "Thought AI was complicated",
    afterPerception: "Useful and easy to use for daily business",
    verdict: "Fantastic",
    finalMessage: "Buildicy",
    category: "tools",
    avatar: "HA"
  },
  {
    id: "rizfina",
    name: "Rizfina",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Extremely Useful",
    engagement: "Very Engaging",
    confidence: "Extremely Confident",
    primaryTool: "Gamma AI",
    activity: "Hands-on AI slide generation & activities",
    quote: "Before this workshop, I thought AI was very difficult. Now I think AI is very simple. They ran a very friendly and calm class with lots of activities to help us understand.",
    trainerFeedback: "Friendly, calm, and step-by-step guidance.",
    beforePerception: "Thought AI was very difficult",
    afterPerception: "Realized AI is very simple and intuitive",
    verdict: "Graceful",
    category: "mindset",
    avatar: "RZ"
  },
  {
    id: "sanva",
    name: "Fathima Sanva M",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "NotebookLM, ChatGPT, Perplexity",
    activity: "Game session & AI tools mastery",
    quote: "They teach us very clearly and with great understanding. I thought AI was just a tool for answering questions. Now I think AI is a powerful tool that helps us work smarter.",
    trainerFeedback: "Clear, patient teaching with deep domain knowledge.",
    beforePerception: "Thought AI was just for answering questions",
    afterPerception: "Powerful tool that helps us work smarter",
    verdict: "Excellent",
    finalMessage: "Thank you for the session",
    category: "tools",
    avatar: "FS"
  },
  {
    id: "deepak",
    name: "Deepak Ananthu (DK)",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Instant AI PPTs & ChatGPT",
    activity: "AI Quiz & gaming session",
    quote: "Friendly like my own friends! I understand new AI workshop tools and how to create presentations in seconds. I thought AI was very difficult — now I think it's very simple. Perfectly good and interesting class!",
    trainerFeedback: "Treated students like friends, made learning effortless.",
    beforePerception: "Thought AI was very difficult",
    afterPerception: "Very simple, generates entire slide decks in seconds",
    verdict: "Superb",
    finalMessage: "Perfectly good and interesting class",
    category: "trainers",
    avatar: "DK"
  },
  {
    id: "nidash",
    name: "Nidash MP",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & Business AI",
    activity: "Quiz & interactive sessions",
    quote: "Friendly teachers who interacted closely with us. Before this, I thought AI was only for study; now I realize it's a powerful tool for business productivity. Buildicy is enough!",
    trainerFeedback: "Friendly, close interaction with every student.",
    beforePerception: "Thought AI was just for simple study",
    afterPerception: "Powerful tool for enterprise productivity",
    verdict: "A1 & Practical",
    finalMessage: "Buildicy is enough",
    category: "mindset",
    avatar: "NM"
  },
  {
    id: "fathimafidhas",
    name: "Fathimafidha S",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & NotebookLM",
    activity: "Logic quiz & NotebookLM exploration",
    quote: "Their speaking style and close interaction with us was wonderful. Your class was so enjoyable and stress-free. I thought AI was just for computers — now I think AI is for all sectors!",
    trainerFeedback: "Approachable speaking style and stress-free environment.",
    beforePerception: "Thought AI was just for computers",
    afterPerception: "AI applies across all business sectors",
    verdict: "Stress-Free",
    finalMessage: "You should continue with this AI spirit!",
    category: "mindset",
    avatar: "FF"
  },
  {
    id: "fasil",
    name: "Fasil AK",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "NotebookLM",
    activity: "AI-powered presentations & hands-on activities",
    quote: "Very understanding trainers. Doing activities with AI tools made complex concepts clear. Hard things became easy!",
    trainerFeedback: "Patient, clear and highly understanding.",
    beforePerception: "Hard to navigate",
    afterPerception: "Easy to implement in management workflows",
    verdict: "Excellent",
    finalMessage: "You are good",
    category: "tools",
    avatar: "FA"
  },
  {
    id: "nabeesh",
    name: "Mohammed Nabeesh",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "Gamma & Perplexity",
    activity: "Perplexity quiz & Gamma presentation generation",
    quote: "Very good trainers. Correct concept, schedule and concept of teaching that is very helpful for us. Always thought AI was difficult — now I think AI is easy!",
    trainerFeedback: "Well-structured schedule and clear concept breakdown.",
    beforePerception: "Always felt AI was difficult",
    afterPerception: "Now confident that AI is easy to use",
    verdict: "Very Helpful",
    finalMessage: "Teaching schedule and concept was remarkably helpful",
    category: "trainers",
    avatar: "MN"
  },
  {
    id: "sana",
    name: "Fathima Sana M",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT & AI Slide Decks",
    activity: "Pitching an energetic drink for college students using AI tools",
    quote: "Prajwal and Mayur well explained the use of AI tools that we were not familiar with. Creating product pitch decks using AI tools was such an insightful activity!",
    trainerFeedback: "Prajwal and Mayur broke down unfamiliar AI tools with great clarity.",
    beforePerception: "Unfamiliar and skeptical about AI tools",
    afterPerception: "Empowered to use AI for market pitches and strategy",
    verdict: "Insightful",
    finalMessage: "Thank you for the session",
    category: "tools",
    avatar: "SM"
  },
  {
    id: "akshay",
    name: "Akshay Krishna",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT",
    activity: "Interactive AI workshop activities",
    quote: "Very nice and clear training in English. I thought AI was hard — now I think AI is easy!",
    trainerFeedback: "Clear communication and interactive delivery.",
    beforePerception: "Thought AI was hard",
    afterPerception: "Realized AI is easy and actionable",
    verdict: "Amazing",
    finalMessage: "Thank you for everything",
    category: "mindset",
    avatar: "AK"
  },
  {
    id: "rinmar",
    name: "Muhammed Rinmar V M",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & Academic AI",
    activity: "Quiz & using AI tools",
    quote: "Great class! It is very helpful for my MBA studies and future management career.",
    trainerFeedback: "High quality class delivery and student engagement.",
    beforePerception: "Uncertain of practical utility",
    afterPerception: "Extremely useful for MBA studies and business",
    verdict: "Excellent",
    finalMessage: "It's very helpful for my studies",
    category: "tools",
    avatar: "MR"
  },
  {
    id: "muneer",
    name: "Mohammed Muneer",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "NotebookLM & Gamma",
    activity: "Interactive sessions & NotebookLM exploration",
    quote: "Interactive sessions with practical tools like NotebookLM and Gamma made AI approachable. I thought AI was hard — now I think AI is good and practical for management!",
    trainerFeedback: "Engaging discussions and clear tool walkthroughs.",
    beforePerception: "Thought AI was hard",
    afterPerception: "Now I think AI is good, approachable, and actionable",
    verdict: "Ideas & Practical",
    category: "mindset",
    avatar: "MM"
  },
  {
    id: "rihaba",
    name: "Rihaba A",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "NotebookLM",
    activity: "Interactive game sessions & research",
    quote: "They teach us very clearly and with great understanding! I thought AI was just a tool for answering questions. Now I think AI is a powerful tool that helps us learn, research, and present.",
    trainerFeedback: "Clear, patient teaching with deep domain knowledge.",
    beforePerception: "Just a tool for answering questions",
    afterPerception: "Powerful tool that can help us learn and lead",
    verdict: "Excellent",
    finalMessage: "Thank you for the session",
    category: "tools",
    avatar: "RA"
  },
  {
    id: "anushree",
    name: "Anushree K P",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Canva AI & Video Tools",
    activity: "Making AI video & slide preparation",
    quote: "Good presentation, interactive quiz, and exciting activities! Creating AI presentations was difficult to do before, now it's super easy to use.",
    trainerFeedback: "Interactive delivery with high student participation.",
    beforePerception: "Difficult to use",
    afterPerception: "Easy to use for presentations and projects",
    verdict: "Awesome",
    finalMessage: "Keep growing",
    category: "tools",
    avatar: "KP"
  },
  {
    id: "fidhas2",
    name: "Fathima Fidha S",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Gamma AI",
    activity: "AI video and PPT generation",
    quote: "Good activities and quiz sessions! Creating presentations with AI was very exciting. I thought AI was difficult — now I think AI is good and approachable.",
    trainerFeedback: "Engaging activities and approachable atmosphere.",
    beforePerception: "Thought AI was difficult",
    afterPerception: "Now I think AI is good and approachable",
    verdict: "Good & Interactive",
    finalMessage: "Keep know",
    category: "tools",
    avatar: "FS"
  },
  {
    id: "ronaoff",
    name: "Ronaoff",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Video & Prompt AI",
    activity: "AI editing & prompt engineering",
    quote: "The hands-on editing and AI presentation tools were very engaging. I thought AI was hard and difficult, but now I think it is easy, useful, and good.",
    trainerFeedback: "Hands-on guidance and clear demonstrations.",
    beforePerception: "Thought AI was hard and difficult",
    afterPerception: "Now I think it is easy, useful, and good",
    verdict: "Great Improvement",
    category: "mindset",
    avatar: "RF"
  },
  {
    id: "shadha",
    name: "Fathima Shadha",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT & Visual AI",
    activity: "Creating AI videos & presentations",
    quote: "Good, nice, and very engaging activities! I thought AI was difficult — now I think AI is good and very helpful.",
    trainerFeedback: "Active mentoring and helpful feedback.",
    beforePerception: "Thought AI was difficult",
    afterPerception: "Now I think AI is good and very helpful",
    verdict: "Good & Helpful",
    finalMessage: "Overall good",
    category: "tools",
    avatar: "SD"
  },
  {
    id: "hasna",
    name: "Fathimath Hasna K",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "Gamma AI & NotebookLM",
    activity: "Hands-on activities & NotebookLM",
    quote: "Both trainers explained everything so well! Becoming familiar with new AI tools and testing activities was marvelous. Thank you for the session!",
    trainerFeedback: "Both Prajwal and Mayur taught with enthusiasm and clarity.",
    beforePerception: "Unsure of how AI tools function",
    afterPerception: "Familiar and confident with new AI tools",
    verdict: "Marvelous",
    finalMessage: "Thank you for the session",
    category: "trainers",
    avatar: "HK"
  },
  {
    id: "fidhap",
    name: "Fathima Fidha P",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "NotebookLM & Gamma",
    activity: "Presentation & new AI tools exploration",
    quote: "Their presentation and communication with us was great! I thought AI was not fully helpful — now I think AI is very useful for our MBA careers.",
    trainerFeedback: "Strong presentation and open communication.",
    beforePerception: "Thought AI was not fully helpful",
    afterPerception: "Now I think AI is very useful for our MBA careers",
    verdict: "Very Useful",
    finalMessage: "Nice workshop",
    category: "mindset",
    avatar: "FP"
  },
  {
    id: "famisa",
    name: "Famisa Vanna",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT",
    activity: "Interactive AI learning",
    quote: "Taught all the topics very well with high focus on student understanding. I thought AI was basic — now I think AI is amazing!",
    trainerFeedback: "High focus and patience with student queries.",
    beforePerception: "Thought AI was basic",
    afterPerception: "Now I think AI is amazing and comprehensive",
    verdict: "Great Session",
    category: "trainers",
    avatar: "FV"
  },
  {
    id: "hashir",
    name: "Mohammed Hashir KA",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT",
    activity: "Interactive sessions",
    quote: "Very nice trainers and engaging class! I thought AI was tough — now I think AI is much easier.",
    trainerFeedback: "Friendly and highly communicative throughout.",
    beforePerception: "Thought AI was tough",
    afterPerception: "Now I think AI is much easier and accessible",
    verdict: "Engaging",
    finalMessage: "Thank you for everything",
    category: "trainers",
    avatar: "HK"
  },
  {
    id: "hashim",
    name: "Hashim",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Very Engaging",
    confidence: "Very Confident",
    primaryTool: "ChatGPT & Business AI",
    activity: "AI tools for productivity",
    quote: "Very useful and engaging session on AI tools for business productivity. The instructors made complex workflows simple to follow.",
    trainerFeedback: "Structured presentation and actionable takeaways.",
    beforePerception: "Theoretical understanding only",
    afterPerception: "Hands-on practical business competence",
    verdict: "Very Useful",
    category: "tools",
    avatar: "HM"
  },
  {
    id: "nayan",
    name: "Nayan Pradeep",
    role: "1st Year MBA Candidate",
    institution: "Monti International Institute of Management Studies",
    rating: 5,
    usefulness: "Very Useful",
    engagement: "Extremely Engaging",
    confidence: "Extremely Confident",
    primaryTool: "ChatGPT & AI Suite",
    activity: "AI tools mastery",
    quote: "All good! From hard to use, to easy to use in business workflows. Prajwal and Mayur made the concepts super accessible and practical.",
    trainerFeedback: "Clear, friendly, and practical guidance.",
    beforePerception: "Hard to use",
    afterPerception: "Easy to use in business workflows",
    verdict: "All Good",
    finalMessage: "All good",
    category: "mindset",
    avatar: "NP"
  }
];

// Spotlight Card with mouse glow
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative group overflow-hidden bg-[#0C0C0E]/90 backdrop-blur-xl border border-white/10 rounded-[28px] transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
};

// Single Review Card component
export const StudentReviewCard = ({ review }: { review: StudentReview }) => {
  return (
    <SpotlightCard className="p-7 md:p-8 h-full flex flex-col justify-between">
      {/* Decorative Quote Mark */}
      <div className="absolute top-6 right-6 text-white/5 pointer-events-none select-none">
        <Quote size={64} strokeWidth={1} />
      </div>

      <div>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-1">
            {Array.from({ length: review.rating }).map((_, j) => (
              <Star
                key={j}
                size={14}
                className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
              />
            ))}
            <span className="text-xs font-semibold text-amber-300 ml-1.5">5.0</span>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {review.verdict}
          </span>
        </div>

        {/* Student Quote */}
        <p className="text-base text-zinc-200 leading-relaxed font-normal mb-6 relative">
          "{review.quote}"
        </p>

        {/* Mindset Transformation Pill (Before -> After) */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Before
            </span>
            <span className="truncate">{review.beforePerception}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[10px] font-medium uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              After <ArrowRight size={10} />
            </span>
            <span className="truncate">{review.afterPerception}</span>
          </div>
        </div>

        {/* Tool & Activity Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-white/5">
            <Wand2 size={11} className="text-purple-400" />
            {review.primaryTool}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-800/50 text-zinc-400 border border-white/5">
            <Brain size={11} className="text-indigo-400" />
            {review.activity}
          </span>
        </div>
      </div>

      {/* Student Author Footer */}
      <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-purple-500 to-indigo-700 text-white shadow-inner">
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-white tracking-tight">{review.name}</h4>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400">{review.role}</p>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"marquee" | "grid">("marquee");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered reviews
  const filteredReviews = workshopReviews.filter((item) => {
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

  // Split into two sets for dual-row marquee
  const midPoint = Math.ceil(workshopReviews.length / 2);
  const rowOne = workshopReviews.slice(0, midPoint);
  const rowTwo = workshopReviews.slice(midPoint);

  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-[#050507]">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-40" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Institutional Verification Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <School size={15} className="text-purple-400" />
            <span className="text-xs md:text-sm font-medium text-zinc-300 tracking-wide">
              Campus Masterclass • Monti International Institute of Management Studies • Sep 22–25, 2026
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
            Gen AI Tools For Business
          </h2>

          <p className="text-2xl md:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-zinc-400 mb-6">
            Real Feedback from 1st Year MBA Students
          </p>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-zinc-400 font-normal leading-relaxed">
            4-Day Intensive Bootcamp conducted on September 22, 23, 24, and 25, 2026 by Buildicy leadership (Prajwal & Mayur) at Monti International Institute of Management Studies, Perunthalmanna. Here is what the management cohort experienced firsthand.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-1">5.0 / 5.0</div>
              <div className="text-xs text-zinc-400">Cohort Satisfaction</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">100%</div>
              <div className="text-xs text-zinc-400">Mindset Shift (Hard &rarr; Easy)</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">MBA Y1</div>
              <div className="text-xs text-zinc-400">{workshopReviews.length} Student Reviews</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">Hands-On</div>
              <div className="text-xs text-zinc-400">NotebookLM, Gamma, GPT</div>
            </div>
          </div>
        </motion.div>

        {/* Controls Bar: Filters & View Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: `All Reviews (${workshopReviews.length})` },
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

          {/* View Mode Toggle & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {viewMode === "grid" && (
              <div className="relative flex-grow md:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search student or tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            )}

            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
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
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Browse All ({filteredReviews.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: DUAL-DIRECTION INFINITE MARQUEE */}
      {viewMode === "marquee" && (
        <div className="relative flex flex-col gap-6 py-4">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes testimonial-scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes testimonial-scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-marquee-left {
              animation: testimonial-scroll-left 75s linear infinite;
              will-change: transform;
            }
            .animate-marquee-right {
              animation: testimonial-scroll-right 75s linear infinite;
              will-change: transform;
            }
            .animate-marquee-left:hover, .animate-marquee-right:hover {
              animation-play-state: paused;
            }
          `,
            }}
          />

          {/* Fade gradients on edges */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#050507] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#050507] to-transparent z-20 pointer-events-none" />

          {/* Row 1: Left */}
          <div className="flex w-max animate-marquee-left transform-gpu">
            {[...rowOne, ...rowOne].map((review, i) => (
              <div key={`${review.id}-${i}`} className="w-[360px] md:w-[420px] flex-shrink-0 pr-6">
                <StudentReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Row 2: Right */}
          <div className="flex w-max animate-marquee-right transform-gpu">
            {[...rowTwo, ...rowTwo].map((review, i) => (
              <div key={`${review.id}-row2-${i}`} className="w-[360px] md:w-[420px] flex-shrink-0 pr-6">
                <StudentReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE GRID WITH SEARCH */}
      {viewMode === "grid" && (
        <div className="max-w-7xl mx-auto px-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
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

      {/* Institutional Guarantee Footer Note */}
      <div className="max-w-4xl mx-auto mt-16 px-6 text-center">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Host an AI Workshop at Your Institution</p>
              <p className="text-xs text-zinc-400">
                Customized masterclasses on Generative AI for management, engineering, and business schools.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/reviews"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
            >
              <span>View Reviews Tab</span>
              <ArrowRight size={13} />
            </Link>
            <a
              href="mailto:contact@buildicy.com?subject=Inquiry:%20Gen%20AI%20Campus%20Workshop"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10 flex-shrink-0"
            >
              Invite as Speaker
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;