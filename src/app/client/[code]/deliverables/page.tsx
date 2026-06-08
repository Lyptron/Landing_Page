'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, ExternalLink, FileImage, FileCode2, FileType2, PackageOpen } from 'lucide-react'
import { fetchDocuments, fetchProjectByAccessCode } from '@/lib/db'

const ICON_MAP: Record<string, any> = { design: FileImage, code: FileCode2, document: FileType2 }

export default function DeliverablesPage() {
  const params = useParams()
  const code = params.code as string
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchDocuments(project.id)
        if (data && data.length > 0) {
          const filtered = data.filter((d: any) => d.category === 'deliverable' || d.is_deliverable)
          setDeliverables(filtered.length > 0 ? filtered : data)
        }
      }
      setLoading(false)
    }
    load()
  }, [code])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Deliverables</h1>
        <p className="text-white/25 text-[13px]">Download finalized project assets and files.</p>
      </div>

      {deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No deliverables yet</h3>
          <p className="text-[13px] text-white/15">Finalized files and assets will appear here when ready for download.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deliverables.map((item, idx) => {
            const IconComp = ICON_MAP[item.type] || FileType2
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                key={item.id}
                className="p-5 rounded-2xl flex flex-col justify-between group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <IconComp className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                  <h3 className="font-bold text-white/80 text-[15px] mb-1">{item.title || item.name}</h3>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-white/15 uppercase tracking-[0.15em] mb-5">
                    <span>v{item.version || '1.0'}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>{item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
                  <a
                    href={item.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-[#050505] bg-white transition-colors flex items-center justify-center gap-1.5 hover:bg-white/90"
                    style={{ boxShadow: '0 0 12px rgba(255,255,255,0.05)' }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button className="p-2 rounded-lg text-white/20 hover:text-white/50 transition-colors" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
