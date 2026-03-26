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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
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
        <CoreVitalsHUD />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmoothScroll>
              {/* Global Layout Wrapper */}
              <div className="bg-[#050507] min-h-screen flex flex-col text-white">

                {/* Navbar with contact trigger */}
                <Navbar />

                {/* Main content area */}
                <main className="flex-grow">
                  <AnimatedRoutes />
                </main>

                {/* Footer with contact trigger */}
                <Footer />

                {/* Advanced Contact Onboarding Modal */}
                <AnimatePresence>
                  {isScouterOpen && (
                    <ContactScouter isOpen={isScouterOpen} onClose={() => setIsScouterOpen(false)} />
                  )}
                </AnimatePresence>

              </div>
            </SmoothScroll>
          </BrowserRouter>
        </TooltipProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
};

export default App;