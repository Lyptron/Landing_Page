'use client'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PRICING_TIERS = [
  {
    name: 'Design & Prototyping',
    price: '₹1.5L',
    suffix: 'Starting from',
    desc: 'Perfect for founders who need a polished brand identity, clean UI, and clickable prototypes before development begins.',
    features: ['User Research & Wireframing', 'Custom Design System in Figma', 'Interactive Clickable Prototypes', 'Developer-Ready Handoff'],
    accent: '#8ba4c0',
    glow: 'rgba(139,164,192,0.06)',
  },
  {
    name: 'Web / SaaS Build',
    price: '₹4.0L',
    suffix: 'Starting from',
    desc: 'For businesses ready to launch — we build your full product from frontend to backend, deployed and production-ready.',
    features: ['Next.js & React Architecture', 'Serverless APIs & Database', 'SEO & Performance Optimized', 'Cloud Deployment & CI/CD'],
    accent: '#c0a060',
    glow: 'rgba(192,160,96,0.06)',
    popular: true,
  },
  {
    name: 'Mobile App',
    price: '₹5.0L',
    suffix: 'Starting from',
    desc: 'Launch on both iOS and Android with a single codebase — native feel, smooth animations, and App Store ready.',
    features: ['React Native Cross-Platform', 'Custom Native Modules', 'App Store Submission', 'Push Notifications & Analytics'],
    accent: '#a0b090',
    glow: 'rgba(160,176,144,0.06)',
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [, setShouldAnimate] = useState(false)
  const { setCursorState } = useCursor()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const entranceTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        setShouldAnimate(true)
        gsap.fromTo('.pricing-header > *',
          { opacity: 0, y: 24, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out' }
        )
        gsap.fromTo('.pricing-card',
          { opacity: 0, y: 80, rotationX: 6, filter: 'blur(8px)', transformPerspective: 800 },
          { opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.25 }
        )
      }
    })

    return () => entranceTrigger.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
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
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-[120px]">

        {/* Header */}
        <div className="pricing-header flex flex-col items-center text-center gap-5 mb-16 md:mb-20">
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50">Investment</span>

          <h2 className="font-display font-bold text-[clamp(28px,5vw,68px)] text-white/90 tracking-[-0.04em] leading-[0.97]">
            Simple, honest pricing
          </h2>

          <p className="font-body text-[15px] md:text-[17px] text-white/35 max-w-[560px] leading-[1.7] mt-1">
            No hidden fees, no surprise invoices. You know exactly what you&apos;re paying for before we write a single line of code. Every project starts with a free scoping call.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PRICING_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`pricing-card group relative overflow-hidden transition-all duration-500 ${tier.popular ? 'md:-mt-3 md:mb-[-12px]' : ''}`}
              style={{
                background: `linear-gradient(160deg, ${tier.glow} 0%, rgba(255,255,255,0.008) 100%)`,
                border: `1px solid ${tier.popular ? `${tier.accent}25` : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '16px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${tier.accent}40`
                e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${tier.accent}15`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = tier.popular ? `${tier.accent}25` : 'rgba(255,255,255,0.05)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)` }}
                />
              )}

              <div className="p-7 lg:p-9 flex flex-col h-full">
                {/* Popular tag */}
                {tier.popular && (
                  <div className="flex items-center gap-1.5 mb-5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: tier.accent }} />
                    <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: tier.accent }}>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-semibold text-[20px] text-white/85 mb-2.5 tracking-tight group-hover:text-white transition-colors duration-300">
                    {tier.name}
                  </h3>
                  <p className="font-body text-[13px] text-white/30 leading-[1.65] group-hover:text-white/40 transition-colors duration-300">
                    {tier.desc}
                  </p>
                </div>

                <div className="mb-8 pb-7 border-b border-white/[0.05]">
                  <span className="font-mono text-[10px] text-white/25 uppercase tracking-wider block mb-2">
                    {tier.suffix}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-[40px] text-white/85 tracking-tighter group-hover:text-white transition-colors duration-300">
                      {tier.price}
                    </span>
                    <span className="font-mono text-[11px] text-white/25 uppercase tracking-widest">+ GST</span>
                  </div>
                </div>

                <div className="flex-1">
                  <span className="font-mono text-[10px] text-white/20 uppercase tracking-[0.15em] block mb-4">
                    What&apos;s Included
                  </span>
                  <ul className="flex flex-col gap-3.5">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: `${tier.accent}12`,
                            border: `1px solid ${tier.accent}25`,
                          }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: `${tier.accent}` }} />
                        </div>
                        <span className="font-body text-[14px] text-white/35 leading-tight group-hover:text-white/50 transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA button */}
                <div className="mt-8">
                  <button
                    className="group/btn w-full flex items-center justify-center gap-2 py-3 rounded-lg font-body font-medium text-[13px] transition-all duration-300 cursor-none"
                    style={{
                      background: tier.popular ? tier.accent : 'rgba(255,255,255,0.04)',
                      color: tier.popular ? '#050505' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${tier.popular ? tier.accent : 'rgba(255,255,255,0.06)'}`,
                    }}
                    onMouseEnter={(e) => {
                      setCursorState('hover')
                      if (!tier.popular) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      setCursorState('default')
                      if (!tier.popular) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Book a free call
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise — warmer, more inviting */}
        <div
          className="pricing-card mt-10 relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(192,160,96,0.04) 0%, rgba(139,164,192,0.03) 50%, rgba(192,152,120,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-display font-bold text-[22px] text-white/85">Need something bigger?</h4>
              </div>
              <p className="font-body text-[15px] text-white/35 leading-[1.7]">
                Complex AI integrations, multi-platform launches, or enterprise-grade systems — we scope custom projects to match your exact needs. No cookie-cutter solutions.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                {['Custom AI Pipelines', 'Multi-Platform', 'Enterprise SLA', 'Dedicated Team'].map(tag => (
                  <span key={tag} className="font-mono text-[10px] text-white/25 tracking-wider uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="group/btn shrink-0 flex items-center gap-2.5 px-7 py-3.5 rounded-lg font-body font-medium text-[13px] text-white/70 transition-all duration-300 cursor-none hover:text-white hover:bg-white/[0.06]"
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
