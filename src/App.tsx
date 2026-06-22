import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";
import ContactScouter from "@/components/ContactScouter";
import CoreVitalsHUD from "@/components/CoreVitalsHUD";
import { PerformanceProvider } from "@/context/PerformanceContext";

// Pages - Lazy loaded
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Company = lazy(() => import("./pages/Company"));
const InternshipRegistration = lazy(() => import("./pages/InternshipRegistration"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const BuizClient = lazy(() => import("./pages/BuizClient"));
const BuizHost = lazy(() => import("./pages/BuizHost"));
const AiSdrDashboard = lazy(() => import("./pages/AiSdrDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// We MUST extract the routes into a separate component so we can use `useLocation()`
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/company" element={<Company />} />
          <Route path="/internship-registration" element={<InternshipRegistration />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/buiz" element={<BuizClient />} />
          <Route path="/buiz/host" element={<BuizHost />} />
          <Route path="/ai-sdr" element={<AiSdrDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isStandaloneRoute = location.pathname.includes('/student-dashboard') || location.pathname.includes('/student-login') || location.pathname.includes('/admin') || location.pathname.includes('/buiz');

  return (
    <div className="bg-[#050507] min-h-screen flex flex-col text-white">
      {!isStandaloneRoute && <Navbar />}
      
      <main className="flex-grow">
        {children}
      </main>

      {!isStandaloneRoute && <Footer />}
      {!isStandaloneRoute && <CoreVitalsHUD />}
    </div>
  );
};

const App = () => {
  const [isScouterOpen, setIsScouterOpen] = useState(false);

  // Allow triggering from anywhere via custom event for maximum flexibility
  useEffect(() => {
    const handleOpen = () => setIsScouterOpen(true);
    window.addEventListener("open-scouter", handleOpen);
    return () => window.removeEventListener("open-scouter", handleOpen);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <Preloader />
        <CustomCursor />
        <NoiseOverlay />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmoothScroll>
              {/* Global Layout Wrapper handles conditional Navbar/Footer */}
              <GlobalLayout>
                <AnimatedRoutes />
              </GlobalLayout>

              {/* Advanced Contact Onboarding Modal */}
              <AnimatePresence>
                {isScouterOpen && (
                  <ContactScouter isOpen={isScouterOpen} onClose={() => setIsScouterOpen(false)} />
                )}
              </AnimatePresence>
            </SmoothScroll>
          </BrowserRouter>
        </TooltipProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
};

export default App;