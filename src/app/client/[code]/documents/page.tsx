'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Search, Download, FileSignature, Receipt, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import { fetchDocuments, fetchProjectByAccessCode } from '@/lib/db'
import { PageHeader, EmptyState, Loading, Badge } from '@/components/portal/PortalUI'

const ICON_MAP: Record<string, any> = { Contract: FileSignature, Proposal: FileText, Invoice: Receipt, Requirements: FileText }

const ONBOARDING_DOCS = [
  {
    id: 'msa',
    title: 'Master Services Agreement (MSA)',
    description: 'Governing legal agreement defining general business terms, IP ownership, and payment frameworks.',
    status: 'signed',
    date: 'Signed on 12 May 2026',
    type: 'Contract',
  },
  {
    id: 'sow',
    title: 'Statement of Work (SOW) — Phase 1',
    description: 'Scope of deliverables, milestones, phase-1 timeline, budget allocation, and support parameters.',
    status: 'pending',
    date: 'Updated today',
    type: 'Contract',
  },
  {
    id: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    description: 'Confidentiality agreement protecting proprietary technical assets, source code, and design files.',
    status: 'signed',
    date: 'Signed on 10 May 2026',
    type: 'Contract',
  },
]

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

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Header */}
      <PageHeader
        title="Contracts & Assets"
        description="Access contracts, onboarding files, proposals, and project assets."
        action={
          documents.length > 0 ? (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cp-text-faint)' }} />
              <input
                type="text"
                placeholder="Search project files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[12.5px] rounded-xl outline-none transition-colors"
                style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
              />
            </div>
          ) : undefined
        }
      />

      {/* Section 1: Necessary Client Signing & Onboarding Documents */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
          Required Signing Agreements
        </h2>
        <div className="cp-card cp-list overflow-hidden">
          {ONBOARDING_DOCS.map((doc) => {
            const isSigned = doc.status === 'signed'
            return (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-colors hover:bg-[var(--cp-bg-soft)]"
              >
                {/* Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    {isSigned ? (
                      <CheckCircle2 className="w-4.5 h-4.5" style={{ color: 'var(--cp-emerald)' }} />
                    ) : (
                      <AlertCircle className="w-4.5 h-4.5" style={{ color: 'var(--cp-cyan)' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-semibold" style={{ color: 'var(--cp-text)' }}>
                      {doc.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed mt-0.5 max-w-2xl" style={{ color: 'var(--cp-text-muted)' }}>
                      {doc.description}
                    </p>
                    <span className="text-[10.5px] mt-1 block" style={{ color: 'var(--cp-text-faint)' }}>
                      {doc.date}
                    </span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 mt-1 sm:mt-0">
                  <Badge tone={isSigned ? 'emerald' : 'cyan'}>
                    {isSigned ? 'Signed' : 'Needs Signature'}
                  </Badge>
                  {!isSigned && (
                    <button className="cp-btn-primary px-3 py-1.5 text-[11px]">
                      Review & Sign
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2: Uploaded Project Files */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
          Project Files & Assets
        </h2>

        {documents.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No project files uploaded yet"
            description="Proposals, technical briefs, and assets will appear here as your project progresses."
          />
        ) : (
          <div className="cp-card cp-list overflow-hidden">
            {filtered.map((doc) => {
              const DocIcon = ICON_MAP[doc.type] || FileText
              const date = doc.uploaded_at ? new Date(doc.uploaded_at) : null
              return (
                <a
                  href={doc.file_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  key={doc.id}
                  className="group flex items-center justify-between p-4 transition-colors hover:bg-[var(--cp-bg-soft)]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0">
                      <DocIcon className="w-[17px] h-[17px]" style={{ color: 'var(--cp-cyan)' }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
                        {doc.title}
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>
                        {doc.type || 'Document'} {date && ` · Uploaded ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 shrink-0 transition-colors mr-1 text-[var(--cp-text-faint)] group-hover:text-[var(--cp-text-muted)]" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
