import LaboratorySection from "@/components/LaboratorySection";
import SupportSection from "@/components/SupportSection";
import FAQSection from "@/components/FAQSection";
import PageTransition from "@/components/PageTransition";

const Company = () => {
  return (
    <PageTransition>
      <div className="pt-32">
        <LaboratorySection />
        <SupportSection />
        <FAQSection />
      </div>
    </PageTransition>
  );
};
export default Company;