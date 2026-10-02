import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import DomainsSection from "@/components/DomainsSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  return (
    <PageTransition>
      <SEO 
        title="Buildicy | Elite AI Studio, Custom SaaS & Software Agency Coimbatore"
        description="Buildicy is an engineering powerhouse targeting 4 core domains: Edutech & Internships, IT Consulting & AI Funnels, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a profit-sharing basis."
        canonicalUrl="/"
        keywords="AI Studio Coimbatore, Software Development Company Coimbatore, Custom SaaS Development, AI Automation Agency India, Generative AI Solutions, Edutech Internships, Markeee AI Marketing, BizBrain WhatsApp Billing, Venture Studio, High-Performance Web Engineering, Buildicy"
      />
      <HeroSection />
      <MarqueeBanner />
      <DomainsSection />
      <AboutSection />
      <TestimonialsSection />
    </PageTransition>
  );
};
export default Home;