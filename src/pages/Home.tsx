import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import DomainsSection from "@/components/DomainsSection";
import AboutSection from "@/components/AboutSection";
import WhyBuildicySection from "@/components/WhyBuildicySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PageTransition from "@/components/PageTransition";

const homeSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.buildicy.com/#organization",
      "name": "Buildicy",
      "url": "https://www.buildicy.com",
      "logo": "https://www.buildicy.com/logo.png",
      "image": "https://www.buildicy.com/og-image.png",
      "description": "Coimbatore's premier AI Studio & Custom Software Development Agency specializing in AI Automation, B2B SaaS Platforms, and Edutech Training.",
      "sameAs": [
        "https://twitter.com/BuildicyStudio",
        "https://www.linkedin.com/company/buildicy",
        "https://www.instagram.com/_buildicy"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Buildicy Core Capabilities",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Custom SaaS Development & Web Architecture",
              "description": "High-performance full-stack web platforms and bespoke enterprise SaaS systems designed to replace expensive subscription software."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Automation & Autonomous SDR Funnels",
              "description": "Autonomous lead qualification, AI sales development representatives, and intelligent business process automation."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Edutech Masterclasses & Paid Internships",
              "description": "Practical Generative AI masterclasses for university MBA cohorts and paid, stipend-backed software development internships in Coimbatore."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Venture Engineering & Profit-Sharing Co-Development",
              "description": "Technical co-founding and rapid MVP production engineering for ambitious startups on a profit-sharing basis."
            }
          }
        ]
      }
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.buildicy.com/#localbusiness",
      "name": "Buildicy Software & AI Studio",
      "url": "https://www.buildicy.com",
      "telephone": "+91-9843315832",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Coimbatore",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 11.0168,
        "longitude": 76.9558
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.98",
        "reviewCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Amaljith P" },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "They are young but they know a lot of things. Before this workshop, I thought AI was difficult. Now I think AI is an amazing practical business tool!"
        },
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Nellamreth Jawahara KK" },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Extremely useful session. The trainers made complex AI architectures feel effortless and practical for modern business."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.buildicy.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What AI and custom software development services does Buildicy offer in Coimbatore?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Buildicy is an elite AI Studio and custom software engineering firm based in Coimbatore, Tamil Nadu. We specialize in bespoke Generative AI models, autonomous multi-agent workflows, full-stack B2B SaaS architecture, high-performance web applications, and enterprise automation."
          }
        },
        {
          "@type": "Question",
          "name": "How does custom software save businesses money compared to monthly SaaS subscriptions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Commercial SaaS platforms charge steep per-seat monthly subscription fees that escalate exponentially as your team scales. By engineering custom, company-owned software, your organization pays once for development and owns the IP 100%, typically saving $45,000 to $200,000+ over 3-5 years."
          }
        },
        {
          "@type": "Question",
          "name": "Can Buildicy engineer autonomous AI SDRs and automated sales funnels?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Our proprietary AI SDR Suite automates B2B lead enrichment, account qualification, prospect intelligence, and hyper-personalized cold outreach sequencing using state-of-the-art LLMs (Groq LLaMA 3.3, OpenAI GPT-4o) and multi-channel messaging APIs."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Buildicy venture co-development and profit-sharing model work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For select high-potential startups and visionary founders, Buildicy acts as an aligned fractional technical co-founder. Rather than demanding massive upfront capital, we partner on a hybrid equity or revenue/profit-sharing model, architecting and maintaining the entire tech stack."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Buildicy located and do you accept local client consultations in Coimbatore?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our core engineering studio is located in Coimbatore, Tamil Nadu, India. We frequently host in-person strategy sessions and technical architecture reviews with clients across Coimbatore, Tirupur, Erode, Bangalore, and Kerala, while also serving international clients globally."
          }
        },
        {
          "@type": "Question",
          "name": "Who owns the intellectual property (IP), source code, and data after deployment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You do—100%. Upon project completion, all Git repositories, infrastructure accounts, API credentials, databases, and intellectual property rights are unconditionally transferred to your organization with zero vendor lock-in."
          }
        }
      ]
    }
  ]
});

const Home = () => {
  return (
    <PageTransition>
      <SEO 
        title="Buildicy | Elite AI Studio, Custom SaaS & Software Agency Coimbatore"
        description="Buildicy is an engineering powerhouse targeting 4 core domains: Edutech & Internships, IT Consulting & AI Funnels, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a profit-sharing basis."
        canonicalUrl="/"
        keywords="AI Studio Coimbatore, Software Development Company Coimbatore, Custom SaaS Development, AI Automation Agency India, Generative AI Solutions, Edutech Internships, Markeee AI Marketing, BizBrain WhatsApp Billing, Venture Studio, High-Performance Web Engineering, Buildicy"
        schema={homeSchema}
      />
      <HeroSection />
      <MarqueeBanner />
      <DomainsSection />
      <AboutSection />
      <WhyBuildicySection />
      <TestimonialsSection />
      <FAQSection />
    </PageTransition>
  );
};
export default Home;