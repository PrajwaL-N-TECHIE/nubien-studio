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
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://www.buildicy.com/#organization',
          'name': 'Buildicy',
          'url': 'https://www.buildicy.com',
          'logo': 'https://www.buildicy.com/logo.png',
          'image': 'https://www.buildicy.com/og-image.png',
          'description': 'Coimbatore\'s premier AI Studio & Custom Software Development Agency specializing in AI Automation, B2B SaaS Platforms, and Edutech Training.',
          'sameAs': [
            'https://twitter.com/BuildicyStudio',
            'https://www.linkedin.com/company/buildicy',
            'https://www.instagram.com/_buildicy'
          ],
          'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'name': 'Buildicy Core Capabilities',
            'itemListElement': [
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Custom SaaS Development & Web Architecture',
                  'description': 'High-performance full-stack web platforms and bespoke enterprise SaaS systems designed to replace expensive subscription software.'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'AI Automation & Autonomous SDR Funnels',
                  'description': 'Autonomous lead qualification, AI sales development representatives, and intelligent business process automation.'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Edutech Masterclasses & Paid Internships',
                  'description': 'Practical Generative AI masterclasses for university MBA cohorts and paid, stipend-backed software development internships in Coimbatore.'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Venture Engineering & Profit-Sharing Co-Development',
                  'description': 'Technical co-founding and rapid MVP production engineering for ambitious startups on a profit-sharing basis.'
                }
              }
            ]
          }
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://www.buildicy.com/#localbusiness',
          'name': 'Buildicy Software & AI Studio',
          'url': 'https://www.buildicy.com',
          'telephone': '+91-9843315832',
          'priceRange': '$$$',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Coimbatore',
            'addressRegion': 'Tamil Nadu',
            'addressCountry': 'IN'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': 11.0168,
            'longitude': 76.9558
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.98',
            'reviewCount': '150',
            'bestRating': '5',
            'worstRating': '1'
          },
          'review': [
            {
              '@type': 'Review',
              'author': { '@type': 'Person', 'name': 'Amaljith P' },
              'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
              'reviewBody': 'They are young but they know a lot of things. Before this workshop, I thought AI was difficult. Now I think AI is an amazing practical business tool!'
            },
            {
              '@type': 'Review',
              'author': { '@type': 'Person', 'name': 'Nellamreth Jawahara KK' },
              'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
              'reviewBody': 'Extremely useful session. The trainers made complex AI architectures feel effortless and practical for modern business.'
            }
          ]
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://www.buildicy.com/#faq',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'What AI and custom software development services does Buildicy offer in Coimbatore?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Buildicy is an elite AI Studio and custom software engineering firm based in Coimbatore, Tamil Nadu. We specialize in bespoke Generative AI models, autonomous multi-agent workflows, full-stack B2B SaaS architecture, high-performance web applications, and enterprise automation.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does custom software save businesses money compared to monthly SaaS subscriptions?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Commercial SaaS platforms charge steep per-seat monthly subscription fees that escalate exponentially as your team scales. By engineering custom, company-owned software, your organization pays once for development and owns the IP 100%, typically saving $45,000 to $200,000+ over 3-5 years.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Can Buildicy engineer autonomous AI SDRs and automated sales funnels?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Our proprietary AI SDR Suite automates B2B lead enrichment, account qualification, prospect intelligence, and hyper-personalized cold outreach sequencing using state-of-the-art LLMs (Groq LLaMA 3.3, OpenAI GPT-4o) and multi-channel messaging APIs.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How does the Buildicy venture co-development and profit-sharing model work?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'For select high-potential startups and visionary founders, Buildicy acts as an aligned fractional technical co-founder. Rather than demanding massive upfront capital, we partner on a hybrid equity or revenue/profit-sharing model, architecting and maintaining the entire tech stack.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Where is Buildicy located and do you accept local client consultations in Coimbatore?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Our core engineering studio is located in Coimbatore, Tamil Nadu, India. We frequently host in-person strategy sessions and technical architecture reviews with clients across Coimbatore, Tirupur, Erode, Bangalore, and Kerala, while also serving international clients globally.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Who owns the intellectual property (IP), source code, and data after deployment?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'You do—100%. Upon project completion, all Git repositories, infrastructure accounts, API credentials, databases, and intellectual property rights are unconditionally transferred to your organization with zero vendor lock-in.'
              }
            }
          ]
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            }
          ]
        }
      ]
    }
  },
  {
    path: '/services',
    title: 'Domains & Services | AI Automation, SaaS Development & Edutech | Buildicy',
    description: 'Explore Buildicy\'s 4 core domains: Edutech & Paid Internships, IT Consulting & AI Funnel Systems, Proprietary SaaS Products (Markeee & BizBrain), and Venture Engineering on a Profit-Sharing basis.',
    keywords: 'AI Automation Services, Enterprise IT Consulting, Paid AI Internships Coimbatore, WhatsApp Billing Systems, Venture Engineering Profit Sharing, Full Stack Software Engineering, Custom LLM Development, Web3 Blockchain Services, Buildicy',
    canonical: 'https://www.buildicy.com/services',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          'serviceType': 'Technology & Education Ecosystem',
          'provider': {
            '@type': 'Organization',
            'name': 'Buildicy',
            'sameAs': 'https://www.buildicy.com'
          },
          'areaServed': 'Worldwide',
          'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'name': 'Buildicy Offerings',
            'itemListElement': [
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Edutech & Paid Internship Training'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'IT & AI Funnel Consulting'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Proprietary Products (Markeee & BizBrain)'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Venture Dev Team on Profit-Sharing Basis'
                }
              }
            ]
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Domains & Services',
              'item': 'https://www.buildicy.com/services'
            }
          ]
        }
      ]
    }
  },
  {
    path: '/reviews',
    title: 'Campus Masterclasses & Reviews | Buildicy AI Workshops',
    description: 'Explore authentic feedback and verified student reviews from university workshops and MBA AI masterclasses conducted by Buildicy leadership across Tamil Nadu and India.',
    keywords: 'Gen AI Masterclass, MBA AI Workshop, Campus AI Workshops, Student Reviews, Monti International Reviews, AI Corporate Training, Buildicy Campus Reviews, Generative AI Training India',
    canonical: 'https://www.buildicy.com/reviews',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Course',
          'name': 'Generative AI for Enterprise & Management Masterclass',
          'description': 'Comprehensive practical masterclass and workshop training university and MBA cohorts in generative AI, prompt engineering, agentic workflows, and automated product systems.',
          'provider': {
            '@type': 'Organization',
            'name': 'Buildicy',
            'sameAs': 'https://www.buildicy.com',
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '5.0',
            'reviewCount': '150',
            'bestRating': '5',
            'worstRating': '1',
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Campus Reviews',
              'item': 'https://www.buildicy.com/reviews'
            }
          ]
        }
      ]
    },
  },
  {
    path: '/portfolio',
    title: 'Our Work & Portfolio | Custom SaaS, AI Platforms & Web3 | Buildicy',
    description: 'View our portfolio of custom software applications, B2B SaaS platforms, Web3 dApps, and Computer Vision solutions built by Coimbatore\'s top engineering agency.',
    keywords: 'Markeee Autonomous AI Marketing, BizBrain WhatsApp Billing, Buildicy Portfolio, B2B SaaS Case Studies, AI Products Showcase, Custom Web Applications, Web3 dApps, High Performance Software Projects, Coimbatore Software Agency',
    canonical: 'https://www.buildicy.com/portfolio',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          'name': 'Buildicy Product Portfolio & Engineering Case Studies',
          'description': 'Showcase of custom SaaS applications, AI pipelines, autonomous SDR agents, and Web3 architectures developed by Buildicy.',
          'url': 'https://www.buildicy.com/portfolio'
        },
        {
          '@type': 'SoftwareApplication',
          'name': 'Markeee',
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web',
          'description': 'Autonomous AI marketing engine for high-velocity social content and campaign optimization.'
        },
        {
          '@type': 'SoftwareApplication',
          'name': 'BizBrain',
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web',
          'description': 'WhatsApp-native automated billing and customer engagement platform supporting 12+ regional languages.'
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Portfolio',
              'item': 'https://www.buildicy.com/portfolio'
            }
          ]
        }
      ]
    }
  },
  {
    path: '/company',
    title: 'About Buildicy | Premier AI Studio & Engineering Lab in Coimbatore',
    description: 'Meet the engineering leadership behind Buildicy, Coimbatore\'s top AI software agency. We are a dedicated team architecting custom SaaS, Web3, and AI Automation platforms.',
    keywords: 'About Buildicy, Elite AI Engineering Studio Coimbatore, Mayur Tech Lead, Software Agency Team Tamil Nadu, AI R&D Laboratory, Buildicy Founders, Digital Engineering India',
    canonical: 'https://www.buildicy.com/company',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          'name': 'About Buildicy AI Studio',
          'description': 'Meet the engineering leadership behind Buildicy, Coimbatore\'s top AI software agency.'
        },
        {
          '@type': 'Organization',
          'name': 'Buildicy',
          'url': 'https://www.buildicy.com',
          'founder': {
            '@type': 'Person',
            'name': 'Mayur P',
            'jobTitle': 'Founder & Tech Lead'
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Company & Leadership',
              'item': 'https://www.buildicy.com/company'
            }
          ]
        }
      ]
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
      '@graph': [
        {
          '@type': 'WebApplication',
          'name': 'Buildicy SaaS vs Custom Software Cost ROI Calculator',
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'All',
          'description': 'Calculate how much your business can save by building custom software instead of paying monthly recurring SaaS subscriptions.',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.buildicy.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'SaaS vs Custom Software ROI Calculator',
              'item': 'https://www.buildicy.com/roi-calculator'
            }
          ]
        }
      ]
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
