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
        description="Buildicy is a premier AI studio specializing in high-performance digital products, intelligent engineering, and cinematic brand experiences. Scale your vision with elite UX."
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