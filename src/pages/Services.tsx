import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import FooterCTA from "@/components/FooterCTA";
import PageTransition from "@/components/PageTransition";

const Services = () => {
  return (
    <PageTransition>
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