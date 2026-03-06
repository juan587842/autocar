'use client'

import { useState } from 'react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import ClientDetails from './ClientDetails'

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

            {/* Coluna 2: Chat Window */}
            <div className={`
                flex-1 h-full flex flex-col bg-[#0f0f0f] relative
                ${viewMode === 'list' ? 'hidden lg:flex' : 'flex'}
            `}>
                {activeConversationId ? (
                    <ChatWindow
                        conversation={activeConversation!}
                        currentUser={currentUser}
                        onBack={() => setActiveConversationId(null)}
                        onToggleDetails={() => setShowDetails(!showDetails)}
                        showDetails={showDetails}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/30 hidden lg:flex">
                        <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-white/50">Selecione uma conversa</p>
                        <p className="text-sm">Para visualizar as mensagens e responder</p>
                    </div>
                )}
            </div>

            {/* Coluna 3: Client Details (Drawer no mobile/tablet/lg, Fixa no desktop XL) */}
            {activeConversation && (
                <div className={`
                    absolute xl:static inset-y-0 right-0 z-50 
                    h-full bg-[#0A0A0A]/95 backdrop-blur-2xl xl:bg-transparent xl:backdrop-blur-none
                    transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden
                    ${showDetails ? 'translate-x-0 w-full sm:w-[380px]' : 'translate-x-full w-full sm:w-[380px] xl:translate-x-0 xl:w-0'}
                `}>
                    <div className="w-full sm:w-[380px] h-full shrink-0 border-l border-white/10">
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
