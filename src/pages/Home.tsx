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
        title="Buildicy | Elite AI Studio & High-Performance Engineering"
        description="Buildicy is a premier AI studio in Coimbatore specializing in high-performance digital products, Web3 & Blockchain solutions, AI Automation, and cinematic UI/UX design."
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