'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Search, Download, FileSignature, Receipt, FolderOpen } from 'lucide-react'
import { fetchDocuments, fetchProjectByAccessCode } from '@/lib/db'

const ICON_MAP: Record<string, any> = { Contract: FileSignature, Proposal: FileText, Invoice: Receipt, Requirements: FileText }

export default function DocumentsPage() {
  const params = useParams()
  const code = params.code as string
  const [documents, setDocuments] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchDocuments(project.id)
        if (data && data.length > 0) setDocuments(data)
      }
      setLoading(false)
    }
    load()
  }, [code])

  const filtered = search
    ? documents.filter((d) => d.title?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase()))
    : documents

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Documents</h1>
          <p className="text-white/25 text-[13px]">Contracts, invoices, and project files.</p>
        </div>
        {documents.length > 0 && (
          <div className="relative group w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-white/15 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white/40 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-[12px] text-white/70 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
            />
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No documents yet</h3>
          <p className="text-[13px] text-white/15">Contracts, proposals, and other files will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((doc, idx) => {
            const DocIcon = ICON_MAP[doc.type] || FileText
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={doc.id}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/[0.015] transition-colors group cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <DocIcon className="w-4 h-4 text-blue-400/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">{doc.title}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">
                    <span>{doc.type || 'Document'}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <button className="p-2 text-white/15 hover:text-white/50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
