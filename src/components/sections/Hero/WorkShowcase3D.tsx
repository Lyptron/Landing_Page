'use client'
import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

function BrowserMockup({ title, tag, result, children, delay }: {
  title: string; tag: string; result: string; children: React.ReactNode; delay: number
}) {
  return (
    <motion.div
      className="flex-1 min-w-0 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(22,22,22,0.98) 0%, rgba(13,13,13,0.99) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 h-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="w-[7px] h-[7px] rounded-full bg-white/15" />
        <div className="w-[7px] h-[7px] rounded-full bg-white/10" />
        <div className="w-[7px] h-[7px] rounded-full bg-white/8" />
        <div className="ml-3 h-4 flex-1 max-w-[140px] rounded-md bg-white/[0.04] flex items-center px-2">
          <span className="font-mono text-[7px] text-white/15 truncate">{title.toLowerCase().replace(/\s/g, '')}.io</span>
        </div>
      </div>

      {/* Content area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {children}
      </div>

      {/* Info bar */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h4 className="font-display font-semibold text-[13px] text-white/80 tracking-tight leading-tight">{title}</h4>
          <span className="font-mono text-[9px] text-white/25">{tag}</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400/70 bg-emerald-400/8 px-2 py-0.5 rounded-full border border-emerald-400/12">{result}</span>
      </div>
    </motion.div>
  )
}

function DashboardUI() {
  const bars = [40, 55, 48, 72, 62, 85, 78, 95]
  return (
    <div className="absolute inset-0 p-3 flex flex-col gap-2" style={{ background: 'linear-gradient(135deg, #131313 0%, #0c0c0c 100%)' }}>
      <div className="flex gap-2">
        {['Revenue', 'Users', 'Conversion'].map((label, i) => (
          <div key={i} className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="font-mono text-[6px] text-white/20 uppercase tracking-wider block mb-1">{label}</span>
            <span className="font-display font-bold text-[14px] text-white/75 tracking-tight leading-none block">
              {['$284k', '12.4k', '8.2%'][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-end gap-[4px] h-full">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-[2px]"
                 style={{ height: `${h}%`, background: i >= 6 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function EcommerceUI() {
  return (
    <div className="absolute inset-0 flex" style={{ background: '#111' }}>
      <div className="w-[40%] border-r border-white/5 p-3 flex flex-col gap-2">
        <div className="h-2 w-16 rounded bg-white/8" />
        <div className="h-2 w-12 rounded bg-white/5" />
        <div className="mt-1 flex flex-col gap-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
              <div className="w-5 h-5 rounded bg-white/5" />
              <div className="flex-1">
                <div className="h-1.5 w-full rounded bg-white/6 mb-1" />
                <div className="h-1 w-2/3 rounded bg-white/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col">
        <div className="flex-1 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2">
          <div className="w-12 h-14 rounded border border-white/10 bg-white/[0.03]" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-7 rounded-md bg-white/8" />
          <div className="w-7 h-7 rounded-md bg-white/4 border border-white/6" />
        </div>
      </div>
    </div>
  )
}

function AIUI() {
  return (
    <div className="absolute inset-0 p-3 flex flex-col gap-2" style={{ background: 'linear-gradient(135deg, #101014 0%, #0b0b0e 100%)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-full bg-white/6 border border-white/8" />
        <div className="h-2 w-20 rounded bg-white/8" />
      </div>
      {[
        { align: 'items-end', w: 'w-[70%]', bg: 'rgba(255,255,255,0.04)' },
        { align: 'items-start', w: 'w-[60%]', bg: 'rgba(255,255,255,0.025)' },
        { align: 'items-end', w: 'w-[55%]', bg: 'rgba(255,255,255,0.04)' },
      ].map((msg, i) => (
        <div key={i} className={`flex ${msg.align}`}>
          <div className={`${msg.w} rounded-xl p-2.5`} style={{ background: msg.bg, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="h-1.5 w-full rounded bg-white/8 mb-1.5" />
            <div className="h-1.5 w-3/4 rounded bg-white/5" />
          </div>
        </div>
      ))}
      <div className="mt-auto flex gap-2">
        <div className="flex-1 h-8 rounded-lg bg-white/[0.03] border border-white/5" />
        <div className="w-8 h-8 rounded-lg bg-white/6" />
      </div>
    </div>
  )
}

export default function WorkShowcase3D() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-5">
      <BrowserMockup title="Nexus Analytics" tag="SaaS Dashboard" result="+62% MRR" delay={0.55}>
        <DashboardUI />
      </BrowserMockup>
      <BrowserMockup title="Stratum Store" tag="E-Commerce" result="#1 in 3mo" delay={0.7}>
        <EcommerceUI />
      </BrowserMockup>
      <BrowserMockup title="Helios AI" tag="AI Platform" result="4x Conv." delay={0.85}>
        <AIUI />
      </BrowserMockup>
    </div>
  )
}
