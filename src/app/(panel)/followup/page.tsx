'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Play, Pause, Trash2, Clock, MessageSquare, Mail, Phone, ChevronRight, Loader2 } from 'lucide-react'

interface CadenceStep {
    day: number
    channel: 'whatsapp' | 'email' | 'phone' | 'sms'
    template: string
}

interface Cadence {
    id: string
    name: string
    description: string | null
    steps: CadenceStep[]
    is_active: boolean
    created_at: string
}

export default function FollowUpPage() {
    const supabase = createClient()
    const [cadences, setCadences] = useState<Cadence[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newCadence, setNewCadence] = useState({ name: '', description: '' })
    const [newSteps, setNewSteps] = useState<CadenceStep[]>([
        { day: 1, channel: 'whatsapp', template: 'Olá {nome}! Como posso ajudá-lo(a) hoje?' }
    ])

    useEffect(() => {
        fetchCadences()
    }, [])

    async function fetchCadences() {
        const { data } = await supabase
            .from('followup_cadences')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setCadences(data)
        setIsLoading(false)
    }

    async function createCadence() {
        if (!newCadence.name.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('followup_cadences').insert({
            name: newCadence.name,
            description: newCadence.description || null,
            steps: newSteps,
            created_by: user?.id,
        })

        if (!error) {
            setShowCreate(false)
            setNewCadence({ name: '', description: '' })
            setNewSteps([{ day: 1, channel: 'whatsapp', template: '' }])
            fetchCadences()
        }
    }

    async function toggleCadence(id: string, currentActive: boolean) {
        await supabase.from('followup_cadences').update({ is_active: !currentActive }).eq('id', id)
        fetchCadences()
    }

    async function deleteCadence(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta cadência?')) return
        await supabase.from('followup_cadences').delete().eq('id', id)
        fetchCadences()
    }

    const channelIcon = (ch: string) => {
        switch (ch) {
            case 'whatsapp': return <MessageSquare className="w-3 h-3" />
            case 'email': return <Mail className="w-3 h-3" />
            case 'phone': return <Phone className="w-3 h-3" />
            default: return <MessageSquare className="w-3 h-3" />
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-white">Follow-Up</h1>
                    <p className="text-white/60 text-sm mt-1">Cadências automáticas de follow-up para seus leads e clientes.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-[#FF4D00] hover:bg-[#ff6a00] text-white px-4 py-2 rounded-xl transition-all text-sm font-medium shadow-lg shadow-[#FF4D00]/20"
                >
                    <Plus className="w-4 h-4" />
                    Nova Cadência
                </button>
            </div>

            {/* Formulário de criação */}
            {showCreate && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-fade-in backdrop-blur-xl">
                    <h3 className="text-lg font-semibold text-white">Criar Cadência</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase">Nome</label>
                            <input
                                value={newCadence.name}
                                onChange={(e) => setNewCadence({ ...newCadence, name: e.target.value })}
                                placeholder="Ex: Pós-visita"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF4D00]/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase">Descrição</label>
                            <input
                                value={newCadence.description}
                                onChange={(e) => setNewCadence({ ...newCadence, description: e.target.value })}
                                placeholder="Ex: Sequência após visita à loja"
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF4D00]/50 outline-none"
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/60 uppercase">Passos da Cadência</label>
                        {newSteps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3 bg-black/20 rounded-xl p-3">
                                <div className="flex items-center gap-1 text-white/60 text-xs shrink-0">
                                    <Clock className="w-3 h-3" />
                                    <span>Dia</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={step.day}
                                        onChange={(e) => {
                                            const s = [...newSteps]
                                            s[i].day = parseInt(e.target.value) || 1
                                            setNewSteps(s)
                                        }}
                                        className="w-12 bg-black/30 border border-white/10 rounded px-1 py-0.5 text-white text-xs text-center"
                                    />
                                </div>

                                <select
                                    value={step.channel}
                                    onChange={(e) => {
                                        const s = [...newSteps]
                                        s[i].channel = e.target.value as CadenceStep['channel']
                                        setNewSteps(s)
                                    }}
                                    className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none"
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Ligação</option>
                                    <option value="sms">SMS</option>
                                </select>

                                <input
                                    value={step.template}
                                    onChange={(e) => {
                                        const s = [...newSteps]
                                        s[i].template = e.target.value
                                        setNewSteps(s)
                                    }}
                                    placeholder="Mensagem template..."
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                                />

                                {newSteps.length > 1 && (
                                    <button onClick={() => setNewSteps(newSteps.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => setNewSteps([...newSteps, { day: (newSteps[newSteps.length - 1]?.day || 0) + 3, channel: 'whatsapp', template: '' }])}
                            className="text-xs text-[#FF4D00] hover:text-[#ff6a00] flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Adicionar Passo
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
                        <button onClick={createCadence} className="px-4 py-2 bg-[#FF4D00] hover:bg-[#ff6a00] text-white rounded-xl text-sm font-medium">Criar Cadência</button>
                    </div>
                </div>
            )}

            {/* Lista */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#FF4D00] animate-spin" />
                </div>
            ) : cadences.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">Nenhuma cadência criada ainda</p>
                    <p className="text-sm mt-1">Crie sua primeira automação de follow-up clicando no botão acima.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cadences.map((cad) => (
                        <div
                            key={cad.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-white font-semibold">{cad.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                            {cad.is_active ? 'Ativa' : 'Pausada'}
                                        </span>
                                    </div>
                                    {cad.description && <p className="text-white/50 text-sm mt-1">{cad.description}</p>}

                                    <div className="flex items-center gap-4 mt-3">
                                        {cad.steps.map((step, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
                                                <span className="bg-white/10 rounded-full w-5 h-5 flex items-center justify-center font-mono">{step.day}</span>
                                                {channelIcon(step.channel)}
                                                {i < cad.steps.length - 1 && <ChevronRight className="w-3 h-3 text-white/20" />}
                                            </div>
                                        ))}
                                        <span className="text-xs text-white/30">{cad.steps.length} passos</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleCadence(cad.id, cad.is_active)}
                                        className={`p-2 rounded-lg border transition-all ${cad.is_active ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                                        title={cad.is_active ? 'Pausar' : 'Ativar'}
                                    >
                                        {cad.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteCadence(cad.id)}
                                        className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        title="Excluir"
                                    >
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
