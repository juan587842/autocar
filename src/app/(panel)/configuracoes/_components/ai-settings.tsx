"use client"

import { Bot, Sparkles, Database, KeyRound, Cpu } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"

export function AiSettings() {
    const { settings, updateSetting, isLoading } = useSettingsStore()

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-white/10 rounded col-span-2"></div><div className="h-2 bg-white/10 rounded col-span-1"></div></div><div className="h-2 bg-white/10 rounded"></div></div></div></div>
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Bot className="w-6 h-6 text-purple-400" /> Inteligência Artificial
                </h2>
                <p className="text-white/60 text-sm mt-1">Configure o cérebro por trás dos seus chats e resumos automáticos.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-6 relative z-10">

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-purple-400" /> Modelo Padrão de IA
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["GPT-4o Mini", "GPT-4o", "Gemini 2.5 Flash"].map((model) => (
                                <label key={model} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="llm_model"
                                        checked={settings.ai_default_model === model}
                                        onChange={() => updateSetting("ai_default_model", model)}
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white/60 text-sm font-medium transition-all group-hover:bg-white/5 peer-checked:bg-purple-500/20 peer-checked:border-purple-500/50 peer-checked:text-purple-300 text-center">
                                        {model}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-purple-400" /> OpenAI API Key
                        </label>
                        <input
                            type="password"
                            placeholder="sk-...."
                            defaultValue="sk-1234567890abcdef1234567890abcdef"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white font-mono text-sm tracking-wider"
                        />
                        <p className="text-xs text-white/40">Sua chave é salva com criptografia forte no banco de dados.</p>
                    </div>

                </div>
            </div>

            {/* Switches de Comportamento */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white/60" /> Comportamento Autônomo
                </h3>
                <div className="space-y-4">

                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                            <p className="text-white font-medium text-sm">Resumo Automático de Chats</p>
                            <p className="text-white/50 text-xs mt-0.5">IA lê e resume conversas do WhatsApp no CRM.</p>
                        </div>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.ai_enable_stock_check ? 'bg-red-500' : 'bg-white/20'}`}>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={settings.ai_enable_stock_check || false}
                                onChange={(e) => updateSetting("ai_enable_stock_check", e.target.checked)}
                            />
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.ai_enable_stock_check ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                            <p className="text-white font-medium text-sm">Agendamento Contextual</p>
                            <p className="text-white/50 text-xs mt-0.5">Permite a IA sugerir dias baseados na sua agenda do Google.</p>
                        </div>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.ai_enable_scheduling ? 'bg-red-500' : 'bg-white/20'}`}>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={settings.ai_enable_scheduling || false}
                                onChange={(e) => updateSetting("ai_enable_scheduling", e.target.checked)}
                            />
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.ai_enable_scheduling ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </label>

                </div>
            </div>

        </div>
    )
}
