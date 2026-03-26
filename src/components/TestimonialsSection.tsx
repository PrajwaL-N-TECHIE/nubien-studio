import { useRef, useState, useEffect } from "react";
import { motion, useInView, useAnimation, useMotionTemplate, useMotionValue } from "framer-motion";
import { Star, Sparkles, Quote } from "lucide-react";

// Expanded list for the infinite loop effect
const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO, NexaFlow",
    quote: "Buildicy transformed our entire data pipeline with AI. The results exceeded every expectation we had.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Founder, PixelMind",
    quote: "Their computer vision solution automated 80% of our quality control. Absolutely game-changing.",
    rating: 5,
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "VP Engineering, Synapse",
    quote: "The chatbot they built handles 10k daily conversations seamlessly. Best investment we've made.",
    rating: 5,
    avatar: "EW",
  },
  {
    name: "David Kim",
    role: "Product Lead, Vertex",
    quote: "The speed and precision with which Buildicy deployed our LLM models was truly world-class.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Elena Rostova",
    role: "Director of Ops, Nexus",
    quote: "We cut operational costs by 40% in just three months using their predictive analytics engine.",
    rating: 5,
    avatar: "ER",
  }
];

// --------------------------------------------------------------------------
// PREMIUM SPOTLIGHT CARD COMPONENT (Mouse tracking glow)
// --------------------------------------------------------------------------
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative group overflow-hidden bg-[#0C0C0E]/80 backdrop-blur-xl border border-white/5 rounded-[32px] transition-colors hover:border-white/10 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// --------------------------------------------------------------------------
// MAIN SECTION
// --------------------------------------------------------------------------
const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Duplicate the array to create a seamless infinite loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="relative py-32 overflow-hidden bg-[#050507]">

      {/* Absolute Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div ref={ref} className="relative z-10 w-full">

        {/* -------------------------------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-sm font-medium text-zinc-300 uppercase tracking-widest">Client Success</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight mb-2 text-white"
          >
            Trusted by Industry
          </motion.h2>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500">
              Leaders Worldwide.
            </span>
          </motion.h2>
        </motion.div>

        {/* -------------------------------------------------------------------------- */}
        {/* INFINITE SCROLLING MARQUEE */}
        {/* -------------------------------------------------------------------------- */}
        <div className="relative flex overflow-hidden group py-4">

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes testimonial-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-testimonials {
              animation: testimonial-scroll 60s linear infinite;
              will-change: transform;
            }
            .animate-testimonials:hover {
              animation-play-state: paused;
            }
          `}} />

          {/* Edge Gradients for smooth fade in/out */}
          <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#050507] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#050507] to-transparent z-20 pointer-events-none" />

          <div className="flex w-max animate-testimonials transform-gpu">
            {duplicatedTestimonials.map((t, i) => (
              <div key={i} className="w-[400px] md:w-[450px] flex-shrink-0 pr-6">
                <SpotlightCard className="p-10 h-full flex flex-col whitespace-normal will-change-transform">

                  {/* Decorative Quote Icon */}
                  <div className="absolute top-8 right-8 text-white/5">
                    <Quote size={80} strokeWidth={1} />
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-8">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-10 flex-grow font-light">
                    "{t.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-purple-500 to-purple-800 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white tracking-wide">{t.name}</p>
                      <p className="text-sm text-purple-400/80 font-medium tracking-wide uppercase mt-0.5">{t.role}</p>
                    </div>
                  </div>

                </SpotlightCard>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;