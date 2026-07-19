'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react'
import { insertGalleryImage, uploadGalleryImage } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Modal, { ModalInput } from '@/components/ui/Modal'
import { useProject } from '../layout'

export default function ProjectGalleryPage() {
  const { projectId, gallery, setGallery } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', week_label: '' })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFileSelect(selected: File | null) {
    setFile(selected)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return selected ? URL.createObjectURL(selected) : null
    })
  }

  function closeModal() {
    setModalOpen(false)
    setForm({ title: '', week_label: '' })
    handleFileSelect(null)
    setUploadError(null)
  }

  async function handleAdd() {
    if (!form.title || !file) return
    setSaving(true)
    setUploadError(null)
    const { data: imageUrl, error: uploadErr } = await uploadGalleryImage(file, projectId)
    if (uploadErr || !imageUrl) {
      setUploadError(uploadErr?.message || 'Upload failed. Please try again.')
      setSaving(false)
      return
    }
    const { data } = await insertGalleryImage({
      project_id: projectId,
      title: form.title,
      image_url: imageUrl,
      week_label: form.week_label || '',
    })
    if (data) setGallery(prev => [...prev, data])
    setSaving(false)
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (!error) setGallery(gallery.filter(g => g.id !== id))
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Development Screenshots</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{gallery.length} total</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {gallery.map(g => (
          <div key={g.id} className="rounded-xl overflow-hidden aspect-video relative group border border-(--cp-border-soft)" style={{ background: 'var(--cp-bg-soft)' }}>
            {g.image_url ? (
              <Image src={g.image_url} alt={g.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-(--cp-text-faint)" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => handleDelete(g.id)} className="p-2 bg-(--cp-red-soft) hover:bg-(--cp-red) text-white rounded-lg transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <span className="text-[10px] text-white/90 truncate block">{g.title} {g.week_label && `(${g.week_label})`}</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center w-full">
        <Plus className="w-3.5 h-3.5" /> Add Image
      </button>

      <Modal open={modalOpen} onClose={closeModal} title="Add Gallery Image" subtitle="Client sees this in Gallery.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. Dashboard Screenshot" required />

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-(--cp-text-muted)">
              Image <span className="text-(--cp-red)">*</span>
            </label>
            <label
              className="relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--cp-border) p-5 cursor-pointer hover:bg-(--cp-bg-soft) transition-colors overflow-hidden"
              style={{ minHeight: previewUrl ? '160px' : 'auto' }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-(--cp-text-faint)" />
                  <span className="text-[12px] text-(--cp-text-faint)">Click to choose an image</span>
                </>
              )}
            </label>
            {uploadError && <span className="text-[11px] text-(--cp-red)" role="alert">{uploadError}</span>}
          </div>

          <ModalInput label="Week Label" value={form.week_label} onChange={v => setForm({ ...form, week_label: v })} placeholder="e.g. Week 3" />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={closeModal} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !form.title || !file} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Uploading...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
