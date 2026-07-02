import Link from 'next/link'
import Footer from '../layout/Footer'

interface LegalSection {
  heading: string
  paragraphs: string[]
}

interface LegalPageBodyProps {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

export default function LegalPageBody({ title, lastUpdated, intro, sections }: LegalPageBodyProps) {
  return (
    <>
      <main className="relative w-full bg-bg text-white pt-32 md:pt-44 pb-24">
        <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-[11px] text-white/30 uppercase tracking-wider">
              <li><Link href="/" className="hover:text-white/60 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/50">{title}</li>
            </ol>
          </nav>

          <header className="mb-12">
            <h1 className="font-display font-bold text-[clamp(28px,4.5vw,48px)] leading-[1.05] tracking-[-0.03em] text-white/90 mb-3">
              {title}
            </h1>
            <p className="font-mono text-[11px] text-white/30 uppercase tracking-wider mb-6">Last updated: {lastUpdated}</p>
            <p className="font-body text-[15px] text-white/40 leading-relaxed">{intro}</p>
          </header>

          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display font-semibold text-[20px] text-white/80 mb-4 border-b border-white/6 pb-3">
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-3">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="font-body text-[14px] text-white/40 leading-relaxed">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
