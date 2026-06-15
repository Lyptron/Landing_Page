'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, ExternalLink, FileImage, FileCode2, FileType2, PackageOpen } from 'lucide-react'
import { fetchDocuments, fetchProjectByAccessCode } from '@/lib/db'
import { PageHeader, EmptyState, Loading } from '@/components/portal/PortalUI'

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

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Deliverables" description="Download the finished files and assets from your project." />

      {deliverables.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No deliverables yet"
          description="Finished files and assets will appear here as soon as your team has them ready for you."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px" style={{ background: 'var(--cp-border-soft)' }}>
          {deliverables.map((item, idx) => {
            const IconComp = ICON_MAP[item.type] || FileType2
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                key={item.id}
                className="flex flex-col justify-between h-full p-6"
                style={{ background: 'var(--cp-bg)' }}
              >
                <div className="flex flex-col gap-3 mb-6">
                  <IconComp className="w-5 h-5" style={{ color: 'var(--cp-cyan)' }} />
                  <h3 className="font-bold text-[16px] leading-snug" style={{ color: 'var(--cp-text)' }}>{item.title || item.name}</h3>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--cp-text-muted)' }}>
                    <span>Version {item.version || '1.0'}</span>
                    <span className="w-1 h-1 rounded-full" style={{ background: 'var(--cp-border-strong)' }} />
                    <span>{item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  <a
                    href={item.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="cp-btn-primary flex-1 py-2.5 text-[12.5px] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <a
                    href={item.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="cp-btn-secondary p-2.5 flex items-center justify-center"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
