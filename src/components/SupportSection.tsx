import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fanImages = [
  { gradient: "linear-gradient(135deg, hsl(20 60% 25%) 0%, hsl(30 40% 15%) 100%)", rotate: -25, x: -160 },
  { gradient: "linear-gradient(135deg, hsl(35 70% 30%) 0%, hsl(20 50% 18%) 100%)", rotate: -15, x: -90 },
  { gradient: "linear-gradient(135deg, hsl(90 50% 25%) 0%, hsl(130 30% 15%) 100%)", rotate: -5, x: -20 },
  { gradient: "linear-gradient(135deg, hsl(200 60% 30%) 0%, hsl(220 40% 18%) 100%)", rotate: 5, x: 50 },
  { gradient: "linear-gradient(135deg, hsl(30 60% 35%) 0%, hsl(20 40% 20%) 100%)", rotate: 15, x: 120 },
  { gradient: "linear-gradient(135deg, hsl(40 60% 30%) 0%, hsl(30 40% 20%) 100%)", rotate: 25, x: 190 },
];

const SupportSection = () => {
  const ref = useRef(null);
  const fanRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const fanInView = useInView(fanRef, { once: true, margin: "-80px" });

  return (
    <section
      id="faq"
      className="py-24 px-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, hsl(262 60% 20% / 0.5) 0%, transparent 70%)",
      }}
    >
      <div ref={ref} className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="badge-pill inline-flex mb-6"
        >
          <span className="badge-dot"><div className="w-2 h-2 rounded-full border border-white/60" /></span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>24/7 Support</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl md:text-6xl font-light mb-3"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Here When You
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-4xl md:text-6xl font-light mb-6"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Need Us Most Important.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-base max-w-md mx-auto mb-8"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Nubien comes with dedicated support to help you launch and maintain your site without friction.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-4 rounded-2xl text-sm font-semibold mb-20"
          style={{ background: "hsl(var(--primary))", color: "white" }}
        >
          View About Reboot
        </motion.button>

        {/* Fan of images */}
        <div ref={fanRef} className="relative h-56 flex items-center justify-center">
          {/* Speech bubbles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={fanInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", bounce: 0.5 }}
            className="absolute top-0 left-1/4 z-20 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(180 100% 50%)", color: "hsl(240 10% 5%)", transform: "rotate(-5deg)" }}
          >
            Hey, It's me!
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={fanInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.65, type: "spring", bounce: 0.5 }}
            className="absolute top-0 right-1/4 z-20 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(var(--primary))", color: "white", transform: "rotate(5deg)" }}
          >
            Problem Solved
          </motion.div>

          {/* Fan cards */}
          <div className="relative flex items-end justify-center" style={{ height: "180px", width: "500px" }}>
            {fanImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60, rotate: 0 }}
                animate={fanInView ? { opacity: 1, y: 0, rotate: img.rotate } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + i * 0.08,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  width: "110px",
                  height: "150px",
                  background: img.gradient,
                  transformOrigin: "bottom center",
                  border: "2px solid hsl(var(--border))",
                  bottom: 0,
                  left: "50%",
                  marginLeft: "-55px",
                  translateX: `${img.x}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
