import { Metadata } from 'next'
import { services } from '@/data/services'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = services.find((s) => s.id === 'web-dev')!

export const metadata: Metadata = {
  title: 'Web Development Services — Fast, SEO-Optimized Websites & Web Apps',
  description: 'Lyptron builds high-performance websites and web apps with Next.js and React — engineered for sub-1s load times, clean architecture, and search visibility.',
  alternates: { canonical: '/web-development' },
  openGraph: {
    title: 'Web Development Services — Lyptron',
    description: 'High-performance websites and web apps built with Next.js and React.',
    url: `${SITE_URL}/web-development`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'How long does it take to build a website with Lyptron?',
    a: 'Most marketing sites and web apps ship in 2 to 6 weeks depending on scope, after an initial scoping call to lock requirements.',
  },
  {
    q: 'Do you build on Next.js?',
    a: 'Yes. We default to Next.js and React for new builds because of their performance, SEO, and ecosystem advantages, though we also work within existing stacks.',
  },
  {
    q: 'Can you optimize my existing slow website?',
    a: 'Yes — we run a full performance audit covering Core Web Vitals, bundle size, and rendering strategy, then implement fixes with measurable before and after benchmarks.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Web Development Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/web-development`,
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

export default function WebDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
