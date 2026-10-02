import SEO from "@/components/SEO";
import ServicesHero from "@/components/ServicesHero";
import ServicesSection from "@/components/ServicesSection";
import ProductsDeepDive from "@/components/ProductsDeepDive";
import VentureCollaborationSection from "@/components/VentureCollaborationSection";
import EdutechDeepDive from "@/components/EdutechDeepDive";
import TestimonialsSection from "@/components/TestimonialsSection";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import FooterCTA from "@/components/FooterCTA";
import PageTransition from "@/components/PageTransition";

import AgencyComparisonTable from "@/components/AgencyComparisonTable";

const Services = () => {
  return (
    <PageTransition>
      <SEO 
        title="Domains & Services | AI Automation, SaaS Development & Edutech | Buildicy"
        description="Explore Buildicy's 4 core domains: Edutech & Paid Internships, IT Consulting & AI Funnel Systems, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a Profit-Sharing basis."
        canonicalUrl="/services"
        keywords="AI Automation Services, Enterprise IT Consulting, Paid AI Internships Coimbatore, WhatsApp Billing Systems, Venture Engineering Profit Sharing, Full Stack Software Engineering, Custom LLM Development, Web3 Blockchain Services, Buildicy"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
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
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.buildicy.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Domains & Services",
                  "item": "https://www.buildicy.com/services"
                }
              ]
            }
          ]
        })}
      />
      <div className="pt-28"> {/* Spacer for Navbar */}
        <ServicesHero />
        <ServicesSection />
        <ProductsDeepDive />
        <VentureCollaborationSection />
        <EdutechDeepDive />
        <AgencyComparisonTable />
        <TestimonialsSection />
        <PricingSection />
        <TechStackSection />
        <FooterCTA />
      </div>
    </PageTransition>
  );
};
export default Services;