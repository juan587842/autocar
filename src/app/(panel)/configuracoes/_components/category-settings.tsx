'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, GripVertical, Save, X, ImageIcon, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Category = {
    id: string
    name: string
    slug: string
    is_active: boolean
    display_order: number
    image_url: string
}

export function CategorySettings() {
    const supabase = createClient()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [uploadingId, setUploadingId] = useState<string | null>(null)
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('vehicle_categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (data) setCategories(data)
        setLoading(false)
    }

    const handleAddCategory = () => {
        const newCat: Category = {
            id: 'new_' + Date.now(),
            name: '',
            slug: '',
            is_active: true,
            display_order: categories.length,
            image_url: ''
        }
        setCategories([...categories, newCat])
        setIsEditing(newCat.id)
        setEditName('')
    }

    const saveCategory = async (id: string) => {
        const catName = editName.trim()
        if (!catName) {
            handleCancel(id)
            return
        }

        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        if (id.startsWith('new_')) {
            const { error } = await supabase.from('vehicle_categories').insert([
                { name: catName, slug, is_active: true, display_order: categories.length }
            ])
            if (!error) loadCategories()
        } else {
            const { error } = await supabase.from('vehicle_categories').update({ name: catName, slug }).eq('id', id)
            if (!error) loadCategories()
        }
        setIsEditing(null)
    }

    const handleCancel = (id: string) => {
        if (id.startsWith('new_')) {
            setCategories(categories.filter(c => c.id !== id))
        }
        setIsEditing(null)
    }

    const toggleActive = async (id: string, current: boolean) => {
        if (id.startsWith('new_')) return
        const { error } = await supabase.from('vehicle_categories').update({ is_active: !current }).eq('id', id)
        if (!error) loadCategories()
    }

    const deleteCategory = async (id: string) => {
        if (id.startsWith('new_')) {
            handleCancel(id)
            return
        }
        if (window.confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar veículos associados.')) {
            const { error } = await supabase.from('vehicle_categories').delete().eq('id', id)
            if (!error) loadCategories()
        }
    }

    const moveUp = async (index: number) => {
        if (index === 0) return
        const newCats = [...categories]
        const temp = newCats[index].display_order
        newCats[index].display_order = newCats[index - 1].display_order
        newCats[index - 1].display_order = temp

        await supabase.from('vehicle_categories').upsert([
            { id: newCats[index].id, display_order: newCats[index].display_order },
            { id: newCats[index - 1].id, display_order: newCats[index - 1].display_order },
        ])
        loadCategories()
    }

    const handleImageUpload = async (catId: string, file: File) => {
        if (catId.startsWith('new_')) return

        setUploadingId(catId)
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `categories/${catId}_${Date.now()}.${ext}`

            // Upload to storage bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vehicle-photos')
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true
                })

            if (uploadError) {
                console.error('Erro no upload:', uploadError)
                alert('Erro ao enviar imagem. Verifique se o bucket "vehicle-photos" existe.')
                return
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('vehicle-photos')
                .getPublicUrl(fileName)

            const imageUrl = publicUrlData.publicUrl

            // Update category
            const { error: updateError } = await supabase
                .from('vehicle_categories')
                .update({ image_url: imageUrl })
                .eq('id', catId)

            if (updateError) {
                console.error('Erro ao atualizar:', updateError)
                alert('Erro ao salvar a URL da imagem.')
                return
            }

            loadCategories()
        } catch (err) {
            console.error('Erro no upload de imagem:', err)
            alert('Erro inesperado ao enviar a imagem.')
        } finally {
            setUploadingId(null)
        }
    }

    const handleRemoveImage = async (catId: string) => {
        if (catId.startsWith('new_')) return
        await supabase.from('vehicle_categories').update({ image_url: '' }).eq('id', catId)
        loadCategories()
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Categorias de Veículos</h2>
                    <p className="text-white/60 text-sm">Organize o agrupamento do estoque na sua loja pública. Adicione imagens para cada categoria.</p>
                </div>
                <button
                    onClick={handleAddCategory}
                    disabled={isEditing !== null}
                    className="flex items-center gap-2 bg-[#FF4D00] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#FF4D00]/90 transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Nova Categoria
                </button>
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center text-white/40">Carregando categorias...</div>
            ) : (
                <div className="space-y-3">
                    {categories.map((cat, index) => (
                        <div key={cat.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10">

                            {/* Ordem UI Simples */}
                            <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0 || isEditing !== null}
                                className="p-2 text-white/30 hover:text-white disabled:opacity-30 disabled:hover:text-white/30 cursor-pointer"
                                title="Mover para cima"
                            >
                                <GripVertical className="w-4 h-4" />
                            </button>

                            {/* Imagem thumbnail + upload */}
                            <div className="relative shrink-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={(el) => { fileInputRefs.current[cat.id] = el }}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleImageUpload(cat.id, file)
                                        e.target.value = '' // reset para permitir re-upload
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                                    disabled={cat.id.startsWith('new_') || uploadingId === cat.id}
                                    className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-[#FF4D00]/50 transition-colors bg-black/30 flex items-center justify-center group disabled:opacity-50"
                                    title="Trocar imagem"
                                >
                                    {uploadingId === cat.id ? (
                                        <Loader2 className="w-5 h-5 text-[#FF4D00] animate-spin" />
                                    ) : cat.image_url ? (
                                        <>
                                            <Image
                                                src={cat.image_url}
                                                alt={cat.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-4 h-4 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-white/30 group-hover:text-[#FF4D00] transition-colors">
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-[8px] font-medium uppercase">Imagem</span>
                                        </div>
                                    )}
                                </button>

                                {/* Botão remover imagem */}
                                {cat.image_url && !uploadingId && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(cat.id) }}
                                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg z-10"
                                        title="Remover imagem"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1">
                                {isEditing === cat.id ? (
                                    <input
                                        type="text"
                                        autoFocus
                                        value={editName || (cat.name === '' ? '' : cat.name)}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveCategory(cat.id)}
                                        placeholder="Nome da categoria..."
                                        className="w-full bg-black/30 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF4D00]/50"
                                    />
                                ) : (
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${cat.is_active ? 'text-white' : 'text-white/40 line-through'}`}>{cat.name}</span>
                                        <span className="text-xs text-white/30">/{cat.slug}</span>
                                    </div>
                                )}
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                                {isEditing === cat.id ? (
                                    <>
                                        <button onClick={() => saveCategory(cat.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleCancel(cat.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Toggle status */}
                                        <button
                                            onClick={() => toggleActive(cat.id, cat.is_active)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${cat.is_active ? 'bg-[#FF4D00]' : 'bg-white/10'}`}
                                        >
                                            <span className={`${cat.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </button>

                                        <div className="w-px h-6 bg-white/10 mx-2" />

                                        <button
                                            onClick={() => {
                                                setIsEditing(cat.id)
                                                setEditName(cat.name)
                                            }}
                                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && !isEditing && (
                        <p className="text-center text-white/40 py-8">Nenhuma categoria cadastrada.</p>
                    )}
                </div>
            )}
        </div>
    )
}
