import { Metadata } from 'next'
import LegalPageBody from '@/components/sections/LegalPageBody'

const SITE_URL = 'https://lyptron.com'
const LAST_UPDATED = 'June 21, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Lyptron collects, uses, and protects information submitted through our website.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — Lyptron',
    description: 'How Lyptron collects, uses, and protects information submitted through our website.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },
}

const sections = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you submit our contact form, we collect your first name, last name, email address, the type of project you describe, and any additional details you choose to provide.',
      'We use Google Analytics to understand how visitors use our site. This may collect your IP address, browser type, device information, and pages visited, typically via cookies.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'Contact form submissions are used solely to respond to your inquiry and discuss a potential project. We do not sell or rent this information to third parties.',
      'Analytics data is used in aggregate to understand site performance and improve the experience for future visitors.',
    ],
  },
  {
    heading: 'How we store and share information',
    paragraphs: [
      'Form submissions are stored in our database, hosted by Supabase, a third-party data processor. Access is restricted to authorized Lyptron team members.',
      'We do not share your information with any other third party except as required to operate the service described above or where required by law.',
    ],
  },
  {
    heading: 'Data retention',
    paragraphs: [
      'We retain contact form submissions for as long as reasonably necessary to respond to your inquiry or maintain a record of past engagements, unless you request deletion sooner.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'You may request access to, correction of, or deletion of any personal information we hold about you by emailing hello@lyptron.com. We will respond within a reasonable timeframe.',
    ],
  },
  {
    heading: 'Cookies',
    paragraphs: [
      'Our site uses cookies set by Google Analytics. You can control or disable cookies through your browser settings at any time.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about this policy can be sent to hello@lyptron.com.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPageBody
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro="This policy explains what information Lyptron collects when you visit our website or submit our contact form, and how that information is used."
      sections={sections}
    />
  )
}
