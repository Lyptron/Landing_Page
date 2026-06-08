'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { fetchGallery, fetchProjectByAccessCode } from '@/lib/db'

export default function ClientGalleryPage() {
  const params = useParams()
  const code = params.code as string
  const [galleryData, setGalleryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchGallery(project.id)
        if (data && data.length > 0) {
          const grouped: Record<string, any> = {}
          data.forEach((img: any) => {
            const key = img.week_label || 'General'
            if (!grouped[key])
              grouped[key] = {
                week: key,
                date: new Date(img.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                images: [],
              }
            grouped[key].images.push(img)
          })
          setGalleryData(Object.values(grouped))
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Gallery</h1>
        <p className="text-white/25 text-[13px]">Visual progress updates and screenshots of your project.</p>
      </div>

      {galleryData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageOff className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No images yet</h3>
          <p className="text-[13px] text-white/15">Screenshots and visual updates will appear here as your project progresses.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {galleryData.map((section, sIdx) => (
            <div key={section.week} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-bold text-white/70">{section.week}</h2>
                <div className="h-px flex-1 bg-white/[0.04]" />
                <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">{section.date}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.04] group-hover:border-white/[0.1] transition-all"
                      style={{ background: 'rgba(0,0,0,0.3)' }}
                    >
                      {(img.image_url || img.url) ? (
                        <img src={img.image_url || img.url} alt={img.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${sIdx % 3 === 0 ? 'from-blue-900/20 to-black' : sIdx % 3 === 1 ? 'from-purple-900/20 to-black' : 'from-neutral-800/30 to-black'}`} />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/60" />
                      </div>
                    </div>
                    <h3 className="text-[11px] font-medium text-white/40 group-hover:text-white/70 transition-colors truncate">{img.title}</h3>
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
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between p-5">
              <h3 className="text-[15px] font-bold text-white/80">{selectedImage.title}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-xl text-white/30 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-4xl aspect-video border border-white/[0.06] rounded-2xl relative overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                {selectedImage.url ? (
                  <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-20 h-20 text-white/[0.05]" />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
