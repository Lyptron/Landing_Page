'use client'
import { useRef, useEffect } from 'react'
import { Check, ArrowRight, Sparkles, Clock, Users } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'

const BOOKING_EMAIL = 'hello@lyptron.com'
const bookCall = (subject: string) => {
  window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}`
}

const PRICING_TIERS = [
  {
    name: 'Design & Prototyping',
    tagline: 'Brand, UI & clickable prototypes',
    desc: 'For founders who need a polished brand identity, clean UI system, and a stakeholder-ready clickable prototype before any development begins.',
    bestFor: 'Founders validating concepts',
    timeline: '2–3 weeks',
    features: [
      'User Research & Competitive Analysis',
      'Low-fi Wireframes for all core flows',
      'High-fidelity Responsive UI in Figma',
      'Design Tokens & Component Library',
      'Interactive Clickable Prototypes',
      'Usability Testing — up to 3 rounds',
      'Brand Identity & Style Guide',
      'Developer-Ready Handoff Documentation',
    ],
    addons: 'Motion specs, illustration, icon set',
    accent: '#8ba4c0',
    glow: 'rgba(139,164,192,0.06)',
    price: '000000',
  },
  {
    name: 'Web / SaaS Build',
    tagline: 'Full-stack, production-ready product',
    desc: 'For businesses ready to launch — we build your full product from frontend to backend, deployed, monitored, and production-ready from day one.',
    bestFor: 'Businesses launching a product',
    timeline: '4–6 weeks',
    features: [
      'Everything in Design & Prototyping',
      'Next.js + React Frontend Architecture',
      'Serverless APIs & PostgreSQL Database',
      'Auth, Billing (Stripe) & Admin Panel',
      'SEO-Optimized Semantic Markup',
      'Automated Testing & QA Suite',
      'Cloud Deployment & CI/CD Pipeline',
      'Performance Audit — Lighthouse 100',
    ],
    addons: 'AI integration, multi-language, CMS',
    accent: '#c0a060',
    glow: 'rgba(192,160,96,0.06)',
    popular: true,
    price: '000000',
  },
  {
    name: 'Mobile App',
    tagline: 'iOS & Android from one codebase',
    desc: 'Launch simultaneously on iOS and Android with React Native — native performance, smooth animations, and App Store ready on both platforms.',
    bestFor: 'Startups targeting mobile-first users',
    timeline: '4–8 weeks',
    features: [
      'React Native Cross-Platform Architecture',
      'Custom Native Modules & Device APIs',
      'Offline Support & Local Data Caching',
      'Push Notifications & In-App Messaging',
      'In-App Purchase & Subscription Billing',
      'Background Tasks & Location Services',
      'App Store & Play Store Submission',
      'Post-Launch Crash Monitoring',
    ],
    addons: 'Wearable sync, AR features, live maps',
    accent: '#a0b090',
    glow: 'rgba(160,176,144,0.06)',
    price: '000000',
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { setCursorState } = useCursor()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let cancelled = false
    let ctx: { revert: () => void } | null = null

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            // Animate only transform + opacity (compositor-friendly). The
            // previous version tweened `filter: blur()` across the full-width
            // header and three large cards, which repaints a big area every
            // frame and made the whole section feel chunky.
            gsap.fromTo('.pricing-header > *',
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            )
            gsap.fromTo('.pricing-card',
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
            )
          }
        })
      }, el)
    })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 md:py-36 select-none overflow-hidden z-10"
      style={{ background: '#050505' }}
    >
      {/* Warm spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[5%]"
          style={{
            width: '80%',
            maxWidth: '1000px',
            height: '500px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-30">

        {/* Header */}
        <div className="pricing-header flex flex-col items-center text-center gap-5 mb-16 md:mb-20">
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50">Investment</span>
          <h2 className="font-display font-bold text-[clamp(28px,5vw,68px)] text-white/90 tracking-[-0.04em] leading-[0.97]">
            Pricing built around your project
          </h2>
          <p className="font-body text-[15px] md:text-[17px] text-white/35 max-w-140 leading-[1.7] mt-1">
            No two projects are the same, so we don&apos;t force one into a fixed price tag. Tell us your scope on a free call and we&apos;ll send a clear, itemized quote within 48 hours.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none gap-5 pb-6 px-6 lg:px-0 lg:grid lg:grid-cols-3 lg:gap-5">
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className="pricing-card group relative overflow-hidden shrink-0 snap-center w-[82vw] sm:w-90 lg:w-auto flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.016)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                // Only transition the cheap paint properties on hover — not
                // `all` (which was also tweening the background gradient).
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${tier.accent}45`
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px ${tier.accent}12`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Accent top line — only for popular */}
              {tier.popular && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${tier.accent}80, transparent)` }}
                />
              )}

              <div className="p-7 lg:p-8 flex flex-col flex-1">

                {/* Popular badge */}
                {tier.popular && (
                  <div className="flex items-center gap-1.5 mb-5">
                    <Sparkles className="w-3 h-3" style={{ color: tier.accent }} />
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: `${tier.accent}90` }}>
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Name + desc */}
                <div className="mb-5">
                  <h3 className="font-display font-semibold text-[20px] text-white/88 mb-2.5 tracking-tight group-hover:text-white transition-colors duration-300">
                    {tier.name}
                  </h3>
                  <p className="font-body text-[13px] text-white/32 leading-[1.7] group-hover:text-white/42 transition-colors duration-300">
                    {tier.desc}
                  </p>
                </div>

                {/* Meta row: best for + timeline */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 shrink-0" style={{ color: `${tier.accent}80` }} />
                    <span className="font-mono text-[10px] text-white/30 tracking-wide">
                      {tier.bestFor}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" style={{ color: `${tier.accent}80` }} />
                    <span className="font-mono text-[10px] text-white/30 tracking-wide">
                      {tier.timeline}
                    </span>
                  </div>
                </div>

                {/* What's included */}
                <div className="flex-1 mb-6">
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] block mb-4">
                    What&apos;s Included
                  </span>
                  <ul className="flex flex-col gap-3">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: `${tier.accent}12`,
                            border: `1px solid ${tier.accent}28`,
                          }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: tier.accent }} />
                        </div>
                        <span className="font-body text-[13px] text-white/38 leading-tight group-hover:text-white/52 transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Add-ons */}
                  <div className="mt-5 pt-4 border-t border-white/[0.04]">
                    <span className="font-mono text-[9px] text-white/16 uppercase tracking-[0.18em] block mb-1.5">
                      Add-ons available
                    </span>
                    <p className="font-body text-[12px] text-white/24 leading-relaxed">
                      {tier.addons}
                    </p>
                  </div>
                </div>

                {/* CTA — full width */}
                <div className="mt-auto pt-5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => bookCall(`Get pricing — ${tier.name}`)}
                    className="group/btn w-full flex items-center justify-center gap-2 py-3 rounded-lg font-body font-medium text-[13px] transition-all duration-300 cursor-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                    style={{
                      background: tier.popular ? tier.accent : 'transparent',
                      color: tier.popular ? '#050505' : 'rgba(255,255,255,0.45)',
                      border: `1px solid ${tier.popular ? tier.accent : 'rgba(255,255,255,0.08)'}`,
                    }}
                    onMouseEnter={(e) => {
                      setCursorState('hover')
                      if (!tier.popular) {
                        e.currentTarget.style.borderColor = `${tier.accent}50`
                        e.currentTarget.style.color = 'rgba(255,255,255,0.82)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      setCursorState('default')
                      if (!tier.popular) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                      }
                    }}
                  >
                    Book a free scoping call
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise bar */}
        <div
          className="pricing-card mt-10 relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(192,160,96,0.04) 0%, rgba(139,164,192,0.03) 50%, rgba(192,152,120,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-2xl">
              <h4 className="font-display font-bold text-[22px] text-white/85">
                Need something bigger?
              </h4>
              <p className="font-body text-[15px] text-white/35 leading-[1.7]">
                Complex AI integrations, multi-platform launches, or enterprise-grade systems — we scope custom projects to match your exact needs. No cookie-cutter solutions.
              </p>
              <div className="flex flex-wrap gap-4 mt-1">
                {['Custom AI Pipelines', 'Multi-Platform', 'Enterprise SLA', 'Dedicated Team'].map(tag => (
                  <span key={tag} className="font-mono text-[10px] text-white/25 tracking-wider uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => bookCall('Custom project — let\'s talk scope')}
              className="group/btn shrink-0 flex items-center gap-2.5 px-7 py-3.5 rounded-lg font-body font-medium text-[13px] text-white/70 transition-all duration-300 cursor-none hover:text-white hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              Let&apos;s talk scope
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Trust note */}
        <div className="pricing-card mt-8 text-center">
          <p className="font-body text-[13px] text-white/20 leading-relaxed">
            Every engagement starts with a <span className="text-white/40">free 30-minute scoping call</span>. We only take projects we can deliver with excellence.
          </p>
        </div>

      </div>
    </section>
  )
}
