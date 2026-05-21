import SEO from "@/components/SEO";
import LaboratorySection from "@/components/LaboratorySection";
import SupportSection from "@/components/SupportSection";
import FAQSection from "@/components/FAQSection";
import PageTransition from "@/components/PageTransition";

const Company = () => {
  return (
    <PageTransition>
      <SEO 
        title="About Buildicy | Our Vision & Leadership Team"
        description="Meet the elite team behind Buildicy. We combine engineering precision with human-centered design to architect the future of intelligent digital solutions."
        canonicalUrl="/company"
      />
      <div className="pt-32">
        <LaboratorySection />
        <SupportSection />
        <FAQSection />
      </div>
    </PageTransition>
  );
};
export default Company;