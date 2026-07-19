'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, X, ImageOff, Upload } from 'lucide-react'
import Image from 'next/image'
import { submitClientGalleryItem, uploadGalleryImage } from '@/lib/db'
import { PageHeader, EmptyState, Loading } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

function groupByWeek(images: any[]) {
  const grouped: Record<string, any> = {}
  images.forEach((img: any) => {
    const key = img.week_label || 'General'
    if (!grouped[key]) {
      grouped[key] = {
        week: key,
        date: new Date(img.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        images: [],
      }
    }
    grouped[key].images.push(img)
  })
  return Object.values(grouped)
}

export default function ClientGalleryPage() {
  const { project, loading, code } = useClientPortalProject()
  const resource = project?.gallery
  const projectId = project?.id ?? null
  const [images, setImages] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Hydrate local image list once the hook returns the fetched data, so a
  // client upload can prepend to it without re-fetching the whole gallery.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resource) setImages(resource)
  }, [resource])

  async function handleUpload(file: File | null) {
    if (!file || !projectId) return
    setUploading(true)
    setUploadError(null)
    const { data: imageUrl, error: uploadErr } = await uploadGalleryImage(file, projectId)
    if (uploadErr || !imageUrl) {
      setUploadError(uploadErr?.message || 'Upload failed. Please try again.')
      setUploading(false)
      return
    }
    // DB insert routes through the code-authenticated RPC — project_id
    // is resolved server-side, callers can't spoof it. See
    // submit_client_gallery_item in supabase-schema.sql.
    const { data, error: writeErr } = await submitClientGalleryItem({
      code,
      title: file.name.replace(/\.[^.]+$/, ''),
      image_url: imageUrl,
    })
    if (writeErr) {
      setUploadError('Uploaded, but the gallery entry failed to save. Please try again.')
      setUploading(false)
      return
    }
    if (data) setImages((prev) => [data, ...prev])
    setUploading(false)
  }

  const galleryData = groupByWeek(images)

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader title="Project Gallery" description="Visual updates and screenshots from your project, organized by week." />
        <label
          className="shrink-0 cp-btn-secondary px-4 py-2.5 text-[12.5px] flex items-center gap-1.5 cursor-pointer relative"
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload Image'}
        </label>
      </div>
      {uploadError && <p className="text-[12px]" style={{ color: 'var(--cp-red)' }} role="alert">{uploadError}</p>}

      {galleryData.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="No images yet"
          description="Screenshots and visual updates will appear here as your project progresses."
        />
      ) : (
        <div className="flex flex-col gap-12">
          {galleryData.map((section, sIdx) => (
            <div key={section.week} className="flex flex-col gap-5">
              <div className="flex items-end gap-4 pb-3 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
                <h2 className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>{section.week}</h2>
                <span className="text-[12px] font-medium ml-auto" style={{ color: 'var(--cp-text-muted)' }}>{section.date}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.images.map((img: any, iIdx: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.05 + iIdx * 0.04 }}
                    key={img.id}
                    className="group cursor-pointer flex flex-col gap-2"
                    onClick={() => setSelectedImage({ url: img.image_url || img.url, title: img.title })}
                  >
                    <div
                      className="relative aspect-video overflow-hidden transition-colors"
                      style={{ background: 'var(--cp-surface)' }}
                    >
                      {(img.image_url || img.url) ? (
                        <Image
                          src={img.image_url || img.url}
                          alt={img.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" style={{ color: 'var(--cp-text-faint)' }} />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{ background: 'rgba(8,14,24,0.55)' }}
                      >
                        <ImageIcon className="w-5 h-5" style={{ color: 'var(--cp-text)' }} />
                      </div>
                    </div>
                    <h3 className="text-[12px] font-medium truncate transition-colors" style={{ color: 'var(--cp-text-muted)' }}>{img.title}</h3>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex flex-col"
            style={{ background: 'rgba(5,9,16,0.92)', backdropFilter: 'blur(6px)' }}
          >
            <div className="flex items-center justify-between p-5">
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--cp-text)' }}>{selectedImage.title}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="cp-btn-secondary p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-4xl aspect-video relative overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--cp-surface)' }}
              >
                {selectedImage.url ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1024px"
                    className="object-contain"
                    priority
                  />
                ) : (
                  <ImageIcon className="w-20 h-20" style={{ color: 'var(--cp-text-faint)' }} />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
