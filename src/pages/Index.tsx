import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import PortfolioSection from "@/components/PortfolioSection";
import SupportSection from "@/components/SupportSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <AboutSection />
        <FeaturesSection />
        <ServicesSection />
        <TestimonialsSection />
        <PricingSection />
        <PortfolioSection />
        <SupportSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
