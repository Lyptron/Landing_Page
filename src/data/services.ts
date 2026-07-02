import { Service } from '../types'

export const services: Service[] = [
  {
    id: 'web-dev',
    number: '01',
    icon: '🌐',
    name: 'Web Development',
    tagline: 'Fast, SEO-optimized web experiences that convert.',
    desc: 'We build high-performance, responsive web apps using Next.js and React, configured for lightning fast load times, semantic accessibility, and clean architecture.',
    helps: [
      'Build your entire web presence from zero to production in weeks',
      'Optimise slow sites to load under 1s and climb Google rankings',
      'Architect scalable frontends your team can own and extend',
    ],
    works: [
      { name: 'NexusFlow', badge: 'SaaS', desc: 'Full marketing site + onboarding.', result: '62% increase in trial signups' },
      { name: 'Stratum',   badge: 'Brand', desc: 'Complete brand + website.', result: 'Ranked #1 in 3 months' },
    ],
    forYou: [
      'A website that converts visitors into paying customers',
      'A web app your users actually want to return to',
      'A performance audit of your existing site',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Vercel'],
    url: '/web-development',
  },
  {
    id: 'mobile-dev',
    number: '02',
    icon: '📱',
    name: 'Mobile Engineering',
    tagline: 'Native performance, cross-platform speed.',
    desc: 'Leveraging React Native and Expo, we deploy beautiful iOS and Android apps with shared codebases, keeping execution fast and native-feeling.',
    helps: [
      'Bring mobile concepts to Apple Store & Google Play simultaneously',
      'Integrate push notifications, geo-tracking, and background tasks',
      'Create custom native modules for bespoke hardware integrations',
    ],
    works: [
      { name: 'PulseTrack', badge: 'Health', desc: 'Wearable synced dashboard.', result: '10k+ downloads in Week 1' },
      { name: 'RideShare',  badge: 'Utility', desc: 'Realtime map matching.', result: 'Reduced dispatch delay by 40%' },
    ],
    forYou: [
      'A responsive application ready for the app store',
      'High-performance cross-platform mobile strategy',
      'Native feature sets built directly on top of React Native',
    ],
    stack: ['React Native', 'Expo', 'Swift', 'Kotlin', 'Redux Toolkit', 'Firebase'],
    url: '/mobile-development',
  },
  {
    id: 'ai-automation',
    number: '03',
    icon: '🤖',
    name: 'AI Integration',
    tagline: 'Augment operations with production-grade AI.',
    desc: 'Deploy custom LLM-powered agents, semantic search tools, and complex pipelines into your existing platform to automate workloads and eliminate human bottlenecks.',
    helps: [
      'Deploy customer support agents that handle 80% of ticket loads',
      'Implement vector search pipelines for internal document lookup',
      'Automate repetitive workflows with smart routing systems',
    ],
    works: [
      { name: 'VoxAI',     badge: 'Support', desc: 'Intelligent support bot.', result: 'Saved 40 hours per week' },
      { name: 'DocuQuery',  badge: 'SaaS',    desc: 'Internal compliance parser.', result: '99.4% audit accuracy rate' },
    ],
    forYou: [
      'Reduction of manual tasks using automated LLM actions',
      'Highly tailored chatbots reading directly from your database',
      'Semantic document processors using chunking frameworks',
    ],
    stack: ['Python', 'OpenAI', 'LangChain', 'Pinecone', 'FastAPI', 'AWS'],
    url: '/ai-automation',
  },
  {
    id: 'ui-ux-design',
    number: '04',
    icon: '🎨',
    name: 'UI/UX Design',
    tagline: 'Stunning design systems made to scale.',
    desc: 'We map detailed user journeys and structure robust Figma design systems that map perfectly to developer-friendly Tailwind configurations.',
    helps: [
      'Design clear, intuitive user flows that minimize churn',
      'Establish visual systems that make your brand memorable',
      'Ensure design compatibility across all responsive layouts',
    ],
    works: [
      { name: 'NovaPortal', badge: 'B2B',   desc: 'Next-gen enterprise dashboard.', result: 'User retention up 28%' },
      { name: 'Aero',       badge: 'Design', desc: 'Figma component library.', result: 'Accelerated dev by 2.5x' },
    ],
    forYou: [
      'Figma design system with interactive components',
      'User validation tests showing optimal click flows',
      'Modern, highly polished wireframes ready to build',
    ],
    stack: ['Figma', 'Adobe CC', 'Principle', 'Spline', 'Tailwind', 'CSS'],
    url: '/ui-ux-design',
  },
  {
    id: 'cloud-devops',
    number: '05',
    icon: '☁️',
    name: 'Cloud & Infrastructure',
    tagline: 'Resilient server setups that scale automatically.',
    desc: 'Configure Dockerized applications, Kubernetes orchestrations, and secure database clustering with automated CI/CD pipelines for zero-downtime upgrades.',
    helps: [
      'Scale to millions of requests without drop-offs',
      'Configure automatic backups and high-availability database clusters',
      'Set up secure firewalls and modern server monitoring tools',
    ],
    works: [
      { name: 'CloudScale', badge: 'DevOps', desc: 'Auto-scaling cluster setup.', result: '99.99% uptime during spikes' },
      { name: 'SafeVault',  badge: 'FinTech', desc: 'PCI-compliant cloud arch.', result: 'Passed audits with zero remarks' },
    ],
    forYou: [
      'Reliable CI/CD pipelines executing deployment suites',
      'Load-balanced servers distributed internationally',
      'Infrastructure as code templates using Terraform',
    ],
    stack: ['AWS', 'Docker', 'Terraform', 'Kubernetes', 'GitHub Actions', 'Datadog'],
    url: '/cloud-infrastructure',
  },
  {
    id: 'brand-strategy',
    number: '06',
    icon: '⚡',
    name: 'Brand & Growth Strategy',
    tagline: 'Position your business to win.',
    desc: 'Align your marketing strategy, technical SEO structures, and brand positioning to drive sustainable organic lead generation and dominate search results.',
    helps: [
      'Generate clear traffic acquisition funnels that scale organically',
      'Optimize technical search metrics to secure front-page ranking',
      'Define unique core values that make your software shine',
    ],
    works: [
      { name: 'ApexLabs',  badge: 'SaaS',  desc: 'Market repositioning strategy.', result: '3.2x increase in qualified leads' },
      { name: 'FinFlow',   badge: 'SEO',   desc: 'Targeted content sprint.', result: '180% organic impressions boost' },
    ],
    forYou: [
      'Detailed competitor mapping and messaging profiles',
      'SEO audits identifying quick-win index improvements',
      'Tailored content calendars mapped to search intent',
    ],
    stack: ['Ahrefs', 'Semrush', 'Google Analytics', 'Notion', 'Hotjar', 'Screaming Frog'],
    url: '/seo-services',
  }
]
