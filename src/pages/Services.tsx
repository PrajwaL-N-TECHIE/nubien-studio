import SEO from "@/components/SEO";
import ServicesHero from "@/components/ServicesHero";
import ServicesSection from "@/components/ServicesSection";
import ProductsDeepDive from "@/components/ProductsDeepDive";
import VentureCollaborationSection from "@/components/VentureCollaborationSection";
import EdutechDeepDive from "@/components/EdutechDeepDive";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import FooterCTA from "@/components/FooterCTA";
import PageTransition from "@/components/PageTransition";

const Services = () => {
  return (
    <PageTransition>
      <SEO 
        title="Domains & Services | Edutech, IT Consulting, Products & Venture Dev | Buildicy"
        description="Explore Buildicy's 4 core domains: Edutech & Paid Internships, IT Consulting & AI Funnel Systems, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a Profit-Sharing basis."
        canonicalUrl="/services"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Technology & Education Ecosystem",
          "provider": {
            "@type": "Organization",
            "name": "Buildicy",
            "sameAs": "https://www.buildicy.com"
          },
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Buildicy Offerings",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Edutech & Paid Internship Training"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "IT & AI Funnel Consulting"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Proprietary Products (Markeee & BizBrain)"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Venture Dev Team on Profit-Sharing Basis"
                }
              }
            ]
          }
        })}
      />
      <div className="pt-28"> {/* Spacer for Navbar */}
        <ServicesHero />
        <ServicesSection />
        <ProductsDeepDive />
        <VentureCollaborationSection />
        <EdutechDeepDive />
        <PricingSection />
        <TechStackSection />
        <FooterCTA />
      </div>
    </PageTransition>
  );
};
export default Services;