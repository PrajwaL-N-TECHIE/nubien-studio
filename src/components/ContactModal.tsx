import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Mail, User, MessageSquare, Phone, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// --------------------------------------------------------------------------
// THREE.JS PURPLE PARTICLE BACKGROUND
// --------------------------------------------------------------------------
const PurpleParticles = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = (Math.random() - 0.5) * 30;
      posArray[i + 2] = (Math.random() - 0.5) * 30;
      
      // Color - Purple shades
      const purpleIntensity = 0.5 + Math.random() * 0.5;
      colorArray[i] = 0.6; // R
      colorArray[i + 1] = 0.3; // G
      colorArray[i + 2] = 1.0; // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesRef.current = particlesMesh;

    // Add a few larger purple spheres for depth
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.15 });
    
    for (let i = 0; i < 5; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      scene.add(sphere);
    }

    // Animation
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
        particlesRef.current.rotation.x += 0.0002;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
};

// --------------------------------------------------------------------------
// CONTACT MODAL
// --------------------------------------------------------------------------
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.8,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop with subtle gradient */}
          <div className="absolute inset-0 bg-black/90" />
          
          {/* Three.js Background */}
          <PurpleParticles />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-4xl"
          >
            <div className="relative overflow-hidden rounded-3xl bg-[#0A0A0F]/95 backdrop-blur-sm border border-purple-500/20 shadow-2xl shadow-purple-500/10">
              {/* Purple accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              
              {/* Content Grid */}
              <div className="relative grid md:grid-cols-2 gap-0">
                {/* Left Side - Info */}
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-8 border-r border-purple-500/10 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent"
                >
                  <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Contact</h2>
                      <p className="text-purple-400 text-sm">Get in touch</p>
                    </div>
                  </motion.div>

                  <motion.p variants={itemVariants} className="text-gray-400 mb-8 leading-relaxed">
                    Have a project in mind? We're ready to bring your ideas to life with cutting-edge technology and creative solutions.
                  </motion.p>

                  {/* Contact Info */}
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Mail, label: "Email", value: "hello@nubien.com", delay: 0 },
                      { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", delay: 1 },
                      { icon: MapPin, label: "Studio", value: "San Francisco, CA", delay: 2 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        variants={itemVariants}
                        custom={i}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-default"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-600/20 group-hover:bg-purple-600/30 flex items-center justify-center transition-colors">
                          <item.icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="text-sm text-white">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Availability Badge */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-gray-400">Available for new projects</span>
                  </motion.div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-8"
                >
                  {/* Close Button */}
                  <motion.button
                    variants={itemVariants}
                    onClick={onClose}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/50 border border-purple-500/20 flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-purple-400" />
                  </motion.button>

                  <motion.h3 variants={itemVariants} className="text-xl font-semibold text-white mb-6">
                    Send a Message
                  </motion.h3>

                  <form className="space-y-5">
                    {/* Name Field */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-xs text-purple-400 mb-2 ml-1">
                        YOUR NAME
                      </label>
                      <div className="relative">
                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                          focusedField === "name" ? "text-purple-400" : "text-purple-600/40"
                        }`} />
                        <input
                          type="text"
                          placeholder="John Doe"
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          onMouseEnter={() => setHoveredField("name")}
                          onMouseLeave={() => setHoveredField(null)}
                          className="w-full rounded-xl bg-black/50 border border-purple-500/20 pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-xs text-purple-400 mb-2 ml-1">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                          focusedField === "email" ? "text-purple-400" : "text-purple-600/40"
                        }`} />
                        <input
                          type="email"
                          placeholder="hello@example.com"
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          onMouseEnter={() => setHoveredField("email")}
                          onMouseLeave={() => setHoveredField(null)}
                          className="w-full rounded-xl bg-black/50 border border-purple-500/20 pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Message Field */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-xs text-purple-400 mb-2 ml-1">
                        MESSAGE
                      </label>
                      <div className="relative">
                        <MessageSquare className={`absolute left-4 top-5 w-4 h-4 transition-colors ${
                          focusedField === "message" ? "text-purple-400" : "text-purple-600/40"
                        }`} />
                        <textarea
                          placeholder="Tell us about your project..."
                          rows={4}
                          onFocus={() => setFocusedField("message")}
                          onBlur={() => setFocusedField(null)}
                          onMouseEnter={() => setHoveredField("message")}
                          onMouseLeave={() => setHoveredField(null)}
                          className="w-full rounded-xl bg-black/50 border border-purple-500/20 pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        />
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full relative group overflow-hidden rounded-xl bg-purple-600 hover:bg-purple-700 transition-all px-6 py-4"
                      >
                        {/* Ripple effect on hover */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 4, opacity: 0.2 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 bg-white rounded-full"
                        />
                        
                        <div className="relative flex items-center justify-center gap-3 font-medium text-white">
                          <Send className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          Send Message
                        </div>
                      </motion.button>
                    </motion.div>

                    {/* Security Note */}
                    <motion.p 
                      variants={itemVariants}
                      className="text-center text-xs text-gray-600 mt-4"
                    >
                      Your information is encrypted and secure
                    </motion.p>
                  </form>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;