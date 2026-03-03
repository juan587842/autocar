'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from './InboxLayout'
import { Bot, User, MessageSquare, Search, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConversationListProps {
    conversations: Conversation[]
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
    activeConversationId: string | null
    setActiveConversationId: (id: string | null) => void
}

export default function ConversationList({
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId
}: ConversationListProps) {
    const supabase = createClient()
    const [searchQuery, setSearchQuery] = useState('')

    // Supabase Realtime para tabela `conversations`
    useEffect(() => {
        const channel = supabase
            .channel('public:conversations:changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'conversations' },
                (payload) => {
                    setConversations((prev) => {
                        const newConv = payload.new as Conversation
                        // Adicionar no topo
                        return [newConv, ...prev.filter(c => c.id !== newConv.id)]
                    })
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'conversations' },
                (payload) => {
                    setConversations((prev) => {
                        const updatedConv = payload.new as Conversation
                        // Atualizar a existente na lista
                        const updatedList = prev.map(c => c.id === updatedConv.id ? updatedConv : c)
                        // Reordenar se last_message_at mudou
                        return updatedList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, setConversations])

    const filteredConversations = conversations.filter(c =>
        c.phone.includes(searchQuery) ||
        (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Formatar timestamp
    const formatTime = (isoString?: string) => {
        if (!isoString) return ''
        return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: ptBR })
    }

    // Selecionar conversa zera unread_count (otimista + db update)
    const handleSelect = async (convId: string) => {
        setActiveConversationId(convId)

        const conv = conversations.find(c => c.id === convId)
        if (conv && conv.unread_count > 0) {
            // update optimista
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c))
            // db update
            await supabase.from('conversations').update({ unread_count: 0 }).eq('id', convId)
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] w-full border-r border-white/5">
            {/* Header / Search */}
            <div className="p-4 border-b border-white/10 shrink-0">
                <h2 className="text-lg font-semibold text-white mb-4">Mensagens</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Buscar conversa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]/50 transition-all"
                    />
                </div>
            </div>

            {/* Lista Scrollável */}
            <div className="flex-1 overflow-y-auto px-2 py-2 hidden-scrollbar space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-sm">
                        Nenhuma conversa encontrada.
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isActive = activeConversationId === conv.id
                        const isAiActive = conv.is_ai_active
                        const isWaiting = conv.status === 'waiting_human'

                        return (
                            <button
                                key={conv.id}
                                onClick={() => handleSelect(conv.id)}
                                className={`
                                    w-full text-left p-3 rounded-xl transition-all flex gap-3 relative
                                    ${isActive
                                        ? 'bg-[#FF4D00]/10 border border-[#FF4D00]/20'
                                        : 'hover:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-white/5 text-white/60'}`}>
                                        <User className="h-6 w-6" />
                                    </div>
                                    {/* Platform / Status indicator */}
                                    <div className="absolute -bottom-1 -right-1 bg-[#25D366] rounded-full p-1 border-2 border-[#0A0A0A]">
                                        <MessageSquare className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white text-sm truncate">
                                                +{conv.phone}
                                            </span>
                                            {/* AI Badge ou Waiting Badge */}
                                            {isWaiting ? (
                                                <span title="Aguardando Humano" className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-500 shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                </span>
                                            ) : isAiActive ? (
                                                <span title="IA Respondendo" className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 shrink-0">
                                                    <Bot className="w-3 h-3" />
                                                </span>
                                            ) : (
                                                <span title="Atendimento Humano" className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-500 shrink-0">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-white/40 shrink-0 tabular-nums">
                                            {formatTime(conv.last_message_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs truncate flex-1 ${conv.unread_count > 0 && !isActive ? 'text-white font-medium' : 'text-white/50'}`}>
                                            {conv.subject || 'Nova conversa iniciada'}
                                        </p>

                                        {/* Unread Badge */}
                                        {conv.unread_count > 0 && !isActive && (
                                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF4D00] text-white text-[10px] font-bold">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}
