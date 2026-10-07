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
import ExternalRedirect from "@/components/ExternalRedirect";

import PageLoader from "@/components/PageLoader";
import { useTheme } from "@/hooks/useTheme";
import { PerformanceProvider } from "@/context/PerformanceContext";
import { PORTAL_LINKS } from "@/config/links";

// Core Pages - Lazy loaded
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Company = lazy(() => import("./pages/Company"));
const RoiCalculator = lazy(() => import("./pages/RoiCalculator"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// We MUST extract the routes into a separate component so we can use `useLocation()`
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Core Agency Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/company" element={<Company />} />
          <Route path="/roi-calculator" element={<RoiCalculator />} />

          {/* Subdomain Micro-App Redirects */}
          <Route
            path="/internship-registration"
            element={<ExternalRedirect url={PORTAL_LINKS.internship} title="Internship Application Portal" />}
          />
          <Route
            path="/admin"
            element={<ExternalRedirect url={PORTAL_LINKS.admin} title="Admin Portal" />}
          />
          <Route
            path="/student-login"
            element={<ExternalRedirect url={PORTAL_LINKS.student} title="Student Portal" />}
          />
          <Route
            path="/student-dashboard"
            element={<ExternalRedirect url={PORTAL_LINKS.student} title="Student Portal" />}
          />
          <Route
            path="/verify"
            element={<ExternalRedirect url={PORTAL_LINKS.verify} title="Certificate Verification Portal" />}
          />
          <Route
            path="/buiz"
            element={<ExternalRedirect url={PORTAL_LINKS.arena} title="Buiz Arena" />}
          />
          <Route
            path="/buiz/host"
            element={<ExternalRedirect url={PORTAL_LINKS.host} title="Buiz Host Studio" />}
          />
          <Route
            path="/b-forms"
            element={<ExternalRedirect url={PORTAL_LINKS.forms} title="B-Forms Engine" />}
          />
          <Route
            path="/b-forms/*"
            element={<ExternalRedirect url={PORTAL_LINKS.forms} title="B-Forms Engine" />}
          />
          <Route
            path="/qr"
            element={<ExternalRedirect url={PORTAL_LINKS.qr} title="Buildicy QR Studio" />}
          />
          <Route
            path="/b-qr"
            element={<ExternalRedirect url={PORTAL_LINKS.qr} title="Buildicy QR Studio" />}
          />
          <Route
            path="/ai-sdr"
            element={<ExternalRedirect url={PORTAL_LINKS.sdr} title="AI SDR Suite" />}
          />
          <Route
            path="/crm"
            element={<ExternalRedirect url={PORTAL_LINKS.crm} title="Buildicy CRM" />}
          />
          <Route
            path="/b-crm"
            element={<ExternalRedirect url={PORTAL_LINKS.crm} title="Buildicy CRM" />}
          />
          <Route
            path="/finance"
            element={<ExternalRedirect url={PORTAL_LINKS.finance} title="Finance Portal" />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#050507] min-h-screen flex flex-col text-white">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => {
  const [isScouterOpen, setIsScouterOpen] = useState(false);
  useTheme(); // Initialize theme (dark/light) class on <html>

  // Allow triggering from anywhere via custom event for maximum flexibility
  useEffect(() => {
    const handleOpen = () => setIsScouterOpen(true);
    window.addEventListener("openContactScouter", handleOpen);
    return () => window.removeEventListener("openContactScouter", handleOpen);
  }, []);

  return (
    <PerformanceProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" theme="dark" richColors />
          <CustomCursor />
          <NoiseOverlay />
          <Preloader />
          <BrowserRouter>
            <SmoothScroll>
              <GlobalLayout>
                <AnimatedRoutes />
              </GlobalLayout>
            </SmoothScroll>

            <ContactScouter
              isOpen={isScouterOpen}
              onClose={() => setIsScouterOpen(false)}
            />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PerformanceProvider>
  );
};

export default App;