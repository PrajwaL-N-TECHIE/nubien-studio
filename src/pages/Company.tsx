import SupportSection from "@/components/SupportSection";
import FAQSection from "@/components/FAQSection";
import PageTransition from "@/components/PageTransition";

const Company = () => {
  return (
    <PageTransition>
      <div className="pt-32">
        <SupportSection />
        <FAQSection />
      </div>
    </PageTransition>
  );
};
export default Company;