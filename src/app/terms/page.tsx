import { Metadata } from 'next'
import LegalPageBody from '@/components/sections/LegalPageBody'

const SITE_URL = 'https://lyptron.com'
const LAST_UPDATED = 'June 21, 2026'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing use of the Lyptron website and engagement of Lyptron services.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service — Lyptron',
    description: 'The terms governing use of the Lyptron website and engagement of Lyptron services.',
    url: `${SITE_URL}/terms`,
    type: 'website',
  },
}

const sections = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By using this website or engaging Lyptron for services, you agree to these terms. If you do not agree, please do not use the site or our services.',
    ],
  },
  {
    heading: 'Our services',
    paragraphs: [
      'Lyptron provides web development, mobile engineering, AI integration, UI/UX design, cloud infrastructure, and brand strategy services. The specific scope, timeline, and cost of any engagement is defined in a separate written agreement or proposal before work begins.',
    ],
  },
  {
    heading: 'Engagement and payment',
    paragraphs: [
      'Project terms, milestones, and payment schedules are agreed upon individually for each client and documented outside of this website. Submitting our contact form does not create a binding service agreement.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'Unless otherwise agreed in writing, ownership of project deliverables transfers to the client upon receipt of full payment. Lyptron retains the right to showcase completed work in its portfolio unless the client requests otherwise in writing.',
      'Any pre-existing tools, frameworks, or internal libraries used to deliver a project remain the property of Lyptron.',
    ],
  },
  {
    heading: 'Confidentiality',
    paragraphs: [
      'We treat client information shared during a project as confidential and will sign a non-disclosure agreement on request before discussing project details.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'Lyptron is not liable for indirect, incidental, or consequential damages arising from use of this website or from services rendered, to the extent permitted by applicable law.',
    ],
  },
  {
    heading: 'Termination',
    paragraphs: [
      'Either party may terminate an active engagement as outlined in the specific project agreement signed for that engagement.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time. The "Last updated" date at the top of this page reflects the most recent revision.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about these terms can be sent to hello@lyptron.com.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPageBody
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro="These terms govern your use of the Lyptron website and outline the general framework under which we engage with clients."
      sections={sections}
    />
  )
}
