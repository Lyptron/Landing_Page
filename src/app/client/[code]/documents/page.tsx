'use client'
import { useState } from 'react'
import { FileText, Search, Download, FileSignature, Receipt, FolderOpen } from 'lucide-react'
import { PageHeader, EmptyState, Loading } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'
import { safeHttpUrl } from '@/lib/safeUrl'

const ICON_MAP: Record<string, any> = {
  Contract: FileSignature,
  Proposal: FileText,
  Invoice: Receipt,
  Requirements: FileText,
  MSA: FileSignature,
  NDA: FileSignature,
  SOW: FileSignature,
}

function DocumentRow({ doc, signing = false }: { doc: any; signing?: boolean }) {
  const DocIcon = ICON_MAP[doc.type] || (signing ? FileSignature : FileText)
  const date = doc.uploaded_at ? new Date(doc.uploaded_at) : null
  const fileUrl = safeHttpUrl(doc.file_url)
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="shrink-0">
          <DocIcon className="w-4.25 h-4.25" style={{ color: 'var(--cp-cyan)' }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
            {doc.title}
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>
            {doc.type || (signing ? 'Contract' : 'Document')}
            {date && ` · Uploaded ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
      </div>
      <Download className={`w-4 h-4 shrink-0 transition-colors mr-1 ${fileUrl ? 'text-(--cp-text-faint) group-hover:text-(--cp-text-muted)' : 'text-(--cp-text-faint) opacity-35'}`} />
    </>
  )

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-between p-4 opacity-80">
        {content}
      </div>
    )
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-4 transition-colors hover:bg-(--cp-bg-soft)"
    >
      {content}
    </a>
  )
}

export default function DocumentsPage() {
  const { project, loading } = useClientPortalProject()
  const documents = project?.documents ?? []
  const [search, setSearch] = useState('')

  const onboardingDocs = documents.filter((d: any) => d.category === 'onboarding')
  const otherDocs = documents.filter((d: any) => d.category !== 'onboarding')

  const filteredOther = search
    ? otherDocs.filter((d) => d.title?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase()))
    : otherDocs

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 w-full">
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

      {onboardingDocs.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
            Signing Agreements
          </h2>
          <div className="cp-card cp-list overflow-hidden">
            {onboardingDocs.map((doc: any) => <DocumentRow key={doc.id} doc={doc} signing />)}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
          Project Files & Assets
        </h2>

        {otherDocs.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No project files uploaded yet"
            description="Proposals, technical briefs, and assets will appear here as your project progresses."
          />
        ) : (
          <div className="cp-card cp-list overflow-hidden">
            {filteredOther.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>
    </div>
  )
}
