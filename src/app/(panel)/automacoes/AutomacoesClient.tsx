'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, Zap, Edit2, Play, Users, MessageSquareText } from 'lucide-react'

export default function AutomacoesClient({ initialAutomations, storeSettingsId }: { initialAutomations: any, storeSettingsId: string | undefined }) {
    const supabase = createClient()
    const [automations, setAutomations] = useState(initialAutomations)
    const [loading, setLoading] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState('')

    const updateSettings = async (newAuto: any) => {
        setAutomations(newAuto)
        if (!storeSettingsId) return

        setLoading('save')
        const { error } = await supabase
            .from('store_settings')
            .update({ automations: newAuto })
            .eq('id', storeSettingsId)

        if (!error) {
            setSuccessMsg('Automações salvas com sucesso!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } else {
            alert('Erro ao salvar no banco.')
        }
        setLoading(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        Automações e Gatilhos ⚡
                    </h1>
                    <p className="text-white/60">Configure campanhas automáticas e ações de IA.</p>
                </div>
                {successMsg && <span className="text-green-400 font-bold bg-green-500/20 px-4 py-2 rounded-xl">{successMsg}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* MATcH PERFEITO */}
                <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden transition-all ${!automations.matchPerfeito ? 'opacity-80' : 'ring-1 ring-[#FF4D00]'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${automations.matchPerfeito ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-white/10 text-white/50'}`}>
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">Match Perfeito</h3>
                                <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Gatilho de Estoque</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={automations.matchPerfeito}
                                onChange={(e) => updateSettings({ ...automations, matchPerfeito: e.target.checked })}
                                disabled={loading !== null}
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D00]"></div>
                        </label>
                    </div>

                    <p className="text-sm text-white/60 mb-6 px-1">Envia um aviso automático no WhatsApp quando um veículo adicionado ao estoque atingir o número mínimo de coincidências com a lista de desejos de um cliente.</p>

                    <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold uppercase tracking-wider text-white/60">Sensibilidade (Matches Mínimos): <span className="text-white">{automations.matchSensitivity}</span></label>
                        <input
                            type="range"
                            min="1" max="5"
                            value={automations.matchSensitivity}
                            onChange={(e) => updateSettings({ ...automations, matchSensitivity: Number(e.target.value) })}
                            className="w-full accent-[#FF4D00]"
                            disabled={!automations.matchPerfeito}
                        />
                        <div className="flex justify-between text-[10px] text-white/40 font-bold px-1">
                            <span>1 (Amplo)</span>
                            <span>3 (Ideal)</span>
                            <span>5 (Restrito)</span>
                        </div>
                    </div>
                </div>

                {/* ANIVERSÁRIOS */}
                <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden transition-all ${!automations.birthdayCampaign ? 'opacity-80' : 'ring-1 ring-[#FF4D00]'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${automations.birthdayCampaign ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-white/10 text-white/50'}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">Campanha de Aniversário</h3>
                                <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Cron Diário (10:00AM)</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={automations.birthdayCampaign}
                                onChange={(e) => updateSettings({ ...automations, birthdayCampaign: e.target.checked })}
                                disabled={loading !== null}
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D00]"></div>
                        </label>
                    </div>

                    <p className="text-sm text-white/60 mb-6 px-1">Verifica a base de clientes nativa diariamente e puxa contatos que fazem aniversário hoje para envio de felicitacões automáticas.</p>

                    <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                                <MessageSquareText className="w-3.5 h-3.5" />
                                Texto do Template
                            </label>
                        </div>
                        <textarea
                            value={automations.birthdayTemplate}
                            onChange={(e) => updateSettings({ ...automations, birthdayTemplate: e.target.value })}
                            disabled={!automations.birthdayCampaign}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50 resize-none"
                            placeholder="Use {nome} para inserir o nome do cliente."
                        />
                        <p className="text-xs text-white/40 mt-1">Variáveis suportadas: <code className="bg-white/10 px-1 rounded text-[#FF4D00]">{"{nome}"}</code></p>
                    </div>
                </div>

            </div>
        </div>
    )
}
