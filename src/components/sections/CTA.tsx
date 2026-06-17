'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import MagneticButton from '../ui/MagneticButton'
import { useCursor } from '../providers/CursorProvider'
import { supabase } from '@/lib/supabase'
import { Clock, MessageCircle, Shield } from 'lucide-react'

const BOOKING_EMAIL = 'hello@lyptron.com'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const EASE = [0.22, 1, 0.36, 1] as const
const SPRING = [0.34, 1.56, 0.64, 1] as const

const TRUST_POINTS = [
  { icon: <Clock className="w-4 h-4" />, text: '30-min free call' },
  { icon: <MessageCircle className="w-4 h-4" />, text: 'No pressure, just answers' },
  { icon: <Shield className="w-4 h-4" />, text: 'NDA on request' },
]

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    type: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { setCursorState } = useCursor()

  const headlineRef = useRef<HTMLDivElement>(null)
  const headlineInView = useInView(headlineRef, { once: true, margin: '-80px' })
  const formContainerRef = useRef<HTMLDivElement>(null)
  const formInView = useInView(formContainerRef, { once: true, margin: '-60px' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setSubmitError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.from('inquiries').insert([{
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim(),
      project_type: formData.type,
      description: formData.description.trim() || null,
    }])

    if (error) {
      setIsSubmitting(false)
      setSubmitError("We couldn't save your inquiry. Email hello@lyptron.com or try again.")
      if (process.env.NODE_ENV !== 'production') {
        console.error('Inquiry insert failed:', error.message)
      }
      return
    }

    const subject = `Book a free call — ${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
    const bodyLines = [
      `Name: ${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      `Email: ${formData.email.trim()}`,
      `Project type: ${formData.type}`,
      '',
      formData.description.trim() || '(No additional details provided.)',
    ]
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`
  }

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-28 z-10"
      style={{ background: '#050505' }}
    >
      {/* Warm spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[15%]"
          style={{
            width: '80%',
            maxWidth: '1000px',
            height: '600px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 20%, rgba(192,160,96,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-[120px] grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

        {/* Left: Messaging — word-by-word build */}
        <div ref={headlineRef} className="flex flex-col gap-6">
          <motion.span
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50"
            initial={{ opacity: 0, y: 12 }}
            animate={headlineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            Let&apos;s Build Together
          </motion.span>

          <h2 className="font-display font-bold text-[clamp(28px,5.5vw,72px)] leading-[0.95] tracking-[-0.04em]">
            <motion.span
              className="text-white/90 inline-block"
              initial={{ opacity: 0, filter: 'blur(16px)', y: 20 }}
              animate={headlineInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            >
              Have an idea?{' '}
            </motion.span>
            <motion.span
              className="text-white/45 inline-block"
              initial={{ opacity: 0, filter: 'blur(16px)', y: 20 }}
              animate={headlineInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
            >
              Let&apos;s talk about{' '}
            </motion.span>
            <motion.span
              className="text-white/90 inline-block"
              initial={{ opacity: 0, filter: 'blur(16px)', y: 20 }}
              animate={headlineInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
            >
              making it real.
            </motion.span>
          </h2>

          <motion.p
            className="font-body text-[15px] md:text-[17px] text-white/35 leading-[1.7] max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={headlineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            Whether you have a detailed spec or just a napkin sketch — we&apos;ll help you figure out the right approach, timeline, and investment. Zero obligation.
          </motion.p>

          {/* Trust points — spring pop in */}
          <div className="flex flex-wrap gap-5 mt-2">
            {TRUST_POINTS.map((point, i) => (
              <motion.div
                key={point.text}
                className="flex items-center gap-2 text-white/25"
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={headlineInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.12, ease: SPRING }}
              >
                {point.icon}
                <span className="font-mono text-[11px] tracking-wide">{point.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            className="mt-4 pt-6 border-t border-white/[0.04]"
            initial={{ opacity: 0, y: 12 }}
            animate={headlineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
          >
            <p className="font-body text-[14px] text-white/25 leading-relaxed">
              Trusted by <span className="text-white/50">50+ founders &amp; teams</span> across SaaS, mobile, AI, and e-commerce. We respond within 24 hours.
            </p>
          </motion.div>
        </div>

        {/* Right: Form — tilts in from below */}
        <motion.div
          ref={formContainerRef}
          className="rounded-2xl p-7 md:p-9 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(160deg, rgba(192,160,96,0.03) 0%, rgba(255,255,255,0.01) 50%, rgba(139,164,192,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            perspective: '1000px',
          }}
          initial={{ opacity: 0, y: 60, rotateX: 4 }}
          animate={formInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
        >
          {/* Top sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.012] to-transparent pointer-events-none rounded-[inherit]" />

          <div className="relative z-10 mb-6">
            <motion.h3
              className="font-display font-semibold text-[20px] text-white/80 mb-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            >
              Book your free call
            </motion.h3>
            <motion.p
              className="font-body text-[13px] text-white/25"
              initial={{ opacity: 0 }}
              animate={formInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
            >
              Takes 2 minutes. We&apos;ll get back to you within 24h.
            </motion.p>
          </div>

          <form
            ref={formRef}
            className="relative z-10 flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, y: 12 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
              >
                <label htmlFor="cta-first-name" className="font-mono text-[10px] text-white/25 tracking-[0.1em] uppercase">First Name</label>
                <input
                  id="cta-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  placeholder="Alex"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors"
                />
              </motion.div>
              <motion.div
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, y: 12 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
              >
                <label htmlFor="cta-last-name" className="font-mono text-[10px] text-white/25 tracking-[0.1em] uppercase">Last Name</label>
                <input
                  id="cta-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  placeholder="Johnson"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors"
                />
              </motion.div>
            </div>

            <motion.div
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
            >
              <label htmlFor="cta-email" className="font-mono text-[10px] text-white/25 tracking-[0.1em] uppercase">Email</label>
              <input
                id="cta-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="alex@company.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors"
                suppressHydrationWarning
              />
            </motion.div>

            <motion.div
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
            >
              <label htmlFor="cta-project-type" className="font-mono text-[10px] text-white/25 tracking-[0.1em] uppercase">What are you building?</label>
              <div className="relative">
                <select
                  id="cta-project-type"
                  name="projectType"
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/15 transition-colors appearance-none cursor-pointer"
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  <option value="" disabled className="bg-surface text-white/20">Select a project type</option>
                  <option value="web" className="bg-surface text-white/80">Website or Web App</option>
                  <option value="saas" className="bg-surface text-white/80">SaaS Platform</option>
                  <option value="mobile" className="bg-surface text-white/80">Mobile App</option>
                  <option value="ai" className="bg-surface text-white/80">AI / Automation</option>
                  <option value="design" className="bg-surface text-white/80">Design &amp; Branding</option>
                  <option value="other" className="bg-surface text-white/80">Something else</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
            >
              <label htmlFor="cta-description" className="font-mono text-[10px] text-white/25 tracking-[0.1em] uppercase">Tell us more <span className="text-white/12">(optional)</span></label>
              <textarea
                id="cta-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="A quick summary of your idea, timeline, or budget range..."
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors resize-none"
              />
            </motion.div>

            <motion.div
              className="pt-1"
              initial={{ opacity: 0, y: 12 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
            >
              <MagneticButton type="submit" disabled={isSubmitting} className="w-full group">
                {isSubmitting ? 'OPENING YOUR EMAIL...' : 'BOOK MY FREE CALL'}
              </MagneticButton>
              {submitError && (
                <p role="alert" className="mt-3 text-[12px] text-center text-red-400/80">
                  {submitError}
                </p>
              )}
            </motion.div>

            <motion.p
              className="font-body text-[11px] text-white/15 text-center mt-1"
              initial={{ opacity: 0 }}
              animate={formInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
            >
              No spam, no sales pitch. Just a conversation about your project.
            </motion.p>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
