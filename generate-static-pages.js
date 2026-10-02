/**
 * Post-build script that generates static HTML files with SEO meta tags
 * for each route, so crawlers see the proper title/description without
 * needing to execute JavaScript.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, 'dist');

const PAGES = [
  {
    path: '/',
    title: 'Buildicy | Elite AI Studio, Custom Software & SaaS Development Coimbatore',
    description: 'Buildicy is Coimbatore\'s premier AI Studio & Custom Software Development Agency. We architect Generative AI automation, B2B SaaS platforms, Web3 solutions, and cinematic digital products.',
    keywords: 'AI Studio Coimbatore, Software Development Company Coimbatore, Custom SaaS Development, AI Automation Agency, Generative AI Solutions India, Web3 Development India, UI UX Design Agency Coimbatore, Startup MVP Development, IT Consulting Coimbatore, Paid AI Internships, Buildicy',
    canonical: 'https://www.buildicy.com',
  },
  {
    path: '/services',
    title: 'Domains & Services | AI Automation, SaaS Development & Edutech | Buildicy',
    description: 'Explore Buildicy\'s 4 core domains: Edutech & Paid Internships, IT Consulting & AI Funnel Systems, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a Profit-Sharing basis.',
    keywords: 'AI Automation Services, Enterprise IT Consulting, Paid AI Internships Coimbatore, WhatsApp Billing Systems, Venture Engineering Profit Sharing, Full Stack Software Engineering, Custom LLM Development, Web3 Blockchain Services, Buildicy',
    canonical: 'https://www.buildicy.com/services',
  },
  {
    path: '/reviews',
    title: 'Campus Masterclasses & Reviews | Buildicy AI Workshops',
    description: 'Explore authentic feedback and verified student reviews from university workshops and MBA AI masterclasses conducted by Buildicy leadership across Tamil Nadu and India.',
    keywords: 'Gen AI Masterclass, MBA AI Workshop, Campus AI Workshops, Student Reviews, Monti International Reviews, AI Corporate Training, Buildicy Campus Reviews, Generative AI Training India',
    canonical: 'https://www.buildicy.com/reviews',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Generative AI for Enterprise & Management Masterclass',
      description: 'Comprehensive practical masterclass and workshop training university and MBA cohorts in generative AI, prompt engineering, agentic workflows, and automated product systems.',
      provider: {
        '@type': 'Organization',
        name: 'Buildicy',
        sameAs: 'https://www.buildicy.com',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
    },
  },
  {
    path: '/portfolio',
    title: 'Our Work & Portfolio | Custom SaaS, AI Platforms & Web3 | Buildicy',
    description: 'View our portfolio of custom software applications, B2B SaaS platforms, Web3 dApps, and Computer Vision solutions built by Coimbatore\'s top engineering agency.',
    keywords: 'Markeee Autonomous AI Marketing, BizBrain WhatsApp Billing, Buildicy Portfolio, B2B SaaS Case Studies, AI Products Showcase, Custom Web Applications, Web3 dApps, High Performance Software Projects, Coimbatore Software Agency',
    canonical: 'https://www.buildicy.com/portfolio',
  },
  {
    path: '/company',
    title: 'About Buildicy | Premier AI Studio & Engineering Lab in Coimbatore',
    description: 'Meet the engineering leadership behind Buildicy, Coimbatore\'s top AI software agency. We are a dedicated team architecting custom SaaS, Web3, and AI Automation platforms.',
    keywords: 'About Buildicy, Elite AI Engineering Studio Coimbatore, Prajwal Tech Lead, Software Agency Team Tamil Nadu, AI R&D Laboratory, Buildicy Founders, Digital Engineering India',
    canonical: 'https://www.buildicy.com/company',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What AI services does Buildicy offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer a comprehensive suite of AI services including custom neural network development, computer vision, advanced NLP, predictive analytics, autonomous agents, and enterprise-grade automation solutions.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a typical AI project take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Project timelines scale with complexity. A streamlined AI integration or custom agent typically deploys in 2-4 weeks. Enterprise-scale custom model training and infrastructure development ranges from 8-16 weeks. We map exact milestones during discovery.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer ongoing support after deployment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. AI requires continuous optimization. All our deployments include dedicated neural monitoring, model drift correction, security patches, and 24/7 technical oversight to ensure peak performance.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Buildicy integrate with our existing systems?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Our architectures are framework-agnostic. We build secure API layers, GraphQL endpoints, and Webhooks that plug seamlessly into your existing tech stack—whether it is AWS, Azure, Salesforce, or bespoke internal systems.',
          },
        },
        {
          '@type': 'Question',
          name: 'What industries do you specialize in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our core expertise spans Fintech, Healthcare tech, Enterprise SaaS, and advanced E-commerce. However, our fundamental AI methodologies are designed to adapt and scale across any data-rich industry.',
          },
        },
      ],
    },
  },
  {
    path: '/internship-registration',
    title: 'Internship Application | Paid AI & Full Stack Cohort | Buildicy',
    description: 'Apply for Buildicy\'s elite AI Architect & Full Stack Developer Mentorship Cohort. Get hands-on industry experience building real-world AI applications with stipends.',
    keywords: 'Paid AI Internships Coimbatore, Software Developer Internship Tamil Nadu, Gen AI Student Mentorship, Full Stack Internship India, Buildicy Internship Application',
    canonical: 'https://www.buildicy.com/internship-registration',
  },
  {
    path: '/verify',
    title: 'Verify Certificate | Buildicy Credential Authentication',
    description: 'Instant verification of official Buildicy internship certificates, credentials, and completed workshop accreditations using secure verification IDs.',
    keywords: 'Verify Certificate Buildicy, Certificate Authentication, Student Credential Verification, Buildicy Internship Verification, Tamper-proof Certificates',
    canonical: 'https://www.buildicy.com/verify',
  },
  {
    path: '/roi-calculator',
    title: 'SaaS vs Custom Software Cost ROI Calculator | Build vs Buy | Buildicy',
    description: 'Calculate how much money your company saves by replacing expensive SaaS recurring subscriptions with custom-engineered software systems.',
    keywords: 'SaaS vs Custom Software Calculator, Build vs Buy Software Calculator, Software Development Cost Estimator, SaaS Cost Replacement, Custom Software ROI Analyzer, Custom MVP Pricing, Buildicy',
    canonical: 'https://www.buildicy.com/roi-calculator',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Buildicy SaaS vs Custom Software Cost ROI Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description: 'Calculate how much your business can save by building custom software instead of paying monthly recurring SaaS subscriptions.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },
  {
    path: '/ai-sdr',
    title: 'AI SDR Suite | Autonomous Sales Pipeline & Lead Enrichment | Buildicy',
    description: 'Buildicy\'s autonomous AI Sales Development Representative generates verified enterprise leads, enriches prospect intelligence, and scripts hyper-personalized outreach.',
    keywords: 'AI SDR, Autonomous Sales Prospecting, Cold Email AI Automation, Lead Enrichment Software, AI Sales Agent, Apollo.io Groq LLaMA, Buildicy AI SDR',
    canonical: 'https://www.buildicy.com/ai-sdr',
  },
];

const OG_IMAGE = 'https://www.buildicy.com/og-image.png';

function generateHtml(page, indexHtml) {
  const schemaTag = page.schema
    ? `\n    <script type="application/ld+json">${JSON.stringify(page.schema)}</script>`
    : '';

  const tags = `
    <title>${page.title}</title>
    <meta name="keywords" content="${page.keywords || page.description}" />
    <link rel="canonical" href="${page.canonical}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Buildicy" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${page.canonical}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${page.title}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@BuildicyStudio" />
    <meta name="twitter:creator" content="@BuildicyStudio" />
    <meta name="twitter:url" content="${page.canonical}" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${page.title}" />${schemaTag}
  `.trim();

  // Replace the generic meta tags with route-specific ones
  let html = indexHtml;

  // Replace title
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);

  // Replace or inject meta description
  const descRegex = /<meta\s+name=["']description["'][^>]*>/;
  if (descRegex.test(html)) {
    html = html.replace(descRegex, `<meta name="description" content="${page.description}" />`);
  }

  // Replace or inject canonical
  const canonRegex = /<link\s+rel=["']canonical["'][^>]*>/;
  if (canonRegex.test(html)) {
    html = html.replace(canonRegex, `<link rel="canonical" href="${page.canonical}" />`);
  }

  // Inject all SEO tags before closing head
  // Remove existing og/twitter meta tags to avoid duplicates
  html = html.replace(/<meta\s+(property|name)=["'](og:|twitter:)[^>]*>/g, '');
  html = html.replace('</head>', `${tags}\n</head>`);

  return html;
}

// Read the built index.html
const indexHtml = readFileSync(join(dist, 'index.html'), 'utf-8');

// Generate route-specific HTML
for (const page of PAGES) {
  const html = generateHtml(page, indexHtml);
  const outputDir = page.path === '/' ? dist : join(dist, page.path.replace(/^\//, ''));
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'index.html');
  writeFileSync(outputPath, html, 'utf-8');
  console.log(`Generated ${outputPath}`);
}

console.log(`\nGenerated ${PAGES.length} static pages with SEO tags.`);
