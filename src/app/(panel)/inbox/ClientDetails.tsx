'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from './InboxLayout'
import { X, User, Phone, MapPin, Tag, ChevronRight, ExternalLink, Plus, Save, AlignLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import TextareaAutosize from 'react-textarea-autosize'

interface ClientDetailsProps {
    conversation: Conversation
    onClose: () => void
}

type SysTag = { id: string; name: string; color: string }
type SysStage = { id: string; name: string; color: string; order: number }
type ActiveDeal = { id: string; stage_id: string }

type Customer = {
    id: string
    full_name: string
    phone: string
    email?: string
    notes?: string
    metadata?: Record<string, any>
    tags?: SysTag[]
    created_at: string
}

const statusMap: Record<string, string> = {
    'open': 'Aberto',
    'waiting_customer': 'Aguardando Cliente',
    'ai_handling': 'IA Atendendo',
    'waiting_human': 'Aguardando Humano',
    'human_handling': 'Atendimento Humano',
    'closed': 'Finalizado',
    'resolved': 'Resolvido'
}

export default function ClientDetails({ conversation, onClose }: ClientDetailsProps) {
    const supabase = createClient()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Kanban Stage Switcher
    const [allStages, setAllStages] = useState<SysStage[]>([])
    const [activeDeal, setActiveDeal] = useState<ActiveDeal | null>(null)
    const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false)
    const [isCreatingDeal, setIsCreatingDeal] = useState(false)
    const stagePopoverRef = useRef<HTMLDivElement>(null)

    // Extras para E3.S3
    const [allTags, setAllTags] = useState<SysTag[]>([])
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    const [notes, setNotes] = useState('')
    const [isSavingNotes, setIsSavingNotes] = useState(false)
    const [showNotesSaved, setShowNotesSaved] = useState(false)

    useEffect(() => {
        async function fetchCustomer() {
            setIsLoading(true)

            // Buscar Tags Ativas do Sistema
            const { data: tData } = await supabase.from('customer_tags').select('*').eq('is_active', true)
            if (tData) setAllTags(tData)

            // Buscar Estágios do Funil (Kanban)
            const { data: sData } = await supabase.from('deal_stages').select('*').order('order', { ascending: true })
            if (sData) setAllStages(sData)

            const fetchQuery = supabase
                .from('customers')
                .select(`
                    *,
                    customer_tag_links (
                        customer_tags ( id, name, color )
                    )
                `)

            let dbCustomer = null

            // Tenta buscar pelo ID se houver
            if (conversation.customer_id) {
                const { data } = await fetchQuery.eq('id', conversation.customer_id).single()
                if (data) dbCustomer = data
            } else {
                // Tenta buscar pelo telefone
                const { data } = await fetchQuery.eq('phone', conversation.phone).limit(1).single()
                if (data) {
                    dbCustomer = data
                    // Auto-linkar se encontrou (opcional)
                    await supabase.from('conversations').update({ customer_id: data.id }).eq('id', conversation.id)
                }
            }

            if (dbCustomer) {
                // Flatten array of tags returned by Supabase
                const mappedTags = (dbCustomer.customer_tag_links || [])
                    .map((link: any) => link.customer_tags)
                    .filter((tag: any) => tag !== null)

                setCustomer({
                    ...dbCustomer,
                    tags: mappedTags
                })
                setNotes(dbCustomer.notes || '')

                // Fetch latest active deal for the customer
                const { data: dData } = await supabase
                    .from('deals')
                    .select('id, stage_id, deal_stages(name)')
                    .eq('customer_id', dbCustomer.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()
                
                if (dData) setActiveDeal({ id: dData.id, stage_id: dData.stage_id })
            }

            setIsLoading(false)
        }

        fetchCustomer()
    }, [conversation.id, conversation.customer_id, conversation.phone, supabase])

    // Fechar popover de tags ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsTagDropdownOpen(false)
            }
            if (stagePopoverRef.current && !stagePopoverRef.current.contains(event.target as Node)) {
                setIsStageDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleStageChange = async (stage: SysStage) => {
        if (!customer) return
        setIsStageDropdownOpen(false)
        
        if (activeDeal) {
            // Atualiza deal existente
            setActiveDeal({ ...activeDeal, stage_id: stage.id })
            await supabase.from('deals').update({ stage_id: stage.id }).eq('id', activeDeal.id)
        } else {
            // Cria um novo deal
            setIsCreatingDeal(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: newDeal, error } = await supabase
                    .from('deals')
                    .insert({
                        customer_id: customer.id,
                        stage_id: stage.id,
                        user_id: user.id,
                        vehicle_id: null,
                        amount: 0,
                    })
                    .select('id, stage_id')
                    .single()
                
                if (!error && newDeal) {
                    setActiveDeal({ id: newDeal.id, stage_id: newDeal.stage_id })
                }
            }
            setIsCreatingDeal(false)
        }
    }

    const handleSaveNotes = async () => {
        if (!customer) return
        setIsSavingNotes(true)
        const { error } = await supabase.from('customers').update({ notes }).eq('id', customer.id)
        setIsSavingNotes(false)
        if (!error) {
            setShowNotesSaved(true)
            setTimeout(() => setShowNotesSaved(false), 2000)
            setCustomer(prev => prev ? { ...prev, notes } : null)
        }
    }

    const toggleTag = async (tag: SysTag) => {
        if (!customer) return
        const hasTag = customer.tags?.find(t => t.id === tag.id)

        if (hasTag) {
            // Remove Otimista
            setCustomer(prev => {
                if (!prev) return prev
                return { ...prev, tags: prev.tags?.filter(t => t.id !== tag.id) }
            })
            await supabase.from('customer_tag_links').delete().match({ customer_id: customer.id, tag_id: tag.id })
        } else {
            // Adiciona Otimista
            setCustomer(prev => {
                if (!prev) return prev
                return { ...prev, tags: [...(prev.tags || []), tag] }
            })
            await supabase.from('customer_tag_links').insert({ customer_id: customer.id, tag_id: tag.id })
        }
        setIsTagDropdownOpen(false)
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] w-full relative">
            {/* Header */}
            <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Informações</h3>
                <button onClick={onClose} className="p-2 -mr-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto hidden-scrollbar p-6">

                {/* Avatar & Nome */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/40 mb-4 ring-1 ring-white/10 shadow-xl overflow-hidden relative">
                        {(() => {
                            const profileUrl = customer?.metadata?.profilePictureUrl || conversation.metadata?.profilePictureUrl || conversation.customer?.metadata?.profilePictureUrl;
                            return profileUrl ? (
                                <img src={profileUrl} alt={customer?.full_name || 'Cliente'} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12" />
                            );
                        })()}
                    </div>
                    <h2 className="text-xl font-bold text-white text-center">
                        {customer?.full_name || 'Cliente Desconhecido'}
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                        +{conversation.phone}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/20"></div>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* CRM Shortcut */}
                        {customer ? (
                            <Link
                                href={`/clientes/${customer.id}`}
                                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF4D00]/50 transition-all font-medium text-sm text-white shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#FF4D00]/20 text-[#FF4D00] flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    Acessar CRM do Cliente
                                </div>
                                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#FF4D00] transition-colors" />
                            </Link>
                        ) : (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 border-dashed flex flex-col items-center text-center gap-2">
                                <p className="text-sm text-white/50">Este número não está associado a nenhum cliente no CRM.</p>
                                <button className="text-[#FF4D00] text-sm hover:underline font-medium mt-1">
                                    Criar novo cliente
                                </button>
                            </div>
                        )}

                        {/* Informações de Contato */}
                        {customer && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Contato</h4>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-white/60" />
                                    </div>
                                    <span className="text-white/80">+{customer.phone}</span>
                                </div>

                                {customer.email && (
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <span className="text-white/60 font-serif">@</span>
                                        </div>
                                        <span className="text-white/80">{customer.email}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sistema de Tags */}
                        {customer && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Gestão de Tags
                                </h4>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {customer.tags?.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2.5 py-1 rounded-md text-white text-xs font-medium shadow-sm ring-1 ring-white/5 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1.5"
                                            style={{ backgroundColor: tag.color + '40', color: tag.color, borderColor: tag.color + '50' }}
                                            onClick={() => toggleTag(tag)}
                                            title="Clique para remover"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                            {tag.name}
                                        </span>
                                    ))}

                                    {/* Adicionar Tag + Dropdown */}
                                    <div className="relative" ref={popoverRef}>
                                        <button
                                            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 border-dashed text-xs items-center justify-center flex transition-colors shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Tag
                                        </button>

                                        {isTagDropdownOpen && (
                                            <div className="absolute top-10 left-0 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 grid gap-1">
                                                {allTags.filter(t => !customer.tags?.find(ct => ct.id === t.id)).length === 0 ? (
                                                    <div className="text-xs text-center text-white/40 p-2">Nenhuma tag disponível para adicionar.</div>
                                                ) : (
                                                    allTags.filter(t => !customer.tags?.find(ct => ct.id === t.id)).map(tag => (
                                                        <button
                                                            key={tag.id}
                                                            onClick={() => toggleTag(tag)}
                                                            className="flex text-left items-center w-full px-2 py-1.5 hover:bg-white/5 rounded-md transition-colors"
                                                        >
                                                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                                                            <span className="text-xs text-white/80">{tag.name}</span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sistema de Vendas (Kanban) */}
                        {customer && allStages.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-white/10" ref={stagePopoverRef}>
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Gestão de Vendas
                                </h4>
                                <div className="relative w-full">
                                    <button
                                        onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                                        disabled={isCreatingDeal}
                                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all text-sm text-white/80"
                                    >
                                        <div className="flex items-center gap-3">
                                            {activeDeal ? (
                                                <>
                                                    <span 
                                                        className="w-2.5 h-2.5 rounded-full" 
                                                        style={{ backgroundColor: allStages.find(s => s.id === activeDeal.stage_id)?.color || '#555' }} 
                                                    />
                                                    <span className="font-medium">
                                                        {allStages.find(s => s.id === activeDeal.stage_id)?.name || 'Desconhecido'}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                        {isCreatingDeal ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus className="w-3 h-3 text-white/60" />}
                                                    </div>
                                                    <span className="text-white/60">Abrir nova oportunidade (Lead)</span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${isStageDropdownOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isStageDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                                            <div className="max-h-60 overflow-y-auto hidden-scrollbar">
                                                {allStages.map(stage => (
                                                    <button
                                                        key={stage.id}
                                                        onClick={() => handleStageChange(stage)}
                                                        className="flex items-center justify-between w-full p-2.5 hover:bg-white/5 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                                                            <span className="text-sm text-white/80 font-medium">{stage.name}</span>
                                                        </div>
                                                        {activeDeal?.stage_id === stage.id && (
                                                            <span className="text-xs text-[#25D366] font-mono">Ativo</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notas Internas Ocultas (Só Equipe) */}
                        {customer && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <AlignLeft className="w-3 h-3" /> Notas Internas
                                    </h4>
                                    {showNotesSaved && (
                                        <span className="text-green-400 text-[10px] uppercase font-bold tracking-widest animate-in fade-in zoom-in">
                                            ✔ Salvo
                                        </span>
                                    )}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl focus-within:border-[#FF4D00]/50 focus-within:ring-1 focus-within:ring-[#FF4D00]/50 transition-all relative overflow-hidden">
                                    <TextareaAutosize
                                        minRows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Adicione anotações ocultas sobre essa conversa/cliente. Isso não será enviado pelo WhatsApp."
                                        className="w-full bg-transparent text-sm text-white/80 p-3 outline-none resize-none placeholder:text-white/20 hidden-scrollbar"
                                    />
                                    {customer.notes !== notes && (
                                        <div className="absolute bottom-2 right-2">
                                            <button
                                                onClick={handleSaveNotes}
                                                disabled={isSavingNotes}
                                                className="bg-[#FF4D00] text-white p-1.5 rounded-lg hover:bg-[#FF4D00]/80 transition-colors shadow flex items-center justify-center disabled:opacity-50"
                                                title="Salvar Notas"
                                            >
                                                {isSavingNotes ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-white/40 leading-relaxed">
                                    Estas anotações são globais do cliente e ficam visíveis apenas para a equipe AutoCar, auxiliando outros atendentes no contexto da venda.
                                </p>
                            </div>
                        )}

                        {/* Metadata Conversa */}
                        <div className="pt-4 border-t border-white/10 mt-6 space-y-3 pb-8">
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Info. Sessão Atual</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/50">Canal de Origem</span>
                                <span className="text-white font-medium capitalize bg-[#25D366]/20 text-[#25D366] px-2.5 py-0.5 rounded-full text-[10px] tracking-wider border border-[#25D366]/20 shadow-sm">
                                    {conversation.channel}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/50">Status do Chat</span>
                                <span className="text-white">
                                    {statusMap[conversation.status] || conversation.status.replace('_', ' ')}
                                </span>
                            </div>
                            {customer?.created_at && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Lead Capturado em</span>
                                    <span className="text-white font-mono text-xs text-white/80">
                                        {format(new Date(customer.created_at), "dd MMM yy", { locale: ptBR })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

