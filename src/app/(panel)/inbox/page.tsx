import { Suspense } from 'react'
import InboxLayout from './InboxLayout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Inbox | AutoCar',
}

export default async function InboxPage() {
    // 1. Verificar Autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Buscar conversas iniciais (Server-Side)
    // Para renderização inicial super rápida. O Realtime fará o resto no cliente.
    const { data: initialConversations } = await supabase
        .from('conversations')
        .select(`
            id,
            channel,
            phone,
            status,
            is_ai_active,
            unread_count,
            subject,
            last_message_at,
            customer_id,
            metadata
        `)
        .order('last_message_at', { ascending: false })
        .limit(30) // Trazemos as 30 mais recentes

    // O Cliente lida com o supabaseBrowserClient
    return (
        <div className="flex h-[calc(100vh-64px)] lg:h-screen lg:pt-0 pt-16 flex-col w-full bg-[#0A0A0A] overflow-hidden">
            <Suspense fallback={
                <div className="flex items-center justify-center p-8 text-white/50 w-full h-full">
                    Carregando Inbox...
                </div>
            }>
                <InboxLayout
                    initialConversations={initialConversations || []}
                    currentUser={{ id: user.id }}
                />
            </Suspense>
        </div>
    )
}
