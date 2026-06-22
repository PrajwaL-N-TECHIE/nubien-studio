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
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Buildicy",
          "url": "https://www.buildicy.com",
          "logo": "https://www.buildicy.com/og-image.png",
          "description": "An elite AI studio in Coimbatore specializing in high-performance digital products, Web3 & Blockchain solutions, AI Automation, and cinematic UI/UX design.",
          "founder": [
            {
              "@type": "Person",
              "name": "Prajwal"
            },
            {
              "@type": "Person",
              "name": "Nuvaaf"
            }
          ],
          "sameAs": [
            "https://www.linkedin.com/company/buildicy/",
            "https://www.instagram.com/_buildicy"
          ]
        })}
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