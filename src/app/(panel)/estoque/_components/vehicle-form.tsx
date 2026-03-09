'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Car, SlidersHorizontal, ImageIcon, UploadCloud, X, GripVertical, ShieldCheck, Settings2, Zap, Trash2, ArrowLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Tabs } from '@/components/ui/tabs'
import toast from 'react-hot-toast'

export function VehicleForm({ initialData, submitAction, uploadAction, deleteAction }: { initialData?: any, submitAction: any, uploadAction: any, deleteAction?: any }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // === BASIC DATA STATE ===
    const [formData, setFormData] = useState({
        brand: initialData?.brand || '',
        model: initialData?.model || '',
        year_fab: initialData?.year_fab || '',
        year_model: initialData?.year_model || '',
        price: initialData?.price || '',
        mileage: initialData?.mileage || '',
        transmission: initialData?.transmission || 'automatic',
        fuel: initialData?.fuel || 'flex',
        color: initialData?.color || '',
        engine: initialData?.engine || '',
        doors: initialData?.doors || '',
        description: initialData?.description || '', // <-- NEW DETALHES FIELD
        plate_end: initialData?.plate_end || '',
        status: initialData?.status || 'available',
    })

    const handleBasicChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // === EXTRAS STATE ===
    const [features, setFeatures] = useState<string[]>(initialData?.features || [])
    const [customFields, setCustomFields] = useState<{ id: string; label: string; value: string }[]>(
        initialData?.custom_fields ? Object.entries(initialData.custom_fields).map(([k, v]) => ({ id: Math.random().toString(), label: k, value: String(v) })) : []
    )

    const toggleFeature = (val: string) => {
        setFeatures(prev => prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val])
    }

    const addCustomField = () => setCustomFields([...customFields, { id: Math.random().toString(36).substring(7), label: '', value: '' }])
    const removeCustomField = (id: string) => setCustomFields(customFields.filter(f => f.id !== id))
    const updateCustomField = (id: string, key: 'label' | 'value', val: string) => setCustomFields(customFields.map(f => (f.id === id ? { ...f, [key]: val } : f)))

    // === PHOTOS STATE ===
    const initialPhotos = initialData?.vehicle_photos ? initialData.vehicle_photos.sort((a: any, b: any) => {
        if (a.is_cover) return -1;
        if (b.is_cover) return 1;
        return a.display_order - b.display_order;
    }).map((p: any) => ({
        id: p.id || Math.random().toString(),
        url: p.url,
        isExisting: true,
        file: null,
        preview: p.url
    })) : []

    const [files, setFiles] = useState<any[]>(initialPhotos)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files))
    }
    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(f => f.type.startsWith('image/'))
        if (files.length + validFiles.length > 12) return alert('Máximo 12 fotos.')
        const mapped = validFiles.map(file => ({ id: Math.random().toString(), file, preview: URL.createObjectURL(file), isExisting: false }))
        setFiles(prev => [...prev, ...mapped])
    }
    const removeFile = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation()
        setFiles(prev => prev.filter(f => f.id !== id))
    }
    const handleDragStart = (index: number) => setDraggedIdx(index)
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIdx === null || draggedIdx === index) return
        const newFiles = [...files]
        const draggedItem = newFiles[draggedIdx]
        newFiles.splice(draggedIdx, 1)
        newFiles.splice(index, 0, draggedItem)
        setDraggedIdx(index)
        setFiles(newFiles)
    }
    const handleDragEnd = () => setDraggedIdx(null)

    // === SUBMIT LOGIC ===
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // 1. Prepare JSON payload
            const customObj: any = {}
            customFields.forEach(f => { if (f.label && f.value) customObj[f.label] = f.value })

            const finalData = {
                ...formData,
                year_fab: parseInt(formData.year_fab) || null,
                year_model: parseInt(formData.year_model) || null,
                price: parseFloat(formData.price) || null,
                mileage: parseInt(formData.mileage) || null,
                doors: parseInt(formData.doors) || null,
                features,
                custom_fields: Object.keys(customObj).length > 0 ? customObj : null,
                id: initialData?.id || undefined // if absent, server creates it
            }

            // 2. Submit Text Data
            const res = await submitAction(finalData)
            if (!res.success) throw new Error(res.error)

            const vehicleId = res.data.id

            // 3. Process Photos
            if (deleteAction) {
                // Find removed photos
                const remainingIds = files.map(f => f.id)
                const removedPhotos = initialPhotos.filter((p: any) => !remainingIds.includes(p.id))
                for (const rp of removedPhotos) {
                    const dRes = await deleteAction(rp.id)
                    if (dRes && !dRes.success) throw new Error(dRes.error)
                }
            }

            if (uploadAction) {
                // Upload new photos
                for (let i = 0; i < files.length; i++) {
                    const f = files[i]
                    if (!f.isExisting && f.file) {
                        const fd = new FormData()
                        fd.append('file', f.file)
                        fd.append('vehicleId', vehicleId)
                        fd.append('isCover', (i === 0).toString())
                        const uRes = await uploadAction(fd)
                        if (uRes && !uRes.success) throw new Error(uRes.error)
                    }
                }
            }
            toast.success('Veículo salvo com sucesso!')
            router.push('/estoque')
            router.refresh()
        } catch (err: any) {
            toast.error('Erro ao salvar: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- TAB CONTENTS ---
    const BasicForm = (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Placa</label><input name="plate_end" value={formData.plate_end} onChange={handleBasicChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-[#FF4D00]/50 uppercase" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Marca</label><div className="relative"><select name="brand" value={formData.brand} onChange={handleBasicChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"><option value="" disabled className="bg-[#0A0A0A] text-white">Selecione...</option><option value="audi" className="bg-[#0A0A0A] text-white">Audi</option><option value="bmw" className="bg-[#0A0A0A] text-white">BMW</option><option value="caoa_chery" className="bg-[#0A0A0A] text-white">CAOA Chery</option><option value="chevrolet" className="bg-[#0A0A0A] text-white">Chevrolet</option><option value="citroen" className="bg-[#0A0A0A] text-white">Citroën</option><option value="dodge" className="bg-[#0A0A0A] text-white">Dodge</option><option value="fiat" className="bg-[#0A0A0A] text-white">Fiat</option><option value="ford" className="bg-[#0A0A0A] text-white">Ford</option><option value="honda" className="bg-[#0A0A0A] text-white">Honda</option><option value="hyundai" className="bg-[#0A0A0A] text-white">Hyundai</option><option value="jac" className="bg-[#0A0A0A] text-white">JAC Motors</option><option value="jeep" className="bg-[#0A0A0A] text-white">Jeep</option><option value="kia" className="bg-[#0A0A0A] text-white">Kia</option><option value="land_rover" className="bg-[#0A0A0A] text-white">Land Rover</option><option value="lexus" className="bg-[#0A0A0A] text-white">Lexus</option><option value="mercedes" className="bg-[#0A0A0A] text-white">Mercedes-Benz</option><option value="mitsubishi" className="bg-[#0A0A0A] text-white">Mitsubishi</option><option value="nissan" className="bg-[#0A0A0A] text-white">Nissan</option><option value="peugeot" className="bg-[#0A0A0A] text-white">Peugeot</option><option value="porsche" className="bg-[#0A0A0A] text-white">Porsche</option><option value="ram" className="bg-[#0A0A0A] text-white">RAM</option><option value="renault" className="bg-[#0A0A0A] text-white">Renault</option><option value="suzuki" className="bg-[#0A0A0A] text-white">Suzuki</option><option value="toyota" className="bg-[#0A0A0A] text-white">Toyota</option><option value="volkswagen" className="bg-[#0A0A0A] text-white">Volkswagen</option><option value="volvo" className="bg-[#0A0A0A] text-white">Volvo</option><option value="outra" className="bg-[#0A0A0A] text-white">Outra</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Modelo</label><input name="model" value={formData.model} onChange={handleBasicChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Ano Fab / Mod</label><div className="flex gap-2"><input name="year_fab" value={formData.year_fab} onChange={handleBasicChange} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /><span className="text-white/40 flex items-center">/</span><input name="year_model" value={formData.year_model} onChange={handleBasicChange} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Preço</label><input name="price" value={formData.price} onChange={handleBasicChange} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">KM</label><input name="mileage" value={formData.mileage} onChange={handleBasicChange} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Câmbio</label><div className="relative"><select name="transmission" value={formData.transmission} onChange={handleBasicChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"><option value="automatic" className="bg-[#0A0A0A] text-white">Automático</option><option value="manual" className="bg-[#0A0A0A] text-white">Manual</option><option value="cvt" className="bg-[#0A0A0A] text-white">CVT</option><option value="automated" className="bg-[#0A0A0A] text-white">Automatizado</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Combustível</label><div className="relative"><select name="fuel" value={formData.fuel} onChange={handleBasicChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"><option value="flex" className="bg-[#0A0A0A] text-white">Flex</option><option value="gasoline" className="bg-[#0A0A0A] text-white">Gasolina</option><option value="ethanol" className="bg-[#0A0A0A] text-white">Etanol</option><option value="diesel" className="bg-[#0A0A0A] text-white">Diesel</option><option value="hybrid" className="bg-[#0A0A0A] text-white">Híbrido</option><option value="electric" className="bg-[#0A0A0A] text-white">Elétrico</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Cor</label><input name="color" value={formData.color} onChange={handleBasicChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Motor</label><input name="engine" value={formData.engine} onChange={handleBasicChange} type="text" placeholder="Ex: 1.5 Turbo" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-white/70">Portas</label><input name="doors" value={formData.doors} onChange={handleBasicChange} type="number" placeholder="Ex: 4" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white" /></div>

                {/* NEW DETALHES TEXTAREA DIRECTLY IN BASIC FORM */}
                <div className="space-y-2 lg:col-span-3">
                    <label className="text-sm font-medium text-white/70 font-bold text-[#FF4D00]">Detalhes / Descrição do Veículo</label>
                    <textarea name="description" value={formData.description} onChange={handleBasicChange} rows={5} placeholder="Descreva os detalhes importantes. Por ex: Único dono, todas revisões na concessionária..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#FF4D00]/50 resize-y" />
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-white/10"><button type="button" onClick={() => document.getElementById('tab-btn-photos')?.click()} className="bg-[#FF4D00] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#FF4D00]/90 transition-all">Avançar para Fotos</button></div>
        </div>
    )

    const optionalItemsList = [
        { id: 'ar_condicionado', label: 'Ar Condicionado' },
        { id: 'direcao_hidraulica', label: 'Direção Hidráulica' },
        { id: 'direcao_eletrica', label: 'Direção Elétrica' },
        { id: 'teto_solar', label: 'Teto Solar' },
        { id: 'bancos_couro', label: 'Bancos de Couro' },
        { id: 'vidros_eletricos', label: 'Vidros Elétricos' },
        { id: 'travas_eletricas', label: 'Travas Elétricas' },
        { id: 'alarme', label: 'Alarme' },
        { id: 'multimidia', label: 'Kit Multimídia' },
        { id: 'camera_re', label: 'Câmera de Ré' },
        { id: 'sensor_estacionamento', label: 'Sensor de Estacionamento' },
        { id: 'airbag', label: 'Airbag' },
        { id: 'freio_abs', label: 'Freio ABS' },
        { id: 'rodas_liga_leve', label: 'Rodas de Liga Leve' },
        { id: 'controle_tracao', label: 'Controle de Tração' },
        { id: 'computador_bordo', label: 'Computador de Bordo' },
        { id: 'piloto_automatico', label: 'Piloto Automático' },
        { id: 'farol_neblina', label: 'Farol de Neblina' },
        { id: 'volante_multifuncional', label: 'Volante Multifuncional' },
        { id: 'chave_presencial', label: 'Chave Presencial' }
    ]

    const ExtrasForm = (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Equipamentos Padrão</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {optionalItemsList.map(i => (
                        <label key={i.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                            <input type="checkbox" checked={features.includes(i.id)} onChange={() => toggleFeature(i.id)} className="w-5 h-5 rounded-md accent-[#FF4D00]" />
                            <span className="text-sm text-white/70">{i.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="pt-6 border-t border-white/10"><div className="flex items-center justify-between mb-4"><h3 className="text-lg text-white">Campos Customizados</h3><button type="button" onClick={addCustomField} className="bg-white/10 px-3 py-1.5 rounded text-sm text-white">Adicionar</button></div><div className="space-y-3">{customFields.map((field) => (<div key={field.id} className="flex gap-3"><input type="text" placeholder="Nome. Ex: Potência" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} className="flex-1 bg-white/5 border rounded-xl px-3 text-white" /><input type="text" placeholder="Valor. Ex: 150cv" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} className="flex-1 bg-white/5 border rounded-xl px-3 text-white" /><button type="button" onClick={() => removeCustomField(field.id)} className="p-2.5 bg-red-500/20 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>
            <div className="flex justify-between pt-6 border-t border-white/10"><button type="button" onClick={() => document.getElementById('tab-btn-photos')?.click()} className="text-white/60">Voltar</button><button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5" />{isSubmitting ? 'Salvando...' : initialData?.id ? 'Salvar Alterações' : 'Cadastrar Veículo Final'}</button></div>
        </div>
    )

    const PhotosForm = (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full h-64 border-2 border-dashed border-white/20 hover:border-[#FF4D00]/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files)) }}><input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} /><UploadCloud className="h-8 w-8 text-[#FF4D00] mb-4" /><p className="text-white text-lg font-medium">Clique ou arraste imagens aqui</p><p className="text-white/50 text-sm mt-2 text-center">Formatos aceitos: JPG, PNG, WEBP (Máx 5MB).<br />Resolução ideal: 1920x1080px (Proporção 16:9)</p></div>
            <div>
                <h4 className="text-white/70 mb-4">Fotos Anexadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" onDragOver={e => e.preventDefault()}>
                    {files.map((fileObj, i) => (<div key={fileObj.id} draggable onDragStart={() => handleDragStart(i)} onDragOver={(e) => handleDragOver(e, i)} onDragEnd={handleDragEnd} className="aspect-square rounded-2xl border border-white/10 relative overflow-hidden group"><img src={fileObj.preview} alt="Preview" className="w-full h-full object-cover" /><button onClick={(e) => removeFile(fileObj.id, e)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button></div>))}
                </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-white/10"><button type="button" onClick={() => document.getElementById('tab-btn-basic')?.click()} className="text-white/60">Voltar</button><button type="button" onClick={() => document.getElementById('tab-btn-extras')?.click()} className="bg-[#FF4D00] text-white px-8 py-3 rounded-2xl font-bold">Avançar para Extras</button></div>
        </div>
    )

    const tabsContent = [
        { id: 'basic', label: 'Dados Básicos', content: BasicForm },
        { id: 'photos', label: 'Fotos (12 Máx)', content: PhotosForm },
        { id: 'extras', label: 'Opcionais & Config', content: ExtrasForm },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mt-2">
                <Link href="/estoque" className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
                <div><h1 className="text-2xl font-bold text-white mb-1">{initialData?.id ? 'Editar Veículo' : 'Adicionar Veículo'}</h1><p className="text-white/60">Preencha os dados e opcionais com riqueza de detalhes.</p></div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/10 p-4 sm:p-8">
                <form onSubmit={handleSubmit}>
                    <Tabs tabs={tabsContent} defaultTabId="basic" />
                </form>
            </div>
        </div>
    )
}
