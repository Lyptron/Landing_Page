import { Metadata } from 'next'
import { services } from '@/data/services'
import ServicePageBody from '@/components/sections/ServicePageBody'

const SITE_URL = 'https://lyptron.com'
const service = services.find((s) => s.id === 'ai-automation')!

export const metadata: Metadata = {
  title: 'AI Automation & Integration Services — Custom LLM Agents & Workflows',
  description: 'Lyptron deploys custom LLM-powered agents, semantic search, and automation pipelines into your existing platform to eliminate manual workloads.',
  alternates: { canonical: '/ai-automation' },
  openGraph: {
    title: 'AI Automation Services — Lyptron',
    description: 'Custom LLM-powered agents and automation pipelines built for production.',
    url: `${SITE_URL}/ai-automation`,
    type: 'website',
  },
}

const faqs = [
  {
    q: 'What kinds of AI automation do you build?',
    a: 'Custom support agents, internal knowledge-base search, document processing pipelines, and workflow automation that plugs into your existing tools.',
  },
  {
    q: 'Which AI models or providers do you use?',
    a: 'We are provider-agnostic — OpenAI, Anthropic, or open-source models — chosen based on cost, latency, and accuracy requirements for your use case.',
  },
  {
    q: 'Is my data safe when you build with LLMs?',
    a: 'Yes. We architect around your existing data boundaries, use private endpoints where required, and never train models on your proprietary data.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'AI Automation & Integration Services',
      provider: { '@type': 'Organization', name: 'Lyptron', url: SITE_URL },
      areaServed: 'Worldwide',
      description: metadata.description,
      url: `${SITE_URL}/ai-automation`,
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

export default function AiAutomationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServicePageBody service={service} faqs={faqs} />
    </>
  )
}
