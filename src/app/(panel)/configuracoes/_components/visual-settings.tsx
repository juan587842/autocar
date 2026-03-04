"use client"

import { Palette, UploadCloud, MonitorSmartphone } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"

export function VisualSettings() {
    const { settings, updateSetting, isLoading } = useSettingsStore()

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-white/10 rounded col-span-2"></div><div className="h-2 bg-white/10 rounded col-span-1"></div></div><div className="h-2 bg-white/10 rounded"></div></div></div></div>
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Palette className="w-6 h-6 text-pink-400" /> Identidade Visual
                </h2>
                <p className="text-white/60 text-sm mt-1">Personalize as cores, logotipos e como sua marca aparece no Catálogo Público.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna Esquerda: Uploads e Cores */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Sessão Logotipo */}
                    <div>
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2"><UploadCloud className="w-4 h-4 text-white/60" /> Logotipo Oficial</h3>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Preview Atual */}
                            <div className="w-48 h-24 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center p-4">
                                <img src="https://i.imgur.com/8Qp2Z5J.png" alt="Logo Preview" className="max-h-full object-contain filter invert opacity-80" />
                            </div>

                            {/* Área de Drop */}
                            <div className="flex-1 w-full border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-2">
                                    <UploadCloud className="w-5 h-5 text-white/80" />
                                </div>
                                <p className="text-sm text-white font-medium">Clique ou arraste a nova imagem</p>
                                <p className="text-xs text-white/40 mt-1">PNG transparente, Max 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Efeitos e Cores */}
                    <div>
                        <h3 className="text-white font-medium mb-4">Cores Globais</h3>
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Cor Primária (HEX)</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-lg shrink-0" style={{ backgroundColor: settings.primary_color || '#EF4444' }} />
                                    <input type="text" value={settings.primary_color || ""} onChange={(e) => updateSetting("primary_color", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-red-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Efeito UI Principal</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-red-500 outline-none appearance-none">
                                    <option value="glass">Glassmorphism (Recomendado)</option>
                                    <option value="solid">Sólido / Flat</option>
                                    <option value="neumorphism">Neumorphism Dark</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Coluna Direita: Live Preview */}
                <div className="lg:col-span-1">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2"><MonitorSmartphone className="w-4 h-4 text-white/60" /> Preview</h3>

                    <div className="w-full h-[400px] border-[6px] border-[#333] rounded-[2rem] bg-black relative overflow-hidden shadow-2xl">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333] rounded-b-2xl z-20" />

                        {/* Tela do Celular (Mock do Catálogo em tempo real) */}
                        <div className="absolute inset-0 bg-zinc-950 p-4 pt-10 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-5 bg-white/20 rounded animate-pulse" />
                                <div className="w-6 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                            </div>

                            {/* Mock Vehicle Card */}
                            <div className="w-full h-40 bg-zinc-900 border border-white/10 rounded-2xl mb-4 relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                                <div className="absolute bottom-3 left-3 w-1/2 h-4 bg-white/20 rounded" />
                                <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 rounded-md text-[10px] text-white font-bold">Destaque</div>
                            </div>

                            <div className="mt-auto h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 flex items-center justify-around">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><div className="w-4 h-4 bg-red-500 rounded-sm" /></div>
                                <div className="w-4 h-4 bg-white/20 rounded-sm" />
                                <div className="w-4 h-4 bg-white/20 rounded-sm" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
