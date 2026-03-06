'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from './InboxLayout'
import { ChevronLeft, Send, Bot, User, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sendMessage } from './actions'

interface ChatWindowProps {
    conversation: Conversation
    currentUser: { id: string }
    onBack: () => void
    onToggleDetails: () => void
    showDetails: boolean
}

type Message = {
    id: string
    content: string
    sender_type: 'customer' | 'ai' | 'agent' | 'seller'
    created_at: string
    status: string
}

export default function ChatWindow({ conversation, currentUser, onBack, onToggleDetails, showDetails }: ChatWindowProps) {
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [inputText, setInputText] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [localIsAiActive, setLocalIsAiActive] = useState(conversation.is_ai_active)
    const [localStatus, setLocalStatus] = useState(conversation.status)
    const [presentUsers, setPresentUsers] = useState<string[]>([])

    // Sincroniza o estado do layout global (Realtime) com as travas otimistas locais
    useEffect(() => {
        setLocalIsAiActive(conversation.is_ai_active)
        setLocalStatus(conversation.status)
    }, [conversation.is_ai_active, conversation.status])

    const isAiEnabled = localIsAiActive
    const isWaiting = localStatus === 'waiting_human'

    // Presence Realtime Subscription
    useEffect(() => {
        let isMounted = true
        const channelName = `presence:conv:${conversation.id}`
        const channel = supabase.channel(channelName)

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState<{ userId: string, fullName: string }>()
                const viewers: string[] = []
                for (const key in state) {
                    for (const presence of state[key]) {
                        if (presence.userId !== currentUser.id) {
                            if (presence.fullName && !viewers.includes(presence.fullName)) {
                                viewers.push(presence.fullName)
                            }
                        }
                    }
                }
                if (isMounted) setPresentUsers(viewers)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Fetch full_name to broadcast
                    const { data: userData } = await supabase.from('users').select('full_name').eq('id', currentUser.id).single()
                    await channel.track({
                        userId: currentUser.id,
                        fullName: (userData?.full_name?.split(' ')[0]) || 'Membro da equipe',
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [conversation.id, currentUser.id, supabase])

    // Buscar mensagens e inscrever realtime
    useEffect(() => {
        let isMounted = true

        async function fetchMessages() {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true })

            if (data && isMounted) {
                setMessages(data as Message[])
                scrollToBottom()
            }
            setIsLoading(false)
        }

        fetchMessages()

        // Realtime Subscription para novas mensagens na conversa atual
        const channel = supabase
            .channel(`public:messages:conv:${conversation.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages((prev) => {
                        // Evita duplicação caso a mensagem já tenha sido adicionada otimisticamente
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    scrollToBottom()
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [conversation.id, supabase])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || isSending) return

        const content = inputText.trim()
        setInputText('')
        setIsSending(true)

        // Adicionar mensagem localmente otimista (opcional, ou deixar o DB fazer e voltar via Realtime)
        // Para UX melhor, vamos add otimisticamente com fake ID e dps atualiza
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            content,
            sender_type: 'seller',
            created_at: new Date().toISOString(),
            status: 'sending'
        }
        setMessages(prev => [...prev, optimisticMsg])
        scrollToBottom()

        // Optimistic UX Update da trava de IA ao assumir o chat enviando algo manual
        setLocalIsAiActive(false)
        setLocalStatus('human_handling')

        const res = await sendMessage(conversation.id, content)

        if (!res.success) {
            alert(res.message || 'Erro ao enviar mensagem')
            // Remove a mensagem otimista em caso de erro grave
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
        }

        setIsSending(false)
    }

    const handleToggleAI = async () => {
        // Se estava "Aguardando humano", ao clicar o humano assume (IA desliga/continua desligada)
        // Se IA tava ativa, desliga. Se estava desligada, liga.
        const newStatus = isWaiting ? false : !isAiEnabled
        const newSystemStatus = newStatus ? 'ai_handling' : 'human_handling'

        // Apply Optimistic update para UX imediata
        setLocalIsAiActive(newStatus)
        setLocalStatus(newSystemStatus)

        await supabase
            .from('conversations')
            .update({
                is_ai_active: newStatus,
                status: newSystemStatus
            })
            .eq('id', conversation.id)
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl z-10 relative shadow-sm">

                {/* Esquerda: Back & Info */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80 overflow-hidden">
                            {conversation.customer?.metadata?.profilePictureUrl || conversation.metadata?.profilePictureUrl ? (
                                <img
                                    src={conversation.customer?.metadata?.profilePictureUrl || conversation.metadata?.profilePictureUrl}
                                    alt={conversation.customer?.full_name || conversation.metadata?.pushName || `+${conversation.phone}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-white whitespace-nowrap">
                                {conversation.customer?.full_name || conversation.metadata?.pushName || `+${conversation.phone}`}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                {isWaiting ? (
                                    <span className="text-red-400 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Aguardando Humano
                                    </span>
                                ) : isAiEnabled ? (
                                    <span className="text-blue-400 font-medium flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> IA Atendendo
                                    </span>
                                ) : (
                                    <span className="text-green-400 font-medium flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Atendimento Humano
                                    </span>
                                )}

                                {presentUsers.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white flex items-center gap-1.5 animate-in fade-in transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="opacity-60">{presentUsers.join(', ')} online</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direita: Ações */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleAI}
                        className={`
                            hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${isWaiting ? 'bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/20 hover:bg-[#FF4D00]/20' :
                                isAiEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {isWaiting ? 'Assumir Atendimento' : (isAiEnabled ? 'Pausar IA' : 'Ativar IA')}
                    </button>

                    <button
                        onClick={onToggleDetails}
                        className={`p-2 rounded-full transition-colors ${showDetails ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                        title="Ver Perfil"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 hidden-scrollbar scroll-smooth">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-white/40 text-sm">
                        Nenhuma mensagem encontrada.
                    </div>
                ) : (
                    <>
                        {conversation.metadata?.transfer_summary && (
                            <div className="flex justify-center mb-6 mt-2 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="w-[90%] sm:w-[80%] lg:w-[70%] bg-[#FF4D00]/5 border border-[#FF4D00]/20 rounded-2xl p-4 backdrop-blur-md shadow-lg">
                                    <div className="flex items-center gap-2 mb-2 text-[#FF4D00]">
                                        <AlertCircle className="w-5 h-5" />
                                        <h4 className="text-xs font-bold uppercase tracking-wide">Resumo da Transferência (IA)</h4>
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                                        {conversation.metadata.transfer_summary}
                                    </p>
                                    {conversation.metadata.transfer_reason && (
                                        <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-[#FF4D00]/10 text-[#FF4D00] text-[10px] uppercase tracking-wider font-bold border border-[#FF4D00]/20">
                                            Motivo: {conversation.metadata.transfer_reason.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const isSelf = msg.sender_type === 'ai' || msg.sender_type === 'agent' || msg.sender_type === 'seller'
                            const isAi = msg.sender_type === 'ai' || msg.sender_type === 'agent'

                            // Data header (show only when date changes)
                            const msgDate = new Date(msg.created_at)
                            const prevMsg = messages[idx - 1]
                            const prevDate = prevMsg ? new Date(prevMsg.created_at) : null
                            const showDateHeader = !prevDate || msgDate.toDateString() !== prevDate.toDateString()

                            return (
                                <div key={msg.id} className="flex flex-col">
                                    {showDateHeader && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider bg-white/5 px-3 py-1 rounded-full backdrop-blur-md">
                                                {format(msgDate, "dd 'de' MMMM", { locale: ptBR })}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'} mb-1`}>
                                        <div className={`
                                        max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 relative group
                                        ${isSelf
                                                ? 'bg-[#FF4D00]/10 text-white border border-[#FF4D00]/20 rounded-tr-sm'
                                                : 'bg-white/5 text-white border border-white/10 rounded-tl-sm'
                                            }
                                        ${msg.status === 'sending' ? 'opacity-50' : ''}
                                    `}>
                                            {/* Badge IA */}
                                            {isAi && (
                                                <div className="absolute -left-3 -top-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 p-1 rounded-full shadow-lg backdrop-blur-xl">
                                                    <Bot className="w-3 h-3" />
                                                </div>
                                            )}

                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                                            <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${isSelf ? 'text-[#FF4D00]/60' : 'text-white/40'}`}>
                                                {format(msgDate, 'HH:mm')}
                                                {isSelf && msg.sender_type === 'seller' && <User className="w-3 h-3 ml-1 opacity-50" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}
                <div ref={messagesEndRef} className="h-4" /> {/* Div âncora */}
            </div>

            {/* Input Form */}
            <div className="shrink-0 p-3 sm:p-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/10">
                {isAiEnabled && (
                    <div className="mb-2 text-center text-xs text-white/40">
                        A IA está respondendo ativamente. Enviar uma mensagem <strong className="text-white/60">pausará</strong> a IA automaticamente.
                    </div>
                )}

                <form
                    onSubmit={handleSend}
                    className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#FF4D00]/50 focus-within:ring-1 focus-within:ring-[#FF4D00]/50 transition-all"
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend(e as any)
                            }
                        }}
                        placeholder="Digite sua mensagem (Enter para enviar)..."
                        className="flex-1 bg-transparent text-[#e1e1e1] placeholder-white/30 px-3 py-2.5 min-h-[44px] max-h-[120px] resize-none focus:outline-none text-sm hidden-scrollbar"
                        rows={1}
                        style={{ height: inputText ? 'auto' : '44px' }}
                    />

                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="shrink-0 w-11 h-11 bg-[#FF4D00] hover:bg-[#FF4D00]/80 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl flex items-center justify-center transition-colors"
                    >
                        {isSending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-1" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
