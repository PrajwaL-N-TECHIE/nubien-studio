import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  return (
    <PageTransition>
      <SEO 
        title="Buildicy | Elite Custom Software & SaaS Development Agency in Coimbatore"
        description="Buildicy is Coimbatore's premier Custom Software and SaaS Development agency. We engineer high-performance B2B applications, AI Automation, Web3 platforms, and Computer Vision solutions."
        canonicalUrl="/"
      />
      <HeroSection />
      <MarqueeBanner />
      <AboutSection />
      <TestimonialsSection />
    </PageTransition>
  );
};
export default Home;