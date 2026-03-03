'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitVehicleOffer } from '@/app/venda-seu-veiculo/actions'
import { Input, Button, Badge } from '@/components/ui'
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react'

// Utilizando React 19 hook
const initialState = { success: false, message: '', errors: {} as any }

export function VehicleOfferForm() {
    const [state, formAction, isPending] = useActionState(submitVehicleOffer, initialState)
    const [photos, setPhotos] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(URL.revokeObjectURL)
        }
    }, [previews])

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const allowedFiles = newFiles.filter(file => file.type.startsWith('image/'))

            if (photos.length + allowedFiles.length > 5) {
                alert('Você só pode enviar no máximo 5 fotos.')
                return
            }

            const updatedPhotos = [...photos, ...allowedFiles]
            setPhotos(updatedPhotos)

            const newPreviews = allowedFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])

            // Update the actual input.files so the FormData picks them all up
            const dataTransfer = new DataTransfer()
            updatedPhotos.forEach(file => dataTransfer.items.add(file))
            const input = document.getElementById('photos-input') as HTMLInputElement
            if (input) input.files = dataTransfer.files
        }
    }

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index)
        setPhotos(updatedPhotos)
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })

        const dataTransfer = new DataTransfer()
        updatedPhotos.forEach(file => dataTransfer.items.add(file))
        const input = document.getElementById('photos-input') as HTMLInputElement
        if (input) input.files = dataTransfer.files
    }

    if (state.success) {
        return (
            <div className="bg-[var(--color-status-success)]/10 border border-[var(--color-status-success)]/20 p-8 rounded-[var(--radius-xl)] text-center space-y-4">
                <CheckCircle2 size={48} className="text-[var(--color-status-success)] mx-auto" />
                <h3 className="text-2xl font-bold text-[var(--color-status-success)]" style={{ fontFamily: 'var(--font-display)' }}>Proposta Enviada!</h3>
                <p className="text-[var(--color-text-primary)]">
                    Recebemos os dados do seu veículo. Nossa equipe de avaliação fará uma análise e entrará em contato em breve via WhatsApp ou e-mail.
                </p>
            </div>
        )
    }

    return (
        <form action={formAction} className="relative overflow-hidden space-y-8 bg-[#181a22]/60 backdrop-blur-2xl p-6 md:p-10 rounded-[1.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Inner Glows */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF4D00]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-32 right-[-10%] w-[400px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-8">

                {state.message && !state.success && (
                    <div className="p-4 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm">{state.message}</p>
                    </div>
                )}

                {/* Dados Pessoais */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-[var(--color-border)] pb-2" style={{ fontFamily: 'var(--font-display)' }}>Seus Dados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input label="Nome completo *" name="name" required disabled={isPending} />
                            {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
                        </div>
                        <div>
                            <Input
                                label="Telefone/WhatsApp *"
                                name="phone"
                                type="tel"
                                required
                                disabled={isPending}
                                placeholder="(11) 98765-4321"
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, '')
                                    if (v.length > 11) v = v.slice(0, 11)
                                    if (v.length > 7) {
                                        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
                                    } else if (v.length > 2) {
                                        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`
                                    } else if (v.length > 0) {
                                        e.target.value = `(${v}`
                                    }
                                }}
                                maxLength={15}
                            />
                            {state.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <Input label="E-mail" name="email" type="email" disabled={isPending} />
                            {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
                        </div>
                    </div>
                </div>

                {/* Dados do Veículo */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-[var(--color-border)] pb-2" style={{ fontFamily: 'var(--font-display)' }}>Dados do Veículo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input label="Marca *" name="brand" required disabled={isPending} />
                            {state.errors?.brand && <p className="text-red-500 text-xs mt-1">{state.errors.brand[0]}</p>}
                        </div>
                        <div>
                            <Input label="Modelo *" name="model" required disabled={isPending} />
                            {state.errors?.model && <p className="text-red-500 text-xs mt-1">{state.errors.model[0]}</p>}
                        </div>
                        <div>
                            <Input label="Ano (Ex: 2021/2022) *" name="year" required disabled={isPending} />
                            {state.errors?.year && <p className="text-red-500 text-xs mt-1">{state.errors.year[0]}</p>}
                        </div>
                        <div>
                            <Input label="Quilometragem *" name="mileage" type="number" required disabled={isPending} />
                            {state.errors?.mileage && <p className="text-red-500 text-xs mt-1">{state.errors.mileage[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <Input label="Preço Desejado (R$) *" name="expected_price" type="number" step="0.01" required disabled={isPending} />
                            {state.errors?.expected_price && <p className="text-red-500 text-xs mt-1">{state.errors.expected_price[0]}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Observações adicionais</label>
                                <textarea
                                    name="notes"
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-h-[100px] resize-y"
                                    placeholder="Detalhes sobre o estado de conservação, histórico, se possui manual e chave reserva, etc."
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload de Fotos */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold border-b border-[var(--color-border)] pb-2" style={{ fontFamily: 'var(--font-display)' }}>Fotos do Veículo</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Envie até 5 fotos claras do seu carro (frente, traseira, lateral, painel e bancos).</p>

                    <div className="mt-4">
                        <label
                            htmlFor="photos-input-ui"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--color-bg-primary)] transition-colors ${photos.length >= 5 || isPending ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-[var(--color-text-muted)]" />
                                <p className="mb-2 text-sm text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-accent)]">Clique para upload</span></p>
                                <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG até 10MB</p>
                            </div>
                        </label>
                        {/* Real hidden input attached to form action */}
                        <input
                            id="photos-input"
                            name="photos"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            readOnly
                        />
                        {/* UI input used to intercept clicks */}
                        <input
                            id="photos-input-ui"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={isPending || photos.length >= 5}
                        />
                    </div>

                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                            {previews.map((src, index) => (
                                <div key={src} className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                                        disabled={isPending}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LGPD */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="lgpd_consent"
                            required
                            className="mt-1 shrink-0 w-4 h-4 text-[var(--color-accent)] bg-[var(--color-bg-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] focus:ring-2"
                            disabled={isPending}
                        />
                        <span className="text-sm text-[var(--color-text-secondary)] leading-tight">
                            Autorizo o uso dos meus dados para que a equipe da AutoCar entre em contato comigo a respeito desta proposta, de acordo com a Lei Geral de Proteção de Dados (LGPD).
                        </span>
                    </label>
                    {state.errors?.lgpd_consent && <p className="text-red-500 text-xs mt-1 ml-7">{state.errors.lgpd_consent[0]}</p>}
                </div>

                <Button
                    type="submit"
                    className="w-full py-4 text-base"
                    disabled={isPending}
                    isLoading={isPending}
                >
                    {isPending ? 'Enviando proposta...' : 'Enviar para avaliação'}
                </Button>
            </div>
        </form>
    )
}
