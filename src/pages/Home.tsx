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
        title="Buildicy | Edutech, IT Consulting, SaaS Products & Venture Dev"
        description="Buildicy is an engineering powerhouse targeting 4 core domains: Edutech & Internships, IT Consulting & AI Funnels, Proprietary Products (Markeee & BizBrain), and Venture Engineering on a profit-sharing basis."
        canonicalUrl="/"
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