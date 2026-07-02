import { Metadata } from 'next'
import LegalPageBody from '@/components/sections/LegalPageBody'

const SITE_URL = 'https://lyptron.com'
const LAST_UPDATED = 'July 2, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy — Lyptron',
  description: 'How Lyptron collects, uses, stores, and protects personal information submitted through our website and client engagements.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — Lyptron',
    description: 'How Lyptron collects, uses, stores, and protects personal information submitted through our website and client engagements.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },
}

const sections = [
  {
    heading: 'Who we are',
    paragraphs: [
      'Lyptron is a digital product studio specialising in web development, AI automation, UI/UX design, and SEO services. Our website is lyptron.com. When this policy refers to "Lyptron", "we", "us", or "our", it means Lyptron and the team operating this website and delivering our services.',
      'If you have any questions about how we handle your data, you can reach us at hello@lyptron.com at any time.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'Contact form submissions: When you fill out our contact form we collect your first name, last name, email address, the type of project or service you are enquiring about, and any additional details you choose to share. This information is collected solely to enable us to respond to your enquiry.',
      'Analytics data: We use Google Analytics to understand how visitors interact with our website. This service may collect your IP address (anonymised), browser type, device type, operating system, referring URLs, pages visited, and time spent on pages. This data is collected via cookies and is aggregated — we do not use it to identify individual visitors.',
      'Client project data: During an active engagement we may receive files, documents, credentials, or business information necessary to deliver the agreed scope of work. This information is handled with strict confidentiality as described in the Confidentiality section below.',
      'Communication records: If you email us or communicate through project management tools, we retain those communications as part of the project record.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'Contact form data is used exclusively to respond to your enquiry, discuss a potential project, and follow up if you have requested it. We do not add you to marketing lists, sell your information, or share it with third parties for their own purposes.',
      'Analytics data is used in aggregate to understand which pages and content are most useful, to diagnose technical issues, and to guide improvements to the site. It is never used to build individual profiles or serve targeted advertising.',
      'Project data is used only to deliver the services you have engaged us for. It is not repurposed, mined, or shared beyond what is strictly necessary to complete the work.',
      'We may use your email address to send project updates, invoices, and administrative communications relevant to an active engagement. We do not send unsolicited marketing emails.',
    ],
  },
  {
    heading: 'Legal basis for processing',
    paragraphs: [
      'Responding to your enquiry: Processing is necessary to take steps at your request prior to entering a contract, and based on our legitimate interest in responding to business enquiries.',
      'Delivering contracted services: Processing is necessary for the performance of a contract to which you are a party.',
      'Analytics: Processing is based on our legitimate interest in understanding and improving our website. Where required, we obtain consent via cookie notice.',
      'Legal obligations: We may process data where required to comply with applicable law or respond to lawful requests from authorities.',
    ],
  },
  {
    heading: 'Cookies and tracking',
    paragraphs: [
      'Our website uses cookies set by Google Analytics to collect anonymised usage data. These are analytics cookies and do not contain personal information on their own.',
      'You can control or disable cookies at any time through your browser settings. Disabling analytics cookies will not affect your ability to use the website. To opt out of Google Analytics tracking across all websites, you can install the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.',
      'We do not use advertising cookies, retargeting pixels, or any third-party tracking technology beyond Google Analytics.',
    ],
  },
  {
    heading: 'How we store and protect your information',
    paragraphs: [
      'Contact form submissions and project data are stored in our database hosted by Supabase, a secure third-party data platform. Supabase infrastructure is hosted on AWS and applies encryption at rest and in transit. Access to the database is restricted to authorised Lyptron team members via role-based access controls.',
      'Project files and documents may be stored using secure cloud storage services including Google Drive, Notion, or Linear, depending on the nature of the project. All services we use apply industry-standard security measures.',
      'We apply reasonable administrative, technical, and physical safeguards to protect your information from unauthorised access, disclosure, alteration, or destruction. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      'All data in transit between your browser and our servers is encrypted using TLS (HTTPS). We do not store payment card information — any payments are processed through third-party payment processors that are PCI-DSS compliant.',
    ],
  },
  {
    heading: 'Sharing your information',
    paragraphs: [
      'We do not sell, rent, or trade your personal information to any third party.',
      'We share information only with service providers that help us operate our business — such as Supabase for database hosting and Google for analytics. These providers process data on our behalf and are contractually required to keep it confidential and secure.',
      'We may disclose information if required to do so by law, court order, or a lawful request from a government authority, or where we believe in good faith that disclosure is necessary to protect the rights, property, or safety of Lyptron, our clients, or others.',
      'In the event of a business merger, acquisition, or sale of assets, client data may be transferred as part of that transaction, subject to the same privacy protections described in this policy.',
    ],
  },
  {
    heading: 'Data retention',
    paragraphs: [
      'Contact form submissions are retained for up to 24 months from the date of submission, or until you request deletion, whichever comes first. If a submission leads to an active engagement, the related records are retained for the duration of the project and for up to 5 years afterward for accounting and legal purposes.',
      'Analytics data is retained in accordance with Google Analytics default retention settings, which we have configured to 14 months.',
      'Project files and communications are retained for the duration of the engagement and for a reasonable period afterward, typically 3 to 5 years, to support warranty obligations, dispute resolution, or future reference. You may request earlier deletion subject to any overriding legal or contractual obligations.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Depending on your location and applicable law, you may have the following rights regarding your personal information:',
      'Right of access: You may request a copy of the personal information we hold about you.',
      'Right to rectification: You may request that we correct any inaccurate or incomplete information.',
      'Right to erasure: You may request that we delete your personal information, subject to any overriding legal or contractual obligations.',
      'Right to restrict processing: You may request that we limit how we use your data in certain circumstances.',
      'Right to data portability: You may request that we provide your information in a structured, machine-readable format.',
      'Right to object: You may object to processing based on our legitimate interests.',
      'To exercise any of these rights, email us at hello@lyptron.com with your request. We will respond within 30 days. We may ask you to verify your identity before processing the request.',
    ],
  },
  {
    heading: 'Third-party links',
    paragraphs: [
      'Our website may contain links to third-party websites, tools, or services. This privacy policy applies only to lyptron.com. We are not responsible for the privacy practices or content of any third-party sites. We encourage you to review the privacy policies of any external sites you visit.',
    ],
  },
  {
    heading: 'Children\'s privacy',
    paragraphs: [
      'Our website and services are not directed at children under the age of 16. We do not knowingly collect personal information from anyone under 16. If you believe we have inadvertently collected such information, please contact us at hello@lyptron.com and we will delete it promptly.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this privacy policy from time to time to reflect changes in our practices, services, or applicable law. When we make material changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.',
      'Continued use of the website after a policy update constitutes acceptance of the revised terms.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'If you have any questions, concerns, or requests relating to this privacy policy or the way we handle your personal information, please contact us at hello@lyptron.com. We take all privacy enquiries seriously and will respond promptly.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPageBody
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro="This policy explains what information Lyptron collects when you visit our website or engage our services, how that information is used, and the rights you have over it."
      sections={sections}
    />
  )
}
