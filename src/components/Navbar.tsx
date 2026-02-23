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
import ContactModal from "./ContactModal";

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
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

const smoothEase = [0.4, 0, 0.2, 1]; // Custom cubic-bezier for smooth transitions
const elasticEase = [0.34, 1.56, 0.64, 1]; // Elastic for premium bounce

// --------------------------------------------------------------------------
// PREMIUM MAGNETIC BUTTON (Enhanced)
// --------------------------------------------------------------------------
const MagneticButton = ({ children, className, onClick, glow = false }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-30, 30], [5, -5]);
  const rotateY = useTransform(x, [-30, 30], [-5, 5]);

  const mouseX = useSpring(x, { stiffness: 400, damping: 30, mass: 0.5 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 30, mass: 0.5 });
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: any) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        x: mouseX,
        y: mouseY,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 500,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {hovered && glow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-purple-500/20 blur-xl"
          />
        )}
      </AnimatePresence>
      
      {/* Content with smooth scale on hover */}
      <motion.div
        animate={{ scale: hovered ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex items-center gap-2"
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

// --------------------------------------------------------------------------
// PREMIUM LINK COMPONENT
// --------------------------------------------------------------------------
const NavLink = ({ link, isActive, onClick }: any) => {
  const [hovered, setHovered] = useState(false);
  const Icon = link.icon;

  return (
    <Link
      to={link.path}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 overflow-hidden"
    >
      {/* Background hover effect */}
      <motion.div
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-white/5 rounded-full"
      />
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-purple-600/20 rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      
      {/* Icon with smooth animation */}
      <motion.div
        animate={{
          rotate: hovered ? 5 : 0,
          scale: hovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Icon size={14} className="relative z-10" />
      </motion.div>
      
      {/* Text with subtle animation */}
      <motion.span
        animate={{
          x: hovered ? 2 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {link.name}
      </motion.span>
    </Link>
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
      transition: {
        duration: 0.3,
        ease: smoothEase,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: smoothEase,
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
            className="fixed right-4 top-24 z-[50] w-[320px] rounded-3xl bg-[#050507]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
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
                  <span>hello@nubien.com</span>
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <div className="p-4 pt-0">
              <MagneticButton
                onClick={() => {
                  onClose();
                  onContactOpen();
                }}
                className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white flex items-center justify-center gap-2 group"
                glow={true}
              >
                Start a New Project
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </MagneticButton>
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
const DynamicIslandNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { scrollY } = useScroll();
  const location = useLocation();

  // Smooth scroll hide/show with spring
  const navY = useSpring(0, { stiffness: 300, damping: 30 });
  
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          transition={springConfig}
          style={{ width: navWidth }}
          className="relative flex items-center p-2 rounded-full pointer-events-auto overflow-hidden"
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
            <Link to="/">
              <motion.div
                layout
                className="flex items-center gap-2.5 px-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    rotate: isHovered ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-lg"
                >
                  <Sparkles size={16} className="text-white" />
                </motion.div>

                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: -10 }}
                      animate={{ opacity: 1, width: "auto", x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -10 }}
                      transition={springConfig}
                      className="text-base font-bold text-white whitespace-nowrap pr-2"
                    >
                      Nubien
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

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
                      <MagneticButton
                        onClick={() => setIsContactOpen(true)}
                        className="px-6 py-2.5 rounded-full text-sm font-bold bg-purple-600 text-white flex items-center gap-2 group"
                        glow={true}
                      >
                        Get In Touch
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={14} />
                        </motion.div>
                      </MagneticButton>
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
        onContactOpen={() => setIsContactOpen(true)}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};

export default DynamicIslandNav;