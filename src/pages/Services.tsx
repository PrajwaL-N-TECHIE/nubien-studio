import SEO from "@/components/SEO";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import FooterCTA from "@/components/FooterCTA";
import PageTransition from "@/components/PageTransition";

const Services = () => {
  return (
    <PageTransition>
      <SEO 
        title="Our Services | AI Engineering & Cinematic UX Design | Buildicy"
        description="Explore our core services: Next-Gen UI/UX, AI Software Engineering, Web3 Infrastructures, and Intelligent Automation designed for deep engagement and performance."
        canonicalUrl="/services"
      />
      <div className="pt-32"> {/* Spacer for Navbar */}
        <FeaturesSection />
        <ServicesSection />
        <TechStackSection />
        <PricingSection />
        <FooterCTA />
      </div>
    </PageTransition>
  );
};
export default Services;