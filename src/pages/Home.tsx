import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  return (
    <PageTransition>
      <HeroSection />
      <MarqueeBanner />
      <AboutSection />
      <TestimonialsSection />
    </PageTransition>
  );
};
export default Home;