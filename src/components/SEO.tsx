import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
}

const SEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage = "https://www.buildicy.com/og-image.jpg",
  keywords = "AI Studio Coimbatore, Web Development Coimbatore, UX Design Coimbatore, Digital Engineering India, High-Performance Software, Buildicy, Cinematic Brand Experiences"
}: SEOProps) => {
  const fullUrl = canonicalUrl ? `https://www.buildicy.com${canonicalUrl}` : "https://www.buildicy.com";

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
    </Helmet>
  );
};

export default SEO;
