import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  schema?: string;
}

const SEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage = "https://www.buildicy.com/og-image.png",
  keywords = "Custom SaaS Development Coimbatore, Web3 & Blockchain Coimbatore, Cinematic UI/UX Design, AI Automation Agency Coimbatore, AI Chatbots, Predictive Analytics, Computer Vision Solutions, Speech Recognition, Enterprise Software Systems, Buildicy Coimbatore",
  schema
}: SEOProps) => {
  const fullUrl = canonicalUrl ? `https://www.buildicy.com${canonicalUrl}` : "https://www.buildicy.com";

  const defaultSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Buildicy",
    "image": "https://www.buildicy.com/og-image.png",
    "description": "Buildicy is Coimbatore's elite Custom Software and SaaS Development agency. We specialize in AI Automation, Web3 & Blockchain, Cinematic UI/UX, and Enterprise Solutions.",
    "url": "https://www.buildicy.com",
    "telephone": "",
    "email": "buildicy@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Coimbatore",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.linkedin.com/company/buildicy/",
      "https://www.instagram.com/_buildicy"
    ],
    "priceRange": "$$$"
  });

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonicalUrl && <link rel="canonical" href={fullUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {schema || defaultSchema}
      </script>
    </Helmet>
  );
};

export default SEO;
