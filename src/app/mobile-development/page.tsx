import { Metadata } from 'next'
import { services } from '@/data/services'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = services.find((s) => s.id === 'mobile-dev')!

export const metadata: Metadata = {
  title: 'Mobile App Development Services — React Native, iOS & Android',
  description: 'Lyptron builds high-performance iOS and Android apps with React Native and Expo — native feel, shared codebase, App Store ready.',
  alternates: { canonical: '/mobile-development' },
  openGraph: {
    title: 'Mobile App Development Services — Lyptron',
    description: 'High-performance iOS and Android apps built with React Native and Expo.',
    url: `${SITE_URL}/mobile-development`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'Do you build for both iOS and Android?',
    a: 'Yes — we use React Native and Expo to build a single shared codebase that deploys to both iOS and Android simultaneously, cutting development time and keeping both platforms in sync.',
  },
  {
    q: 'How long does it take to build a mobile app?',
    a: 'A focused MVP typically takes 6 to 12 weeks from scoping to App Store submission, depending on feature complexity, backend integration requirements, and design scope.',
  },
  {
    q: 'Do you handle App Store and Play Store submission?',
    a: 'Yes — we manage the full submission process including provisioning profiles, app review preparation, and resolving any store rejections that arise.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Mobile App Development Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/mobile-development`,
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

export default function MobileDevelopmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
