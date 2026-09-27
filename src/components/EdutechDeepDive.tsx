import { motion } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  TrendingUp,
  Code2,
  Presentation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import Magnetic from "./Magnetic";

const edutechTracks = [
  {
    number: "01",
    title: "Paid Internship Training",
    badge: "Stipend-Backed Program",
    desc: "Hands-on software engineering training where students work directly on live production SaaS applications, AI models, and real client systems with 1-on-1 mentorship.",
    points: [
      "Real-world production codebase experience",
      "Stipend-backed tracks for top-performing interns",
      "Mentorship from experienced full-stack & AI engineers",
      "Verifiable tamper-proof digital completion certificate",
    ],
    primaryActionText: "Apply for Internship",
    primaryActionLink: "/internship-registration",
    secondaryActionText: "Verify Credentials",
    secondaryActionLink: "/verify",
    isExternal: false,
    icon: Briefcase,
    accent: "purple",
  },
  {
    number: "02",
    title: "Webinars & Career Accelerators",
    badge: "Recent Tech Trends",
    desc: "Interactive webinars, seminars, and intensive career accelerator programs on the latest industry technologies — Generative AI, system design, cloud scaling, and modern stacks.",
    points: [
      "Masterclasses on Generative AI & LLM integration",
      "System design and high-concurrency architecture",
      "Resume building and technical interview prep",
      "Hands-on live coding workshops with Q&A",
    ],
    primaryActionText: "Join Next Webinar",
    actionType: "scouter",
    icon: TrendingUp,
    accent: "indigo",
  },
  {
    number: "03",
    title: "School Student Coding Classes",
    badge: "Junior Tech Academy",
    desc: "Specialized programming curriculum designed for school students (Ages 10-17) to foster logical reasoning, creative problem-solving, and foundational computer science early.",
    points: [
      "Interactive visual coding and logic building",
      "Python programming fundamentals and automation",
      "Building first personal websites and simple games",
      "Safe, beginner-friendly learning environment",
    ],
    primaryActionText: "Enroll School Student",
    actionType: "scouter",
    icon: Code2,
    accent: "blue",
  },
  {
    number: "04",
    title: "College & Corporate Guest Lectures",
    badge: "Keynote Speaking",
    desc: "Our founders and lead engineers deliver high-impact technical keynote sessions and seminars for universities, engineering colleges, school symposiums, and corporate tech teams.",
    points: [
      "College tech fests and national symposium keynotes",
      "Corporate tech talks on AI automation & SaaS trends",
      "Bridging the academia-industry knowledge gap",
      "Interactive technical AMA and career guidance",
    ],
    primaryActionText: "Invite as Guest Speaker",
    actionType: "scouter",
    icon: Presentation,
    accent: "fuchsia",
  },
];

export default function EdutechDeepDive() {
  const handleAction = (item: any) => {
    if (item.actionType === "scouter") {
      window.dispatchEvent(new CustomEvent("open-scouter"));
    }
  };

  return (
    <section id="edutech-deepdive" className="relative py-28 md:py-36 px-6 bg-[#08080C] overflow-hidden text-white border-b border-white/5">
      {/* Background Accent Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/3 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl mb-6 shadow-xl"
          >
            <GraduationCap size={14} className="text-purple-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-300 font-mono">
              Domain 01 • Edutech Hub
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 font-['Syne']"
          >
            Empowering Future Tech Leaders <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
              With Production Experience.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light"
          >
            From paid internship training on live production software and trending AI webinars, to foundational coding classes for school students and keynote speaker engagements for colleges and corporates.
          </motion.p>
        </div>

        {/* 4 Edutech Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {edutechTracks.map((track, i) => {
            const TrackIcon = track.icon;

            return (
              <div
                key={track.number}
                className="p-8 sm:p-10 rounded-[32px] bg-[#0C0C14] border border-white/5 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                      <TrackIcon size={24} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/5 text-zinc-400 border border-white/5">
                      {track.badge}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-purple-400 mb-1 block">
                    Program {track.number}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-['Syne']">
                    {track.title}
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light mb-6">
                    {track.desc}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2.5 mb-8">
                    {track.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-4">
                  {track.primaryActionLink ? (
                    <Link
                      to={track.primaryActionLink}
                      className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
                    >
                      <span>{track.primaryActionText}</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAction(track)}
                      className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <span>{track.primaryActionText}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {track.secondaryActionLink && (
                    <Link
                      to={track.secondaryActionLink}
                      className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-white/5"
                    >
                      <ShieldCheck size={14} className="text-purple-400" />
                      <span>{track.secondaryActionText}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-[#0C0C14] border border-white/5">
          {[
            { label: "Students Trained", value: "2,500+" },
            { label: "Campus Keynotes", value: "45+" },
            { label: "Placement Ratio", value: "94%" },
            { label: "Digital Certificates", value: "100% Verifiable" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-3">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
