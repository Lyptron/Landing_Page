import Link from 'next/link'
import { ArrowUpRight, ArrowRight, ArrowLeft } from 'lucide-react'
import Footer from '../layout/Footer'
import LivePreviewFrame from '../ui/LivePreviewFrame'
import { Project } from '@/types'

interface CaseStudyBodyProps {
  project: Project
  nextProject?: Project
}

// Editorial full-page case-study layout. Deliberately not confined to a
// narrow reading column — the story alternates between wide hero moments
// (live-embed cover, oversized metrics, giant next-case CTA) and a
// tighter two-column reading grid with a sticky left gutter for the
// numbered eyebrow. Server component; LivePreviewFrame below is the only
// client-boundary import.
export default function CaseStudyBody({ project, nextProject }: CaseStudyBodyProps) {
  const cs = project.caseStudy
  if (!cs) return null

  // Consistent horizontal gutters at each breakpoint. Sections that need
  // to breach the gutter (the hero cover, the metrics band, the next-
  // case CTA) use their own full-width wrapper instead.
  const gutter = 'px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-40'

  return (
    <>
      <main className="relative w-full bg-bg text-white pt-28 md:pt-36 pb-20">

        {/* Breadcrumb */}
        <div className={`${gutter} mb-14 md:mb-20`}>
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            All work
          </Link>
        </div>

        {/* Title block — big, editorial, no narrow column */}
        <header className={`${gutter} mb-14 md:mb-20`}>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 mb-8">
            <span>{project.number}</span>
            <span className="text-white/15" aria-hidden="true">—</span>
            <span>{project.type}</span>
            <span className="text-white/15" aria-hidden="true">—</span>
            <span>{project.year}</span>
            <span className="text-white/15" aria-hidden="true">—</span>
            <span className="text-white/25">Concept project</span>
          </div>
          <h1 className="font-display font-bold text-[clamp(44px,9vw,140px)] leading-[0.92] tracking-[-0.045em] text-white/95 mb-8">
            {project.name}
          </h1>
          <p className="font-display font-medium text-[clamp(20px,2.6vw,32px)] text-white/55 leading-[1.35] tracking-[-0.02em] max-w-5xl">
            {cs.tagline}
          </p>
          {/* Disclosure: this is a self-initiated demo build, not a real
              client engagement — stated plainly so it can never be
              mistaken for a claim about a real client relationship. */}
          <p className="font-body text-[12px] text-white/25 leading-[1.6] max-w-2xl mt-6">
            This is a concept project built by Lyptron to demonstrate our process and craft — not a real client engagement. Metrics and quotes are illustrative.
          </p>
        </header>

        {/* Cover — live embed in a browser-chrome frame, same visual
            language as the Work section mockups. Contained within the
            gutter (not full-bleed) and capped at 16:10 so the real site
            renders at its own aspect ratio instead of being cropped into
            a stretched 21:9 banner. */}
        {project.url && (
          <section className={`${gutter} mb-20 md:mb-28`}>
            <div
              className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 60px 120px -30px rgba(0,0,0,0.6)',
              }}
            >
              {/* Browser chrome */}
              <div className="h-10 w-full bg-white/2 border-b border-white/6 flex items-center px-4 select-none shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/12" />
                  <div className="w-2 h-2 rounded-full bg-white/8" />
                  <div className="w-2 h-2 rounded-full bg-white/6" />
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 h-5 flex-1 max-w-70 rounded bg-white/3 flex items-center px-3 hover:bg-white/6 transition-colors"
                >
                  <span className="font-mono text-[10px] text-white/35 truncate">
                    {project.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </a>
              </div>
              <div className="relative w-full aspect-16/10">
                <LivePreviewFrame
                  url={project.url}
                  title={`${project.name} live preview`}
                  baseWidth={1440}
                  baseHeight={900}
                  previewImage={cs.cover}
                />
              </div>
            </div>
          </section>
        )}

        {/* Meta strip — full-width row */}
        <section className={`${gutter} mb-24 md:mb-36`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 border-y border-white/6 py-10 md:py-12">
            <MetaField label="Role"     value={cs.role} />
            <MetaField label="Timeline" value={cs.timeline} />
            <MetaField label="Year"     value={project.year} />
            <MetaField
              label="Live site"
              value={
                project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/85 hover:text-white transition-colors"
                  >
                    Visit
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                ) : '—'
              }
            />
          </div>
        </section>

        {/* Overview — big centered pull-quote feel */}
        <section className={`${gutter} mb-28 md:mb-40`}>
          <div className="max-w-6xl">
            <SectionEyebrow>Overview</SectionEyebrow>
            <p className="font-display font-medium text-[clamp(24px,3vw,42px)] leading-tight tracking-tight text-white/85">
              {cs.overview}
            </p>
          </div>
        </section>

        {/* Challenge */}
        <div className={gutter}>
          <StorySection eyebrow="01" heading={cs.challenge.heading}>
            {cs.challenge.body.map((p, i) => (
              <Paragraph key={i}>{p}</Paragraph>
            ))}
          </StorySection>
        </div>

        {/* Approach */}
        <div className={gutter}>
          <StorySection eyebrow="02" heading={cs.approach.heading}>
            {cs.approach.body.map((p, i) => (
              <Paragraph key={i}>{p}</Paragraph>
            ))}
            {cs.approach.highlights && cs.approach.highlights.length > 0 && (
              <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                {cs.approach.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 font-body text-[15px] md:text-[16px] text-white/60 leading-[1.6]">
                    <span
                      className="mt-2.5 shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: project.accent }}
                      aria-hidden="true"
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </StorySection>
        </div>

        {/* Outcomes — full-width metric band */}
        <section className={`${gutter} mb-24 md:mb-32`}>
          <div className="border-t border-white/6 pt-16 md:pt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 mb-14 md:mb-20">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">03</div>
                <h2 className="font-display font-semibold text-[clamp(28px,4vw,52px)] tracking-[-0.03em] text-white/90 leading-[1.05]">
                  {cs.outcomes.heading}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-14 mb-12">
              {cs.outcomes.metrics.map((m) => (
                <div key={m.label}>
                  <div
                    className="font-display font-bold text-[clamp(36px,5.5vw,72px)] tracking-[-0.03em] leading-[0.95] text-white/90 mb-3"
                    style={{ textWrap: 'balance' }}
                  >
                    {m.value}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            {cs.outcomes.body && cs.outcomes.body.length > 0 && (
              <div className="max-w-4xl mt-4">
                {cs.outcomes.body.map((p, i) => (
                  <Paragraph key={i}>{p}</Paragraph>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tech stack */}
        <section className={`${gutter} mb-24 md:mb-36`}>
          <SectionEyebrow>Tech stack</SectionEyebrow>
          <div className="flex flex-wrap gap-2.5">
            {cs.stack.map((s) => (
              <span
                key={s}
                className="font-mono text-[11px] px-3.5 py-1.5 rounded-full text-white/65 border border-white/10 bg-white/2"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Next case study — giant CTA */}
        {nextProject && (
          <section className={`${gutter} mb-8`}>
            <Link
              href={`/work/${nextProject.id}`}
              className="group block border-t border-white/8 pt-14 md:pt-20"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6">
                Next case study
              </div>
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <h3 className="font-display font-bold text-[clamp(40px,7vw,96px)] leading-[0.95] tracking-[-0.04em] text-white/85 group-hover:text-white transition-colors">
                  {nextProject.name}
                </h3>
                <ArrowRight
                  className="w-10 h-10 md:w-14 md:h-14 text-white/40 group-hover:text-white transition-all group-hover:translate-x-2 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
                {nextProject.type} · {nextProject.year}
              </div>
            </Link>
          </section>
        )}

        {/* Bottom back link */}
        <div className={`${gutter} pt-10`}>
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            Back to all work
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

function MetaField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 mb-2">{label}</div>
      <div className="font-body text-[14px] md:text-[15px] text-white/80 leading-[1.4]">{value}</div>
    </div>
  )
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6">{children}</div>
  )
}

// Two-column reading grid: sticky left gutter with the section number,
// wide right column for the prose. Left gutter collapses on mobile.
function StorySection({ eyebrow, heading, children }: { eyebrow: string; heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-24 md:mb-36 grid md:grid-cols-[120px_1fr] lg:grid-cols-[160px_1fr] gap-6 md:gap-16 lg:gap-24">
      <div>
        <div className="md:sticky md:top-32 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          {eyebrow}
        </div>
      </div>
      <div>
        <h2 className="font-display font-semibold text-[clamp(26px,3.6vw,44px)] tracking-tight text-white/90 mb-8 leading-[1.1] max-w-4xl">
          {heading}
        </h2>
        <div className="flex flex-col gap-6 max-w-3xl">{children}</div>
      </div>
    </section>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[16px] md:text-[17px] text-white/60 leading-[1.7]">
      {children}
    </p>
  )
}
