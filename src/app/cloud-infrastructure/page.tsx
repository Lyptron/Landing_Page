import { Metadata } from 'next'
import { services } from '@/data/services'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = services.find((s) => s.id === 'cloud-devops')!

export const metadata: Metadata = {
  title: 'Cloud Infrastructure & DevOps Services — AWS, Docker, Kubernetes',
  description: 'Lyptron builds resilient, auto-scaling cloud infrastructure with Docker, Kubernetes, and Terraform — wired to zero-downtime CI/CD pipelines.',
  alternates: { canonical: '/cloud-infrastructure' },
  openGraph: {
    title: 'Cloud Infrastructure & DevOps Services — Lyptron',
    description: 'Resilient cloud infrastructure and DevOps pipelines built for scale.',
    url: `${SITE_URL}/cloud-infrastructure`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'Which cloud providers do you work with?',
    a: 'We primarily work with AWS, though we also build on GCP and Azure. We use Terraform to keep infrastructure definitions provider-agnostic where possible.',
  },
  {
    q: 'Do you handle CI/CD setup end to end?',
    a: 'Yes — we configure full CI/CD pipelines using GitHub Actions, including automated testing, staging deployments, and zero-downtime production releases.',
  },
  {
    q: 'Can you take over an existing infrastructure that is already live?',
    a: 'Yes — we start with a thorough audit of your current setup, identify risks and cost optimisations, then incrementally migrate or improve without disrupting your live environment.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Cloud Infrastructure & DevOps Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/cloud-infrastructure`,
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

export default function CloudInfrastructurePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
