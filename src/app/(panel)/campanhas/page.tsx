'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Send, Loader2, MessageSquare, Calendar, Users, BarChart3, Trash2, Play, Eye, X } from 'lucide-react'

interface Campaign {
    id: string
    name: string
    description: string | null
    channel: string
    message_template: string
    target_filter: Record<string, any>
    status: string
    scheduled_at: string | null
    total_recipients: number
    total_sent: number
    total_delivered: number
    total_read: number
    total_failed: number
    created_at: string
}

export default function CampaignsPage() {
    const supabase = createClient()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        description: '',
        channel: 'whatsapp',
        message_template: '',
    })

    useEffect(() => { fetchCampaigns() }, [])

    async function fetchCampaigns() {
        const { data } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setCampaigns(data)
        setIsLoading(false)
    }

    async function createCampaign() {
        if (!newCampaign.name.trim() || !newCampaign.message_template.trim()) return
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('campaigns').insert({
            ...newCampaign,
            created_by: user?.id,
        })

        setShowCreate(false)
        setNewCampaign({ name: '', description: '', channel: 'whatsapp', message_template: '' })
        fetchCampaigns()
    }

    async function deleteCampaign(id: string) {
        if (!confirm('Deletar campanha?')) return
        await supabase.from('campaigns').delete().eq('id', id)
        fetchCampaigns()
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-white/10 text-white/60',
        scheduled: 'bg-blue-500/20 text-blue-400',
        sending: 'bg-yellow-500/20 text-yellow-400',
        sent: 'bg-green-500/20 text-green-400',
        cancelled: 'bg-red-500/20 text-red-400',
    }

    const statusLabels: Record<string, string> = {
        draft: 'Rascunho',
        scheduled: 'Agendada',
        sending: 'Enviando...',
        sent: 'Enviada',
        cancelled: 'Cancelada',
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-white">Campanhas</h1>
                    <p className="text-white/60 text-sm mt-1">Crie e gerencie campanhas de marketing em massa via WhatsApp, Email ou SMS.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-[#FF4D00] hover:bg-[#ff6a00] text-white px-4 py-2 rounded-xl transition-all text-sm font-medium shadow-lg shadow-[#FF4D00]/20"
                >
                    <Plus className="w-4 h-4" />
                    Nova Campanha
                </button>
            </div>

            {/* Formulário de criação */}
            {showCreate && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-fade-in backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Criar Campanha</h3>
                        <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase">Nome</label>
                            <input
                                value={newCampaign.name}
                                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                placeholder="Ex: Promoção Black Friday"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF4D00]/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase">Canal</label>
                            <select
                                value={newCampaign.channel}
                                onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                            >
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase">Descrição</label>
                        <input
                            value={newCampaign.description}
                            onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                            placeholder="Breve descrição da campanha"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF4D00]/50 outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/60 uppercase">Mensagem Template</label>
                        <textarea
                            value={newCampaign.message_template}
                            onChange={(e) => setNewCampaign({ ...newCampaign, message_template: e.target.value })}
                            placeholder="Olá {nome}! Temos uma oferta especial para você..."
                            rows={4}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF4D00]/50 outline-none resize-none"
                        />
                        <p className="text-xs text-white/30">Use {'{nome}'}, {'{telefone}'} como variáveis de personalização.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
                        <button onClick={createCampaign} className="px-4 py-2 bg-[#FF4D00] hover:bg-[#ff6a00] text-white rounded-xl text-sm font-medium">Criar Campanha</button>
                    </div>
                </div>
            )}

            {/* Lista */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#FF4D00] animate-spin" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                    <Send className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">Nenhuma campanha criada</p>
                    <p className="text-sm mt-1">Crie sua primeira campanha de marketing para engajar seus leads.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((camp) => (
                        <div key={camp.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-semibold">{camp.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[camp.status] || 'bg-white/10 text-white/40'}`}>
                                            {statusLabels[camp.status] || camp.status}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                                            {camp.channel.toUpperCase()}
                                        </span>
                                    </div>
                                    {camp.description && <p className="text-white/50 text-sm">{camp.description}</p>}

                                    {/* Métricas */}
                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                                            <Users className="w-3 h-3" />
                                            <span>{camp.total_recipients} destinatários</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                                            <Send className="w-3 h-3" />
                                            <span>{camp.total_sent} enviadas</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                                            <Eye className="w-3 h-3" />
                                            <span>{camp.total_read} lidas</span>
                                        </div>
                                        {camp.total_failed > 0 && (
                                            <div className="flex items-center gap-1.5 text-xs text-red-400">
                                                <span>{camp.total_failed} falhas</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {camp.status === 'draft' && (
                                        <button className="p-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all" title="Enviar">
                                            <Play className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => deleteCampaign(camp.id)} className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Excluir">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
