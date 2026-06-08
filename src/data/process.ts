import { ProcessStep } from '../types'

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery & Scope',
    desc: 'We start by understanding your business, users, and goals. Through structured workshops we define success metrics, map data flows, and outline a technical architecture — so everyone is aligned before a single line of code is written.',
    details: [
      'Stakeholder interviews and competitive landscape analysis',
      'User persona mapping and journey definition',
      'Technical architecture and API requirement documents',
      'Scope agreement with exact milestones and timeline',
      'Risk assessment and mitigation planning',
    ]
  },
  {
    number: '02',
    title: 'Design & Prototyping',
    desc: 'We translate strategy into visual experiences. Every screen is wireframed, every interaction is prototyped, and every design token is systematized — giving you a clickable preview of your product before development begins.',
    details: [
      'Low-fidelity wireframes for all core user flows',
      'High-fidelity responsive screen designs in Figma',
      'Reusable component library with design tokens',
      'Interactive clickable prototypes for stakeholder review',
      'Usability testing and iteration based on feedback',
    ]
  },
  {
    number: '03',
    title: 'Bespoke Development',
    desc: 'Our engineers build your product with clean, type-safe, production-grade code. Weekly demos keep you in the loop, and every feature is tested before it ships — no surprises, no tech debt.',
    details: [
      'Sprint-based development with weekly progress demos',
      'SEO-optimized semantic markup and accessibility',
      'Third-party integrations (payments, AI, APIs)',
      'Performance optimization — bundle size, queries, caching',
      'Automated test suites and code review process',
    ]
  },
  {
    number: '04',
    title: 'Launch & Growth',
    desc: 'We don\'t just deploy and disappear. We configure CI/CD pipelines, set up monitoring dashboards, run performance audits, and hand over complete documentation — so your team can own and scale what we built.',
    details: [
      'Production deployment with zero-downtime CI/CD',
      'Performance and security audit (Lighthouse 100)',
      'Analytics and monitoring dashboards setup',
      'Complete technical documentation and team handoff',
      '30-day post-launch support and optimization',
    ]
  }
]
