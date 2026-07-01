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
    title: 'Buildicy | Elite AI Studio & High-Performance Engineering in Coimbatore',
    description: 'Buildicy is Coimbatore\'s premier Custom Software and SaaS Development agency. We specialize in AI Automation, Web3 & Blockchain, Cinematic UI/UX, and Enterprise Solutions.',
    keywords: 'Custom Software Development Coimbatore, AI Automation Coimbatore, Web3 Blockchain, SaaS Development, UI/UX Design, Buildicy',
    canonical: 'https://www.buildicy.com',
  },
  {
    path: '/services',
    title: 'Services | Buildicy - AI, Web3 & Custom Software Development',
    description: 'Buildicy offers elite AI Automation, Web3 & Blockchain, Cinematic UI/UX Design, and Enterprise Software Development services in Coimbatore.',
    canonical: 'https://www.buildicy.com/services',
  },
  {
    path: '/portfolio',
    title: 'Portfolio | Buildicy - Client Projects & Case Studies',
    description: 'Explore Buildicy\'s portfolio of high-performance custom software, AI, and Web3 projects. See how we engineer digital products for B2B and enterprise clients.',
    canonical: 'https://www.buildicy.com/portfolio',
  },
  {
    path: '/company',
    title: 'Company | Buildicy - Our Team & Laboratory',
    description: 'Meet the Buildicy team — an elite AI studio and high-performance engineering lab based in Coimbatore, India.',
    canonical: 'https://www.buildicy.com/company',
  },
  {
    path: '/internship-registration',
    title: 'Internship Registration | Buildicy - AI Architect Mentorship',
    description: 'Apply for Buildicy\'s elite AI Architect Mentorship Cohort. Get hands-on experience building real AI projects.',
    canonical: 'https://www.buildicy.com/internship-registration',
  },
  {
    path: '/verify',
    title: 'Verify Certificate | Buildicy Internship',
    description: 'Verify your Buildicy internship certificate using your registration ID.',
    canonical: 'https://www.buildicy.com/verify',
  },
  {
    path: '/roi-calculator',
    title: 'ROI Calculator | Buildicy - SaaS vs Custom Software Cost Analysis',
    description: 'Calculate how much you can save by switching from SaaS subscriptions to custom-built software with Buildicy\'s ROI calculator.',
    canonical: 'https://www.buildicy.com/roi-calculator',
  },
  {
    path: '/ai-sdr',
    title: 'AI SDR | Buildicy - Autonomous Sales Pipeline',
    description: 'Buildicy\'s AI-powered Sales Development Representative generates personalized cold emails using Apollo.io and Groq LLaMA.',
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
