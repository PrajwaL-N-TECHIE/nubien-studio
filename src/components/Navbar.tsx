import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  ChevronRight,
  Globe,
  User,
  Settings,
  Phone,
  Mail,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Magnetic from "./Magnetic";

// --------------------------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------------------------
const navLinks = [
  { name: "Home", path: "/", icon: Sparkles },
  { name: "Services", path: "/services", icon: Zap },
  { name: "Portfolio", path: "/portfolio", icon: Globe },
  { name: "Company", path: "/company", icon: Settings },
];

// Premium easing curves
const springConfig = {
  type: "spring" as const,
  stiffness: 200,
  damping: 40,
  mass: 1.2,
};

const liquidSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 40,
  mass: 0.8,
};

const smoothEase = [0.16, 1, 0.3, 1] as const;
const elasticEase = [0.34, 1.56, 0.64, 1] as const;

// --------------------------------------------------------------------------
// PREMIUM MAGNETIC BUTTON (Enhanced)
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// PREMIUM LINK COMPONENT
// --------------------------------------------------------------------------
const NavLink = ({ link, isActive, onClick }: any) => {
  const [hovered, setHovered] = useState(false);
  const Icon = link.icon;

  return (
    <Magnetic strength={0.1} scale={1}>
      <Link
        to={link.path}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 overflow-hidden transition-colors"
      >
        {/* Background hover effect */}
        <motion.div
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            y: hovered ? 0 : 20,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-white/5 rounded-full"
        />

        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-purple-600/20 rounded-full"
            transition={liquidSpring}
          />
        )}

        <Icon size={14} className={`relative z-10 ${isActive ? 'text-purple-400' : 'text-white/60'}`} />

        <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/60'}`}>
          {link.name}
        </span>
      </Link>
    </Magnetic>
  );
};

// --------------------------------------------------------------------------
// MOBILE MENU COMPONENT
// --------------------------------------------------------------------------
const MobileMenu = ({ isOpen, onClose, onContactOpen }: any) => {
  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.3,
        ease: smoothEase,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-4 top-24 z-[50] w-[calc(100%-2rem)] md:w-[320px] rounded-3xl bg-[#050507]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden will-change-transform"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">Menu</span>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <X size={16} className="text-white/60" />
                </motion.button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      to={link.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Icon size={18} className="text-purple-400" />
                      <span className="text-white/80">{link.name}</span>
                      <ChevronRight size={16} className="ml-auto text-white/30" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact Info */}
            <div className="p-4 border-t border-white/5 bg-white/5">
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-white/60">
                  <Phone size={14} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-white/60">
                  <Mail size={14} />
                  <span>hello@buildicy.com</span>
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <div className="p-4 pt-0">
              <Magnetic strength={0.2} scale={1.02} className="w-full">
                <button
                  onClick={() => {
                    onClose();
                    onContactOpen();
                  }}
                  className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                >
                  Start a New Project
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity } as any}
                  >
                    <ArrowRight size={16} />
                  </motion.div>
                </button>
              </Magnetic>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --------------------------------------------------------------------------
// MAIN NAVBAR (Enhanced)
// --------------------------------------------------------------------------
const DynamicIslandNav = ({ onContactClick }: { onContactClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { scrollY } = useScroll();
  const location = useLocation();

  // Smooth scroll hide/show with spring (Liquid Easing)
  const navY = useSpring(0, { stiffness: 150, damping: 35, mass: 1 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);

    // Hide on scroll down, show on scroll up
    if (latest > prevScrollY && latest > 200) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setPrevScrollY(latest);
  });

  // Update nav position based on visibility
  useEffect(() => {
    navY.set(isVisible ? 0 : -100);
  }, [isVisible, navY]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isExpanded = !isScrolled || isHovered;

  // Dynamic width based on state
  const navWidth = isExpanded ? "auto" : "160px";

  return (
    <>
      {/* Desktop Nav */}
      <motion.div
        style={{ y: navY }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-6 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4"
      >
        <motion.nav
          layout
          layoutRoot
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          transition={liquidSpring}
          style={{ width: navWidth }}
          className="relative flex items-center p-2 rounded-full pointer-events-auto overflow-hidden will-change-[width,transform]"
        >
          {/* Gradient Border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(255,255,255,0.1))",
              padding: "1px",
            }}
          >
            <div className="w-full h-full rounded-full bg-[#050507]/90 backdrop-blur-2xl" />
          </motion.div>

          {/* Inner Content */}
          <div className="relative z-10 flex items-center w-full">
            <Magnetic strength={0.2} scale={1.05}>
              <Link to="/" className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg width="28" height="30" viewBox="0 0 68 72" fill="none">
                    <path d="M8 54 L34 68 L60 54 L34 40 Z" fill="#5b21b6" />
                    <path d="M14 36 L34 46 L54 36 L34 26 Z" fill="#7c3aed" />
                    <path d="M20 15.5 L34 22.5 L48 15.5 L34 8.5 Z" fill="#c084fc" />
                    <circle cx="34" cy="8.5" r="3.5" fill="white" />
                  </svg>
                </div>

                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="text-lg font-extrabold text-white tracking-tighter font-['Syne'] italic"
                    >
                      Buildicy
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Magnetic>

            <div className="hidden md:flex items-center">
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ ...springConfig, delay: 0.1 }}
                    className="flex items-center gap-1 px-4"
                  >
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.name}
                        link={link}
                        isActive={location.pathname === link.path}
                      />
                    ))}

                    {/* Desktop CTA */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.2 }}
                      className="ml-2 pl-4 border-l border-white/10"
                    >
                      <Magnetic strength={0.2} scale={1.05}>
                        <button
                          onClick={onContactClick}
                          className="px-6 py-2.5 rounded-full text-sm font-bold bg-purple-600 text-white flex items-center gap-2 group shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                          Get In Touch
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity } as any}
                          >
                            <ArrowRight size={14} />
                          </motion.div>
                        </button>
                      </Magnetic>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="md:hidden ml-2 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
            >
              <Menu size={18} className="text-white/60" />
            </motion.button>
          </div>
        </motion.nav>
      </motion.div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onContactOpen={onContactClick}
      />
    </>
  );
};

export default DynamicIslandNav;