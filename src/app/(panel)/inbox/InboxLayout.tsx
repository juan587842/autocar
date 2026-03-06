'use client'

import { useState } from 'react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import ClientDetails from './ClientDetails'
import { MessageSquare } from 'lucide-react'

export type Conversation = {
    id: string
    channel: string
    phone: string
    status: string
    is_ai_active: boolean
    unread_count: number
    subject: string | null
    last_message_at: string
    customer_id?: string
    metadata?: Record<string, any>
    customer?: any
}

interface InboxLayoutProps {
    initialConversations: Conversation[]
    currentUser: { id: string }
}

export default function InboxLayout({ initialConversations, currentUser }: InboxLayoutProps) {
    // Estado global do Inbox no client
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)

    // Conversa ativa atual
    const activeConversation = conversations.find(c => c.id === activeConversationId)

    // Logica Mobile (se tem conversa ativa, esconde a lista e mostra o chat)
    const viewMode = activeConversationId ? 'chat' : 'list'

    return (
        <div className="flex w-full h-full relative overflow-hidden bg-[#0A0A0A]">

            {/* Coluna 1: Lista de Conversas */}
            <div className={`
                w-full lg:w-[320px] xl:w-[380px] h-full border-r border-white/10 flex flex-col
                ${viewMode === 'chat' ? 'hidden lg:flex' : 'flex'}
            `}>
                <ConversationList
                    conversations={conversations}
                    setConversations={setConversations}
                    activeConversationId={activeConversationId}
                    setActiveConversationId={setActiveConversationId}
                />
            </div>

            {/* Colunas do Chat & Detalhes (Container Duplo) */}
            <div className={`flex-1 flex h-full ${viewMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
                {/* Coluna 2: Chat Window */}
                <div className="flex-1 h-full flex flex-col bg-[#0f0f0f] relative min-w-[320px]">
                    {activeConversationId ? (
                        <ChatWindow
                            conversation={activeConversation!}
                            currentUser={currentUser}
                            onBack={() => setActiveConversationId(null)}
                            onToggleDetails={() => setShowDetails(!showDetails)}
                            showDetails={showDetails}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-white/30 hidden lg:flex bg-[#0A0A0A]">
                            <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10">
                                <MessageSquare className="w-12 h-12" />
                            </div>
                            <p className="font-medium text-lg">Selecione uma conversa para iniciar</p>
                        </div>
                    )}
                </div>

                {/* Coluna 3: Client Details Desktop (Apenas se showDetails && ativa) */}
                {activeConversationId && showDetails && (
                    <div className="hidden xl:block w-[350px] 2xl:w-[400px] shrink-0 border-l border-white/10 bg-[#0A0A0A] h-full transition-all">
                        <ClientDetails
                            conversation={activeConversation!}
                            onClose={() => setShowDetails(false)}
                        />
                    </div>
                )}
            </div>

            {/* Coluna 3: Client Details (Drawer no mobile/tablet/lg) */}
            {activeConversation && showDetails && (
                <div className="absolute xl:hidden inset-y-0 right-0 z-50 h-full bg-[#0A0A0A]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden w-full sm:w-[380px] border-l border-white/10 animate-slide-left shadow-2xl">
                    <div className="w-full h-full shrink-0">
                        <ClientDetails
                            conversation={activeConversation}
                            onClose={() => setShowDetails(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
