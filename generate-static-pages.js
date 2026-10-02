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
  const tags = `
    <title>${page.title}</title>
    <meta name="keywords" content="${page.keywords || page.description}" />
    <link rel="canonical" href="${page.canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${page.canonical}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${page.canonical}" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
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
