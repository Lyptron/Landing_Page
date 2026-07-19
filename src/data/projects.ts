import { Project } from '../types'

export const projects: Project[] = [
  {
    id: 'nexusflow',
    name: 'NexusFlow',
    type: 'SaaS Platform',
    year: '2025',
    desc: 'Full-stack SaaS platform with billing, team permissions, and real-time analytical dashboards.',
    result: '₹0 → ₹10L MRR in 4 months',
    tags: ['Next.js', 'Stripe', 'Supabase', 'Tailwind'],
    size: 'large',
    accent: '#1d7ef5',
    accentGlow: 'rgba(29,126,245,0.15)',
    number: '01',
    url: 'https://nexus-flow-sand.vercel.app/',
    caseStudy: {
      tagline: 'A workflow engine for teams who were tired of babysitting Zapier at 2am.',
      cover: '/images/previews/nexusflow.png',
      role: 'Product design, full-stack build, infra',
      timeline: '9 weeks, start to launch',
      overview:
        "NexusFlow lets small ops teams wire APIs, database events, and LLM steps into workflows they can actually trust — no queue-of-queues held together with cron jobs and hope.",
      challenge: {
        heading: 'What we walked into',
        body: [
          "The founder was three founders in one — running product, running ops, and running the on-call rotation for a Zapier board that would silently drop jobs every couple of weeks. Their ops stack was a Notion database, a Google Sheet, six vendor APIs, and a homegrown cron worker on a Digital Ocean droplet. When something failed, nobody noticed until a customer emailed.",
          "They didn't want another integrations platform. They wanted the specific thing that would let them fire their homegrown thing without losing a Saturday to migration hell.",
          "We had nine weeks before their next investor update. Long enough to build something real, short enough to have to say no to almost everything.",
        ],
      },
      approach: {
        heading: 'How we built it',
        body: [
          "First week was mostly listening. We mapped the ten workflows that actually mattered to the business and used those as the acceptance test. Anything that didn't fit one of those ten got pushed to a v2 list nobody was allowed to look at until launch.",
          "The engine ended up being smaller than we thought. A little state machine over a Postgres job table, with idempotency keys on every step so retries don't do the same thing twice. Boring on paper, which is exactly what you want from the piece that runs every night at 3am.",
          "The UI is a two-pane thing — graph on the left, form for whatever's selected on the right. That one abstraction handles triggers, transforms, and destinations, which meant we shipped fewer screens and got them right. Stripe metered billing, Supabase row-level security so tenants can't accidentally see each other's runs, per-workspace API tokens. That's the whole thing.",
        ],
        highlights: [
          "Idempotent step executor over Postgres — retries are safe by default, not a footgun",
          "Row-level security on every tenant table, so app code stopped carrying tenant checks",
          "Metered billing wired to run counts, not seats — matches how customers actually think about cost",
          "Real-time run timeline with per-step structured logs, searchable by tenant",
        ],
      },
      outcomes: {
        heading: 'Where it landed',
        metrics: [
          { value: '₹0 → ₹10L', label: 'MRR by month 4' },
          { value: '99.99%', label: 'workflow uptime' },
          { value: '8.4ms', label: 'p50 step latency' },
          { value: '−72%', label: 'time to add a new integration' },
        ],
        body: [
          "14 waitlist customers on day one. ₹10L MRR by month four. The engineering team went from a three-day slog for each new integration to under six hours. The founder, for what it's worth, stopped opening PagerDuty on his phone before he'd had coffee.",
        ],
      },
      stack: ['Next.js 15', 'React Server Components', 'Supabase (Postgres + RLS)', 'Stripe Billing', 'Tailwind v4', 'TypeScript', 'Vercel'],
    },
  },
  {
    id: 'voxai',
    name: 'VoxAI',
    type: 'AI Integration',
    year: '2025',
    desc: 'Advanced LLM support assistant handling complex multi-step tickets automatically.',
    result: 'Saved 40 hrs/week',
    tags: ['OpenAI', 'LangChain', 'Python', 'FastAPI'],
    size: 'medium',
    accent: '#8b5cf6',
    accentGlow: 'rgba(139,92,246,0.15)',
    number: '02',
    url: 'https://vox-ai-henna.vercel.app/',
    caseStudy: {
      tagline: 'A routing layer that picks the right model per call — and cuts the token bill roughly in half.',
      cover: '/images/previews/voxai.png',
      role: 'AI architecture, backend',
      timeline: '6 weeks',
      overview:
        "VoxAI sits in front of your existing LLM calls and quietly picks the cheapest model that still does the job — with a shadow eval loop so you notice quality drops before the customer does.",
      challenge: {
        heading: 'What we walked into',
        body: [
          "The team was pushing everything through GPT-4 because it was the safe default. The bill was climbing 20% every month and nobody could point at anything that had actually changed. When we looked at their traffic, half of it was three-sentence summaries and one-line classifications — the kind of thing a smaller model would have handled indistinguishably.",
          "They didn't want to rewrite the product to try five providers. They wanted to keep their code the way it was, and have a smart thing in the middle that made better decisions than a human ever would.",
        ],
      },
      approach: {
        heading: 'How we built it',
        body: [
          "We shipped a tiny SDK that shims the OpenAI chat-completions interface. Their product changed by two lines. Everything else lives inside the shim.",
          "Every request runs through a classifier that decides what family of task it is — extraction, summarisation, reasoning, generation — and picks the smallest model in the customer's chosen tier that's been benchmarked as capable. A judge model shadow-evaluates 1% of responses, so we notice quality drift before support does. When a provider has a bad hour (and they all do), the router quietly fails over to the next one on the list.",
        ],
        highlights: [
          "Drop-in SDK shim — two-line change on the product side, honest",
          "Prompt classifier picks the cheapest capable model per call",
          "Shadow-eval on 1% of traffic catches quality drops before customers do",
          "Automatic failover when a provider's p95 spikes or 5xx rate climbs",
        ],
      },
      outcomes: {
        heading: 'Where it landed',
        metrics: [
          { value: '42%', label: 'token cost cut' },
          { value: '94%', label: 'resolution rate held' },
          { value: '40 hrs/wk', label: 'ops time reclaimed' },
          { value: '<180ms', label: 'added routing latency' },
        ],
        body: [
          "Paid for itself in month one. The ops team stopped watching the provider status page. They run three vendors in rotation now, which was unthinkable when everything was hardcoded to a single SDK.",
        ],
      },
      stack: ['Python 3.12', 'FastAPI', 'OpenAI + Anthropic + Groq SDKs', 'LangChain', 'Postgres', 'Redis', 'Fly.io'],
    },
  },
  {
    id: 'pulsetrack',
    name: 'PulseTrack',
    type: 'Mobile Application',
    year: '2025',
    desc: 'iOS & Android health tracking application integrated with multiple external fitness APIs.',
    result: '10k downloads week 1',
    tags: ['React Native', 'Expo', 'GraphQL'],
    size: 'medium',
    accent: '#22c55e',
    accentGlow: 'rgba(34,197,94,0.15)',
    number: '03',
    url: 'https://pluse-track-pi.vercel.app/',
    caseStudy: {
      tagline: 'One activity ring, three fitness APIs, and a battery loop that doesn\'t torch your phone.',
      cover: '/images/previews/pulsetrack.png',
      role: 'Product design, React Native, HealthKit',
      timeline: '8 weeks — design, build, App Store',
      overview:
        "PulseTrack folds Oura, Garmin, and Apple Health into one daily instrument panel — so a runner can glance at her sleep, HRV, and recovery in one place instead of switching between three apps that don't talk to each other.",
      challenge: {
        heading: 'What we walked into',
        body: [
          "The founder had watched too many friends bail on fitness apps because the data was scattered across four dashboards, each with its own idea of what \"good\" meant. He wanted something phone-first that fused every device someone already owned into a single score they could actually read.",
          "The bar was Apple Health polish on a much smaller budget. And the sync loop couldn't kill batteries — that's the single most common one-star review in the category, and killing it was non-negotiable.",
        ],
      },
      approach: {
        heading: 'How we built it',
        body: [
          "The activity ring is the whole product. So we designed around it first. One canvas, three tabs, and everything else had to earn its keep by supporting the ring or the personal-best moments underneath it. When something didn't, it got cut.",
          "On the sync side, we did it the boring way: BackgroundTasks plus Silent Push, batched to run once an hour instead of on every wake. That's the difference between an app that quietly does its job and one that shows up in the battery-usage screen with an angry orange bar.",
          "Under the hood we normalise every provider's cadence data into one canonical schema at ingest. The UI never has to know which watch a data point came from. Two weeks after launch we added Whoop and Fitbit as a data-only change — no UI work.",
        ],
        highlights: [
          "60fps animated ring on a ₹8,000 device — plain Reanimated + SVG, no Skia",
          "HRV + sleep + activity fused into a single 0–100 readiness score at ingest",
          "BackgroundTasks + Silent Push, batched hourly — 0.02%/h battery impact",
          "HIPAA-compliant storage with per-user encryption keys",
        ],
      },
      outcomes: {
        heading: 'Where it landed',
        metrics: [
          { value: '10k+', label: 'week-1 downloads' },
          { value: '4.9/5', label: 'App Store rating' },
          { value: '0.02%/h', label: 'battery impact' },
          { value: '120fps', label: 'ring on ProMotion devices' },
        ],
        body: [
          "Apple featured it in \"New Apps We Love\" the second week. Day-30 retention sits at 41%, roughly three times the category median. The founder's mom uses it every day, which is how we know it works.",
        ],
      },
      stack: ['React Native', 'Expo Router', 'Reanimated 3', 'HealthKit + Health Connect', 'Supabase', 'GraphQL (urql)'],
    },
  },
  {
    id: 'stratum',
    name: 'Stratum',
    type: 'Brand Design',
    year: '2025',
    desc: 'Complete corporate rebranding, marketing asset kit, and Next.js brochure portal.',
    result: '#1 on Google in 3 months',
    tags: ['Next.js', 'Figma', 'SEO'],
    size: 'small',
    accent: '#ec4899',
    accentGlow: 'rgba(236,72,153,0.15)',
    number: '04',
    url: 'https://stratum-one-gamma.vercel.app/',
    caseStudy: {
      tagline: 'A rebrand, a brochure site, and a 420ms LCP — ranked #1 for their exact-match query in a quarter.',
      cover: '/images/previews/stratum.png',
      role: 'Brand system, art direction, Next.js build',
      timeline: '5 weeks',
      overview:
        "Stratum is a B2B API infrastructure company whose old site the founder called \"the tax we pay for existing on Google.\" We rebuilt the brand and the marketing site in five weeks.",
      challenge: {
        heading: 'What we walked into',
        body: [
          "Two years of tech-debt build-up had left the old site with a 4.3s LCP on mobile, a wordmark that looked like a placeholder somebody forgot to replace, and content spread across seven WordPress pages that nobody could touch without breaking layout. Sales calls started with \"sorry, our site is being redone.\" That's a rough opener.",
          "They wanted a brand that read as premium infrastructure — closer to Cloudflare than to a Series-A startup — and a marketing site fast enough to score 100 on mobile Lighthouse. Not the standard \"we tried our best\" 92.",
        ],
      },
      approach: {
        heading: 'How we built it',
        body: [
          "The brand direction is almost entirely monochrome with a single hot accent, pulled from the mustard yellow of an old oscilloscope trace. Söhne Breit for display, JetBrains Mono for the technical bits. The wordmark got weight from the letterforms themselves, not from ornament.",
          "The whole marketing site is static Next.js with zero client-side JavaScript on the content pages. MDX for the writing, ISR for the changelog, an Edge middleware to A/B test headlines without shipping any client code. Everything reuses the same three type sizes and eight-column grid. What makes it feel disciplined isn't the palette — it's the fact that nothing on the page is doing more than one job.",
          "LCP came in at 420ms on mid-tier 4G. Lighthouse 100 across all four metrics.",
        ],
        highlights: [
          "Monochrome plus one hot accent — the discipline is in what we left out",
          "Zero-JS marketing pages, MDX for content, ISR for the changelog",
          "420ms LCP on 4G, Lighthouse 100 across all four scores",
          "Edge middleware for lightweight headline A/B tests without a bundle hit",
        ],
      },
      outcomes: {
        heading: 'Where it landed',
        metrics: [
          { value: '#1', label: 'on Google for exact-match query, 3 months' },
          { value: '100/100', label: 'Lighthouse (all four)' },
          { value: '420ms', label: 'p75 LCP on 4G' },
          { value: '+38%', label: 'inbound demo requests' },
        ],
      },
      stack: ['Next.js 15 App Router', 'MDX', 'Vercel Edge', 'Figma design system', 'Tailwind v4', 'Söhne + JetBrains Mono'],
    },
  },
  {
    id: 'novaportal',
    name: 'NovaPortal',
    type: 'B2B Client Portal',
    year: '2025',
    desc: 'Secure document vault and reporting system for high-net-worth real estate operations.',
    result: 'Reduced admin overhead by 35%',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    size: 'small',
    accent: '#f97316',
    accentGlow: 'rgba(249,115,22,0.15)',
    number: '05',
    url: 'https://nova-portal-beta.vercel.app/',
    caseStudy: {
      tagline: 'A document vault for a real-estate operator whose clients expected concierge, not a Dropbox link.',
      cover: '/images/previews/novaportal.png',
      role: 'Product design, full-stack build, security',
      timeline: '11 weeks',
      overview:
        "NovaPortal is the client side of a boutique real-estate firm managing eight-figure portfolios. Owners log in to review documents, sign disclosures, and pull live reporting — with every access individually attested and logged.",
      challenge: {
        heading: 'What we walked into',
        body: [
          "The team was emailing 200-page PDFs and asking owners to print, sign, and re-scan. Two things had to change: the surface (the brand is quiet luxury, and Dropbox looks nothing like quiet luxury), and the substance (they were one accidental reply-all away from a compliance conversation nobody wanted to have).",
          "The portal had to feel like an extension of the concierge relationship — deliberate, unhurried, the exact opposite of a SaaS dashboard — while enforcing bank-grade access controls where the client would never see them.",
        ],
      },
      approach: {
        heading: 'How we built it',
        body: [
          "The design leans editorial. Serif display, wide margins, cinematic transitions borrowed from high-end print catalogs. The whole product runs on a single continuous canvas — no sidebar, no tabs, no SaaS chrome. It reads like a document you were handed, not an app you have to learn.",
          "Underneath, the security is layered. Per-document ACLs sitting on Postgres row-level security. Envelope encryption for stored files with KMS-managed data keys and S3 SSE-KMS. Every access — view, download, share — appended to an audit log with a signed hash chain, so any tampering is verifiable after the fact. Owners log in with passkeys; staff need a hardware key.",
        ],
        highlights: [
          "Editorial single-canvas UI — no sidebar, no tabs, no SaaS chrome",
          "Envelope encryption per document, KMS-managed keys, S3 SSE-KMS",
          "Signed hash-chain audit log — every access verifiable after the fact",
          "Passkeys for owners, hardware keys required for staff",
        ],
      },
      outcomes: {
        heading: 'Where it landed',
        metrics: [
          { value: '−35%', label: 'admin overhead' },
          { value: '256-bit', label: 'envelope encryption' },
          { value: '45MB/s', label: 'streaming download' },
          { value: '0', label: 'security incidents, six months' },
        ],
        body: [
          "The concierge team went from spending a third of their week wrangling documents to spending it on the actual relationship — which is the entire thing clients pay the premium for.",
        ],
      },
      stack: ['React 19', 'Node.js + Fastify', 'PostgreSQL 16 (RLS)', 'AWS KMS + S3', 'Passkeys (WebAuthn)', 'Tailwind v4'],
    },
  }
]
