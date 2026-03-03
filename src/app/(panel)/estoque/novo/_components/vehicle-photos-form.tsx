'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, X, GripVertical } from 'lucide-react'

export function VehiclePhotosForm() {
    const [files, setFiles] = useState<{ id: string; file: File; preview: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files))
        }
    }

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
        if (files.length + validFiles.length > 12) {
            alert('Você só pode enviar no máximo 12 fotos.')
            return
        }

        const mapped = validFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file)
        }))

        setFiles(prev => [...prev, ...mapped])
    }

    const removeFile = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    // HTML5 Drag and Drop for reordering
    const handleDragStart = (index: number) => {
        setDraggedIdx(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIdx === null || draggedIdx === index) return

        const newFiles = [...files]
        const draggedItem = newFiles[draggedIdx]
        newFiles.splice(draggedIdx, 1) // Remove do antigo
        newFiles.splice(index, 0, draggedItem) // Insere no novo

        setDraggedIdx(index)
        setFiles(newFiles)
    }

    const handleDragEnd = () => {
        setDraggedIdx(null)
    }

    // Dropzone for adding new files
    const handleDropzoneDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files))
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Drag Drop Zone Premium UI */}
            <div
                className="relative group w-full h-64 rounded-[2rem] border-2 border-dashed border-white/20 hover:border-[#FF4D00]/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden backdrop-blur-sm"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropzoneDrop}
            >
                <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#FF4D00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF4D00] group-hover:scale-110 group-hover:bg-[#FF4D00]/10 transition-transform">
                        <UploadCloud className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-white font-medium text-lg">Clique ou arraste imagens aqui</p>
                        <p className="text-white/40 text-sm mt-1">Formatos suportados: JPG, PNG, WEBP (Máx. 5MB)</p>
                    </div>
                    <span className="px-4 py-2 mt-2 rounded-xl bg-white/10 text-white/80 text-sm font-semibold group-hover:bg-white/20 transition-colors">
                        Selecionar do Computador
                    </span>
                </div>
            </div>

            {/* Grid of Uploaded Photos */}
            <div>
                <h4 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Fotos Anexadas ({files.length} / 12)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" onDragOver={(e) => e.preventDefault()}>
                    {files.map((fileObj, i) => (
                        <div
                            key={fileObj.id}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDragEnd={handleDragEnd}
                            className={`aspect-square rounded-2xl bg-white/5 border flex flex-col items-center justify-center group relative overflow-hidden cursor-move transition-transform ${draggedIdx === i ? 'opacity-50 scale-95 border-[#FF4D00]/50' : 'border-white/10'}`}
                        >
                            <img src={fileObj.preview} alt="Preview" className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <GripVertical className="text-white w-6 h-6" />
                            </div>

                            {i === 0 && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FF4D00] text-white text-[10px] font-bold z-10">
                                    Capa
                                </div>
                            )}

                            <button
                                onClick={(e) => removeFile(fileObj.id, e)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {files.length < 12 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-[#FF4D00]/50 hover:bg-[#FF4D00]/5 transition-colors"
                        >
                            <span className="text-white/20 text-3xl font-light">+</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
                <button type="button" className="text-white/60 hover:text-white px-6 py-3 font-medium transition-colors">
                    Voltar
                </button>
                <button type="button" className="bg-[#FF4D00] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#FF4D00]/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#FF4D00]/20">
                    Avançar para Extras
                </button>
            </div>
        </div>
    )
}
