'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Photo {
    id: string
    url: string
    is_cover: boolean
    display_order: number
}

export function VehicleGallery({ photos, brand, model }: { photos: Photo[]; brand: string; model: string }) {
    const sorted = [...photos].sort((a, b) => {
        if (a.is_cover) return -1
        if (b.is_cover) return 1
        return a.display_order - b.display_order
    })

    const [current, setCurrent] = useState(0)
    const [lightbox, setLightbox] = useState(false)

    const hasPhotos = sorted.length > 0
    const currentPhoto = sorted[current]

    const prev = () => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))
    const next = () => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))

    return (
        <>
            {/* Main image */}
            <div className="relative aspect-[16/10] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-bg-tertiary)] group">
                {hasPhotos ? (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentPhoto.id}
                                src={currentPhoto.url}
                                alt={`${brand} ${model} — foto ${current + 1}`}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            />
                        </AnimatePresence>

                        {/* Controls */}
                        {sorted.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                                    aria-label="Foto anterior"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                                    aria-label="Próxima foto"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}

                        {/* Expand */}
                        <button
                            onClick={() => setLightbox(true)}
                            className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                            aria-label="Ampliar"
                        >
                            <Expand size={16} />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                            {current + 1} / {sorted.length}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
                )}
            </div>

            {/* Thumbnails */}
            {sorted.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    {sorted.map((photo, i) => (
                        <button
                            key={photo.id}
                            onClick={() => setCurrent(i)}
                            className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === current
                                    ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img src={photo.url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && hasPhotos && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setLightbox(false)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); prev() }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <img
                            src={currentPhoto.url}
                            alt={`${brand} ${model}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); next() }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                        >
                            <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={() => setLightbox(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer text-xl"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
