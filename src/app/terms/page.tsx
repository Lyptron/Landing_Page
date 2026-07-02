import { Metadata } from 'next'
import LegalPageBody from '@/components/sections/LegalPageBody'

const SITE_URL = 'https://lyptron.com'
const LAST_UPDATED = 'July 2, 2026'

export const metadata: Metadata = {
  title: 'Terms of Service — Lyptron',
  description: 'The terms governing use of the Lyptron website and the engagement of Lyptron services.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service — Lyptron',
    description: 'The terms governing use of the Lyptron website and the engagement of Lyptron services.',
    url: `${SITE_URL}/terms`,
    type: 'website',
  },
}

const sections = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By accessing or using the Lyptron website (lyptron.com) or by engaging Lyptron for any services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the website or engage our services.',
      'These terms apply to all visitors, clients, and anyone who interacts with Lyptron through this website or through a service engagement. They govern your use of the website and, together with any applicable project proposal or agreement, the delivery of services.',
    ],
  },
  {
    heading: 'About Lyptron',
    paragraphs: [
      'Lyptron is a digital product studio that delivers web development, AI automation, UI/UX design, and SEO services. We work with startups, scale-ups, and established businesses to build high-performance digital products and marketing systems.',
      'All enquiries can be directed to hello@lyptron.com.',
    ],
  },
  {
    heading: 'Use of the website',
    paragraphs: [
      'You may use this website for lawful purposes only. You agree not to use it in any way that violates applicable local, national, or international law or regulation; that is fraudulent or has any harmful, unlawful, or deceptive purpose; to transmit unsolicited communications; or to attempt to gain unauthorised access to any part of the website or its underlying infrastructure.',
      'We reserve the right to restrict or terminate access to the website for any user who violates these terms or who we reasonably believe poses a risk to the integrity or security of the website.',
      'The content on this website — including text, images, graphics, code examples, and case study descriptions — is provided for informational purposes only and does not constitute professional advice of any kind.',
    ],
  },
  {
    heading: 'Engaging our services',
    paragraphs: [
      'Submitting our contact form or sending an email enquiry does not create a binding service agreement. A binding engagement only begins when both parties have agreed in writing to a project proposal, statement of work, or equivalent document that defines the scope, timeline, deliverables, and pricing.',
      'We typically begin with a free discovery or scoping call to understand your requirements. Following that, we provide a written proposal that outlines what we will deliver, how long it will take, and what it will cost. Work begins only after written acceptance of the proposal.',
      'Any changes to scope after a project begins must be agreed in writing. Additional scope may result in revised timelines and additional fees, which will be communicated and confirmed before work proceeds.',
    ],
  },
  {
    heading: 'Fees and payment',
    paragraphs: [
      'Project fees are set out in the applicable proposal or agreement. Unless otherwise agreed, we invoice on a milestone basis — typically 50% at project commencement and 50% upon delivery, or as defined per project.',
      'Invoices are due within 14 days of the invoice date unless a different payment schedule has been agreed in writing. Late payments may incur interest at a rate of 1.5% per month on the outstanding balance from the due date.',
      'If a client fails to make payment within 30 days of the due date, we reserve the right to pause or terminate the engagement, withhold deliverables until payment is received, and recover reasonable costs incurred in collecting the overdue amount.',
      'All fees are quoted exclusive of applicable taxes unless stated otherwise. You are responsible for any taxes, duties, or levies imposed by your jurisdiction on the services you receive.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'Upon receipt of full payment for a project, all custom-designed and custom-developed deliverables created specifically for that project — including designs, code, content, and documentation — transfer to the client.',
      'Lyptron retains full ownership of all pre-existing tools, frameworks, internal libraries, boilerplate code, design systems, and methodologies that were developed independently of the client engagement. Where such materials are incorporated into deliverables, we grant the client a perpetual, non-exclusive licence to use them as part of the delivered product.',
      'Lyptron reserves the right to include completed work in its portfolio and case studies for marketing and business development purposes, unless the client requests in writing prior to project commencement that the work remain confidential.',
      'Third-party components, libraries, fonts, or assets incorporated into deliverables are subject to their respective licences. We will clearly identify any such third-party materials and advise on licence requirements where relevant.',
    ],
  },
  {
    heading: 'Client responsibilities',
    paragraphs: [
      'A successful project depends on timely and accurate input from the client. You agree to provide all necessary materials, feedback, approvals, and access credentials within the timeframes set out in the project agreement.',
      'Delays caused by late or incomplete client input may result in revised timelines and, where significant, additional fees. We will communicate any such impact promptly and in writing.',
      'You represent and warrant that any content, assets, or materials you provide to us for use in the project — including text, images, trademarks, and data — are owned by you or that you have the right to use them, and that their use by Lyptron in delivering the project will not infringe any third-party rights.',
    ],
  },
  {
    heading: 'Confidentiality',
    paragraphs: [
      'We treat all client information shared during an engagement — including business plans, technical specifications, financial data, user data, and any proprietary information — as strictly confidential. We will not disclose such information to any third party except as necessary to deliver the agreed services.',
      'We are happy to sign a mutual non-disclosure agreement prior to discussing detailed project requirements. Please request one at hello@lyptron.com.',
      'These confidentiality obligations survive the termination of any engagement indefinitely.',
    ],
  },
  {
    heading: 'Warranties and representations',
    paragraphs: [
      'Lyptron warrants that services will be performed with reasonable skill and care, and that deliverables will materially conform to the agreed specifications at the time of delivery.',
      'We provide a 30-day post-launch bug fix warranty for all development projects. During this period we will resolve any defects in the delivered code that prevent it from functioning as agreed at no additional charge. This warranty does not cover issues arising from client modifications, third-party integrations not in scope, or changes to the operating environment.',
      'Beyond this warranty, the website and all content are provided "as is" and "as available". We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, Lyptron shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of this website or the services we provide, even if we have been advised of the possibility of such damages.',
      'Our total aggregate liability to you for any claim arising out of or in connection with a specific service engagement shall not exceed the total fees paid by you for that engagement in the 3 months immediately preceding the event giving rise to the claim.',
      'Nothing in these terms limits or excludes liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by applicable law.',
    ],
  },
  {
    heading: 'Indemnification',
    paragraphs: [
      'You agree to indemnify, defend, and hold harmless Lyptron and its team members from and against any claims, liabilities, damages, losses, and expenses — including reasonable legal fees — arising out of or in connection with your breach of these terms, your use of the website, any content or materials you provide to us, or your violation of any third-party rights.',
    ],
  },
  {
    heading: 'Termination',
    paragraphs: [
      'Either party may terminate an active engagement by providing written notice as specified in the applicable project agreement. In the absence of a specific clause, either party may terminate with 14 days written notice.',
      'Upon termination, you are required to pay for all work completed and costs incurred up to the termination date. Deliverables for completed milestones will be transferred upon receipt of payment for those milestones.',
      'Lyptron reserves the right to terminate an engagement immediately and without notice if a client engages in conduct that is abusive, unlawful, or materially breaches the project agreement.',
    ],
  },
  {
    heading: 'Dispute resolution',
    paragraphs: [
      'We are committed to resolving disputes fairly and efficiently. If a dispute arises, both parties agree to first attempt resolution through good-faith negotiation within 30 days of written notice of the dispute.',
      'If negotiation is unsuccessful, the parties agree to attempt mediation before pursuing formal legal proceedings. The costs of mediation shall be shared equally unless otherwise agreed.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      'These terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with applicable law. Any legal proceedings shall be conducted in the jurisdiction in which Lyptron is registered.',
    ],
  },
  {
    heading: 'Entire agreement',
    paragraphs: [
      'These terms, together with any applicable project proposal or agreement, constitute the entire agreement between you and Lyptron with respect to the subject matter herein and supersede all prior discussions, representations, or agreements.',
      'If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time to reflect changes in our services, operations, or applicable law. Material changes will be reflected in an updated "Last updated" date at the top of this page. We encourage you to review these terms periodically.',
      'Continued use of the website or engagement of services after an update constitutes acceptance of the revised terms.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'If you have any questions about these terms or would like to discuss a project engagement, please contact us at hello@lyptron.com. We aim to respond to all enquiries within one business day.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPageBody
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro="These terms govern your use of the Lyptron website and the general framework under which we engage with clients. Please read them carefully before submitting an enquiry or commencing a project."
      sections={sections}
    />
  )
}
