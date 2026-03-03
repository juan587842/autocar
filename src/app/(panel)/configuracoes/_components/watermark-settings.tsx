"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Type, LayoutTemplate, SlidersHorizontal, Plus, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function WatermarkSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [settingsId, setSettingsId] = useState<string | null>(null)
    const [config, setConfig] = useState({
        watermark_type: 'none',
        watermark_text: '',
        watermark_image_url: '',
        watermark_size: 20,
        watermark_opacity: 50,
        watermark_position: 'bottom-right'
    })

    const supabase = createClient()

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data, error } = await supabase
                    .from('store_settings')
                    .select('id, watermark_type, watermark_text, watermark_image_url, watermark_size, watermark_opacity, watermark_position')
                    .limit(1)
                    .single()

                if (data && !error) {
                    setSettingsId(data.id)
                    setConfig({
                        watermark_type: data.watermark_type || 'none',
                        watermark_text: data.watermark_text || '',
                        watermark_image_url: data.watermark_image_url || '',
                        watermark_size: data.watermark_size || 20,
                        watermark_opacity: data.watermark_opacity || 50,
                        watermark_position: data.watermark_position || 'bottom-right'
                    })
                }
            } catch (err) {
                console.error("Erro ao puxar settings:", err)
            } finally {
                setIsFetching(false)
            }
        }
        fetchSettings()
    }, [supabase])

    const handleSave = async () => {
        if (!settingsId) return
        setIsLoading(true)
        try {
            await supabase
                .from('store_settings')
                .update({
                    watermark_type: config.watermark_type,
                    watermark_text: config.watermark_text,
                    watermark_image_url: config.watermark_image_url,
                    watermark_size: config.watermark_size,
                    watermark_opacity: config.watermark_opacity,
                    watermark_position: config.watermark_position
                })
                .eq('id', settingsId)

            alert('Configurações salvas com sucesso!')
        } catch (err) {
            console.error("Erro ao salvar watermark settings", err)
            alert('Erro ao salvar as configurações.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-white/10 rounded col-span-2"></div><div className="h-2 bg-white/10 rounded col-span-1"></div></div><div className="h-2 bg-white/10 rounded"></div></div></div></div>
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-heading text-white">Marca D'água nas Fotos</h2>
                    <p className="text-white/60 text-sm mt-1">Proteja as fotos dos seus veículos aplicando sua logo ou nome da loja automaticamente.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#FF4D00] hover:bg-[#ff6a00] text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 text-sm font-medium shadow-lg shadow-[#FF4D00]/20"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Salvando..." : "Salvar Configurações"}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Tipo */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/80">Tipo de Marca D'água</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['none', 'text', 'image'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setConfig({ ...config, watermark_type: type })}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium flex gap-2 items-center justify-center transition-all ${config.watermark_type === type
                                        ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]'
                                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {type === 'none' && 'Desativada'}
                                    {type === 'text' && <Type className="w-4 h-4" />}
                                    {type === 'text' && 'Texto'}
                                    {type === 'image' && <ImageIcon className="w-4 h-4" />}
                                    {type === 'image' && 'Imagem'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {config.watermark_type === 'text' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-white/80">Texto da Marca D'água</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={config.watermark_text}
                                    onChange={(e) => setConfig({ ...config, watermark_text: e.target.value })}
                                    placeholder="Ex: AutoCar Premium"
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {config.watermark_type === 'image' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-white/80">URL da Imagem Base (PNG Transparente)</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        value={config.watermark_image_url}
                                        onChange={(e) => setConfig({ ...config, watermark_image_url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium text-sm"
                                    />
                                </div>
                                <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors shrink-0 tooltip">
                                    <Plus className="w-5 h-5 text-white/60" />
                                </button>
                            </div>
                        </div>
                    )}

                    {config.watermark_type !== 'none' && (
                        <>
                            {/* Posição */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" /> Posição na Imagem
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setConfig({ ...config, watermark_position: pos })}
                                            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${config.watermark_position === pos
                                                ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Controles deslizantes */}
                            <div className="space-y-6 pt-4 border-t border-white/10">
                                {/* Tamanho */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4" /> Tamanho ({config.watermark_size}%)
                                        </label>
                                    </div>
                                    <input
                                        type="range"
                                        min="5" max="100"
                                        value={config.watermark_size}
                                        onChange={(e) => setConfig({ ...config, watermark_size: parseInt(e.target.value) })}
                                        className="w-full accent-[#FF4D00]"
                                    />
                                    <div className="flex justify-between text-xs text-white/40">
                                        <span>Pequena</span>
                                        <span>Tela Toda</span>
                                    </div>
                                </div>

                                {/* Opacidade */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4" /> Opacidade ({config.watermark_opacity}%)
                                        </label>
                                    </div>
                                    <input
                                        type="range"
                                        min="10" max="100"
                                        value={config.watermark_opacity}
                                        onChange={(e) => setConfig({ ...config, watermark_opacity: parseInt(e.target.value) })}
                                        className="w-full accent-[#FF4D00]"
                                    />
                                    <div className="flex justify-between text-xs text-white/40">
                                        <span>Invisível</span>
                                        <span>Totalmente Sólida</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Preview Box */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/10 blur-[40px] rounded-full pointer-events-none" />
                    <p className="text-white/40 text-sm font-medium mb-6 relative z-10">Preview (Simulação)</p>

                    <div className="relative w-full max-w-sm aspect-video bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
                        <ImageIcon className="w-12 h-12 text-white/20" />

                        {config.watermark_type !== 'none' && (
                            <div
                                className={`absolute font-bold text-white transition-all opacity-${Math.floor(config.watermark_opacity / 10) * 10} flex items-center justify-center
                                    ${config.watermark_position === 'top-left' ? 'top-4 left-4' : ''}
                                    ${config.watermark_position === 'top-right' ? 'top-4 right-4' : ''}
                                    ${config.watermark_position === 'bottom-left' ? 'bottom-4 left-4' : ''}
                                    ${config.watermark_position === 'bottom-right' ? 'bottom-4 right-4' : ''}
                                    ${config.watermark_position === 'center' ? 'inset-0 items-center justify-center' : ''}
                                `}
                                style={{
                                    fontSize: `${Math.max(10, (config.watermark_size / 100) * 32)}px`,
                                    opacity: config.watermark_opacity / 100,
                                }}
                            >
                                {config.watermark_type === 'text' ? (
                                    config.watermark_text || 'EXEMPLO'
                                ) : (
                                    <div
                                        className="bg-white/20 backdrop-blur-sm rounded flex items-center justify-center truncate"
                                        style={{
                                            width: `${Math.max(40, (config.watermark_size / 100) * 200)}px`,
                                            height: `${Math.max(20, (config.watermark_size / 100) * 60)}px`,
                                        }}
                                    >
                                        [ LOGO ]
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
