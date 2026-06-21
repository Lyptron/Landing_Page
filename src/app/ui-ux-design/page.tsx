import { Metadata } from 'next'
import { services } from '@/data/services'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = services.find((s) => s.id === 'ui-ux-design')!

export const metadata: Metadata = {
  title: 'UI/UX Design Services — Figma Design Systems That Scale',
  description: 'Lyptron designs detailed user journeys and robust Figma design systems that map directly to developer-ready Tailwind configurations.',
  alternates: { canonical: '/ui-ux-design' },
  openGraph: {
    title: 'UI/UX Design Services — Lyptron',
    description: 'Figma design systems built to scale and ship straight to code.',
    url: `${SITE_URL}/ui-ux-design`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'Do you design in Figma?',
    a: 'Yes — every project starts with a Figma design system that maps directly to a developer-ready Tailwind configuration, so nothing gets lost in handoff.',
  },
  {
    q: 'Can you redesign my existing product without a full rebuild?',
    a: 'Yes — we audit your current UI, identify the highest-impact changes, and ship incremental redesigns that do not require a ground-up rebuild.',
  },
  {
    q: 'Do you do user research?',
    a: 'We run lightweight user validation — interviews, click tests, and journey mapping — scoped to fit your timeline and budget.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'UI/UX Design Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/ui-ux-design`,
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

export default function UiUxDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
