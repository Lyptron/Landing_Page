import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Service } from '@/types'
import Footer from '../layout/Footer'

interface FAQ {
  q: string
  a: string
}

interface ServicePageBodyProps {
  service: Service
  faqs: FAQ[]
}

export default function ServicePageBody({ service, faqs }: ServicePageBodyProps) {
  return (
    <>
      <main className="relative w-full bg-bg text-white pt-32 md:pt-44 pb-24">
        <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-[11px] text-white/30 uppercase tracking-wider">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/50">{service.name}</li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="mb-16 max-w-[760px]">
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50 block mb-6">
              {service.tagline}
            </span>
            <h1 className="font-display font-bold text-[clamp(32px,5.5vw,64px)] leading-[1.02] tracking-[-0.03em] text-white/90 mb-6">
              {service.name}
            </h1>
            <p className="font-body text-[16px] md:text-[18px] text-white/40 leading-[1.7]">
              {service.desc}
            </p>
          </header>

          {/* What's included */}
          <section className="mb-16">
            <h2 className="font-display font-semibold text-[22px] text-white/80 mb-6 border-b border-white/[0.06] pb-4">
              What&apos;s included
            </h2>
            <ul className="flex flex-col gap-5">
              {service.helps.map((help) => (
                <li key={help} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-white/30" aria-hidden="true" />
                  <span className="font-body text-[15px] text-white/45 leading-relaxed">{help}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Results */}
          <section className="mb-16">
            <h2 className="font-display font-semibold text-[22px] text-white/80 mb-6 border-b border-white/[0.06] pb-4">
              Recent results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {service.works.map((work) => (
                <div
                  key={work.name}
                  className="p-5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-display font-semibold text-[15px] text-white/80">{work.name}</h3>
                    <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">{work.badge}</span>
                  </div>
                  <p className="font-body text-[13px] text-white/30 mb-3 leading-relaxed">{work.desc}</p>
                  <span className="font-mono text-[11px] text-white/55 tracking-wide uppercase">{work.result}</span>
                </div>
              ))}
            </div>
          </section>

          {/* For you */}
          <section className="mb-16">
            <h2 className="font-display font-semibold text-[22px] text-white/80 mb-6 border-b border-white/[0.06] pb-4">
              This is for you if you need
            </h2>
            <ul className="flex flex-col gap-3">
              {service.forYou.map((item) => (
                <li key={item} className="font-body text-[15px] text-white/45 leading-relaxed pl-5 border-l border-white/[0.08]">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Stack */}
          <section className="mb-16">
            <h2 className="font-display font-semibold text-[22px] text-white/80 mb-6 border-b border-white/[0.06] pb-4">
              Tech stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {service.stack.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] font-mono text-[11px] text-white/45 tracking-wider uppercase"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="font-display font-semibold text-[22px] text-white/80 mb-6 border-b border-white/[0.06] pb-4">
              Frequently asked questions
            </h2>
            <div className="flex flex-col gap-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-display font-semibold text-[16px] text-white/75 mb-2">{faq.q}</h3>
                  <p className="font-body text-[14px] text-white/35 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <h2 className="font-display font-bold text-[22px] text-white/90 mb-1.5">Ready to start?</h2>
              <p className="font-body text-[14px] text-white/35">Book a free 30-minute call — no pressure, just answers.</p>
            </div>
            <Link
              href="/#cta"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-white text-[#050505] font-semibold text-[13px] tracking-[0.02em] hover:bg-white/90 transition-colors shrink-0"
            >
              Book a Free Call
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
