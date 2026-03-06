import { Suspense } from 'react'
import InboxLayout from './InboxLayout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Inbox | AutoCar',
}

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
    // 1. Verificar Autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: initialConversations, error: convError } = await supabase
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
            metadata,
            customer:customers(full_name, metadata)
        `)
        .order('last_message_at', { ascending: false })
        .limit(30) // Trazemos as 30 mais recentes

    if (convError) {
        console.error('[Inbox] ERRO FATAL AO BUSCAR CONVERSAS NO SERVER:', convError)
    } else {
        console.log(`[Inbox] Server Loaded ${initialConversations?.length} conversations`)
    }

    // O Cliente lida com o supabaseBrowserClient
    return (
        <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 flex flex-col bg-[#0A0A0A] overflow-hidden z-20">
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
