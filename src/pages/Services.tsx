import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import PageTransition from "@/components/PageTransition";

const Services = () => {
  return (
    <PageTransition>
      <div className="pt-32"> {/* Spacer for Navbar */}
        <FeaturesSection />
        <ServicesSection />
        <PricingSection />
      </div>
    </PageTransition>
  );
};
export default Services;