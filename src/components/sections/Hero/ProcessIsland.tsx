'use client'
import GlassCard from '../../ui/GlassCard'

export default function ProcessIsland() {
  return (
    <GlassCard className="p-4 w-[170px] select-none" strength={11}>
      <span className="font-mono text-[9px] text-[--text-muted] block mb-2.5 uppercase tracking-wider">METHODOLOGY</span>
      <div className="flex gap-2 items-center">
        <div className="font-display font-extrabold text-2xl text-blue">01</div>
        <div>
          <h5 className="font-display font-bold text-xs text-white">Discovery</h5>
          <span className="font-body text-[9px] text-[--text-muted]">Deep-dive scoping</span>
        </div>
      </div>
    </GlassCard>
  )
}
