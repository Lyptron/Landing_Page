'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, X, ImageOff } from 'lucide-react'
import { fetchGallery } from '@/lib/db'
import { PageHeader, EmptyState, Loading } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

async function loadGallery(projectId: string) {
  const { data } = await fetchGallery(projectId)
  if (!data?.length) return { data: [] }
  const grouped: Record<string, any> = {}
  data.forEach((img: any) => {
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
  return { data: Object.values(grouped) }
}

export default function ClientGalleryPage() {
  const { resource, loading } = useClientPortalProject(loadGallery)
  const galleryData = resource ?? []
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Project Gallery" description="Visual updates and screenshots from your project, organized by week." />

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
                        <img src={img.image_url || img.url} alt={img.title} className="w-full h-full object-cover" />
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
            className="fixed inset-0 z-[100] flex flex-col"
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
                  <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-contain" />
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
