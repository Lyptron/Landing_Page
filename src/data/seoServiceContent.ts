import { Service } from '@/types'

export const seoServiceContent: Service = {
  id: 'seo-services',
  number: '07',
  icon: '🔍',
  name: 'SEO Services',
  tagline: 'Rank higher, get found, convert more.',
  desc: 'We run full technical SEO audits, on-page optimization, and content strategy to get your site indexed, ranked, and converting — backed by the same engineering team that builds your product.',
  helps: [
    'Technical SEO audits covering Core Web Vitals, crawlability, and indexing issues',
    'On-page optimization — meta tags, schema markup, internal linking, content structure',
    'Keyword research and content strategy mapped to real search intent',
    'Ongoing rank tracking and monthly reporting tied to business outcomes',
  ],
  works: [
    { name: 'FinFlow', badge: 'SEO', desc: 'Targeted content sprint and technical fixes.', result: '180% organic impressions boost' },
    { name: 'ApexLabs', badge: 'SaaS', desc: 'Full-site technical audit and repositioning.', result: '3.2x increase in qualified leads' },
  ],
  forYou: [
    'A site that loads fast and passes Core Web Vitals',
    'Clear technical fixes for what is currently blocking your rankings',
    'A content and link-building plan that compounds over time',
  ],
  stack: ['Google Search Console', 'Ahrefs', 'Semrush', 'Screaming Frog', 'Google Analytics', 'Schema.org'],
}
