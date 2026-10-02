import SEO from "@/components/SEO";
import LaboratorySection from "@/components/LaboratorySection";
import SupportSection from "@/components/SupportSection";
import FAQSection from "@/components/FAQSection";
import PageTransition from "@/components/PageTransition";

const Company = () => {
  return (
    <PageTransition>
      <SEO 
        title="About Buildicy | Premier AI Studio & Engineering Lab in Coimbatore"
        description="Meet the engineering leadership behind Buildicy, Coimbatore's top AI software agency. We are a dedicated team architecting custom SaaS, Web3, and AI Automation platforms."
        canonicalUrl="/company"
        keywords="About Buildicy, Elite AI Engineering Studio Coimbatore, Prajwal Tech Lead, Software Agency Team Tamil Nadu, AI R&D Laboratory, Buildicy Founders, Digital Engineering India"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Buildicy",
              "url": "https://www.buildicy.com",
              "logo": "https://www.buildicy.com/og-image.png",
              "description": "An elite AI studio in Coimbatore specializing in high-performance digital products, Web3 & Blockchain solutions, AI Automation, and cinematic UI/UX design.",
              "founder": [
                {
                  "@type": "Person",
                  "name": "Prajwal"
                }
              ],
              "sameAs": [
                "https://www.linkedin.com/company/buildicy/",
                "https://www.instagram.com/_buildicy"
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What AI services does Buildicy offer?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We offer a comprehensive suite of AI services including custom neural network development, computer vision, advanced NLP, predictive analytics, autonomous agents, and enterprise-grade automation solutions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How long does a typical AI project take?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Project timelines scale with complexity. A streamlined AI integration or custom agent typically deploys in 2-4 weeks. Enterprise-scale custom model training and infrastructure development ranges from 8-16 weeks. We map exact milestones during discovery."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you offer ongoing support after deployment?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. AI requires continuous optimization. All our deployments include dedicated neural monitoring, model drift correction, security patches, and 24/7 technical oversight to ensure peak performance."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can Buildicy integrate with our existing systems?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. Our architectures are framework-agnostic. We build secure API layers, GraphQL endpoints, and Webhooks that plug seamlessly into your existing tech stack—whether it's AWS, Azure, Salesforce, or bespoke internal systems."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What industries do you specialize in?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our core expertise spans Fintech, Healthcare tech, Enterprise SaaS, and advanced E-commerce. However, our fundamental AI methodologies are designed to adapt and scale across any data-rich industry."
                  }
                }
              ]
            }
          ]
        })}
      />
      <div className="pt-32">
        <LaboratorySection />
        <SupportSection />
        <FAQSection />
      </div>
    </PageTransition>
  );
};
export default Company;