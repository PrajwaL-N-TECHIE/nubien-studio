import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Company from "./pages/Company";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// We MUST extract the routes into a separate component so we can use `useLocation()`
// `useLocation` only works if it is rendered INSIDE the <BrowserRouter>
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // mode="wait" ensures the old page fades out completely BEFORE the new page renders
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/company" element={<Company />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Global Layout Wrapper */}
        <div className="bg-[#050507] min-h-screen flex flex-col text-white">
          
          {/* Navbar sits outside the routes so it never unmounts/flashes */}
          <Navbar />
          
          {/* Main content area */}
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>

          {/* Footer sits outside the routes so the 3D Neural knot doesn't reload constantly */}
          <Footer />
          
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;