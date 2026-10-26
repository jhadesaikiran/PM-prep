// Company teardowns for the Companies page. One JSON file per company in
// ./companies (same shape as the Adobe one-pager); DOMAINS sets the grouping and
// order. A slug starting with "@" lists a company whose sheet lives in another domain.
// _pages.json maps each slug to its page in public/company-teardowns.pdf.
import PAGES from './companies/_pages.json';

const files = import.meta.glob(['./companies/*.json', '!./companies/_pages.json'],{ eager: true, import: 'default' });
const BY_SLUG = Object.fromEntries(Object.values(files).map((c) => [c.slug, c]));

export const PDF_URL = '/company-teardowns.pdf';

export const DOMAINS = [
  { name: 'Fintech / Payments', slugs: ['razorpay', 'phonepe', 'google-pay', 'paytm', 'whatsapp-pay'] },
  { name: 'Investments', slugs: ['groww', 'zerodha', 'smallcase'] },
  { name: 'Food Delivery', slugs: ['zomato', 'swiggy', 'dunzo'] },
  { name: 'Grocery Delivery', slugs: ['swiggy-instamart', 'bigbasket', 'amazon-fresh', 'zepto'] },
  { name: 'Ride Sharing', slugs: ['uber', 'ola'] },
  { name: 'E-Commerce', slugs: ['amazon', 'flipkart', 'myntra'] },
  { name: 'Social Media', slugs: ['instagram', 'threads', 'facebook', 'x-twitter', 'snapchat'] },
  { name: 'SuperApp', slugs: ['wechat', '@paytm'] },
  { name: 'Cloud Computing', slugs: ['aws', 'google-cloud', 'microsoft-azure'] },
  { name: 'Over-the-top (OTT)', slugs: ['netflix', 'amazon-prime-video', 'jiohotstar'] },
  { name: 'Messaging / Communication', slugs: ['whatsapp', 'messenger', 'telegram', 'gmail'] },
  { name: 'Ad-supported Media', slugs: ['youtube', 'spotify', 'twitch', 'moj'] },
  { name: 'Real-Money Gaming', slugs: ['dream11', 'winzo', 'zynga'] },
  { name: 'Creative Software', slugs: ['adobe'] },
].map((d) => ({
  name: d.name,
  companies: d.slugs
    .map((s) => ({ company: BY_SLUG[s.replace('@', '')], crossRef: s.startsWith('@') }))
    .filter((c) => c.company),
}));

export const getCompany = (slug) => BY_SLUG[slug];

// The domain a company's own sheet belongs to (not a cross-reference).
export const domainOf = (slug) =>
  DOMAINS.find((d) => d.companies.some((c) => !c.crossRef && c.company.slug === slug))?.name;

export const pdfPage = (slug) => PAGES[slug];
