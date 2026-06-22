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
        title="Buildicy | Elite Custom Software & SaaS Development Agency"
        description="Buildicy is a premier custom software and SaaS development agency. We engineer high-performance B2B applications, enterprise platforms, and scalable digital architectures."
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