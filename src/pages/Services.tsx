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
        title="SaaS & Custom Software Engineering Services in Coimbatore | Buildicy"
        description="Explore our elite software development services in Coimbatore. We specialize in building scalable SaaS applications, Web3 smart contracts, AI Chatbots, Predictive Analytics, and Computer Vision."
        canonicalUrl="/services"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Software Development & Design",
          "provider": {
            "@type": "Organization",
            "name": "Buildicy",
            "sameAs": "https://www.buildicy.com"
          },
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Buildicy Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Cinematic UI/UX Design"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "AI Automation & Intelligence"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Full Stack Engineering"
                }
              }
            ]
          }
        })}
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