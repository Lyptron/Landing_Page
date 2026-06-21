import { Metadata } from 'next'
import { seoServiceContent } from '@/data/seoServiceContent'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = seoServiceContent

export const metadata: Metadata = {
  title: 'SEO Services — Technical SEO Audits & Organic Growth',
  description: 'Lyptron runs technical SEO audits, on-page optimization, and content strategy to get your site indexed, ranked, and converting on Google.',
  alternates: { canonical: '/seo-services' },
  openGraph: {
    title: 'SEO Services — Lyptron',
    description: 'Technical SEO audits, on-page optimization, and content strategy for sustainable organic growth.',
    url: `${SITE_URL}/seo-services`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'How long until I see SEO results?',
    a: 'Technical fixes can move rankings within weeks; competitive keyword rankings typically take 3 to 6 months of sustained content and authority building.',
  },
  {
    q: 'Do you guarantee first-page rankings?',
    a: 'No one ethically can — we focus on measurable technical and content improvements, with transparent monthly reporting on rankings, traffic, and conversions.',
  },
  {
    q: 'Do you handle both technical and content SEO?',
    a: 'Yes — technical audits covering Core Web Vitals, indexing, and schema, plus content strategy covering keyword research and on-page optimization, are both part of every engagement.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'SEO Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/seo-services`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

export default function SeoServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
