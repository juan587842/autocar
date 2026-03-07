import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    // Busca dados do Cliente e Tags
    const { data: customer, error: cError } = await supabase
        .from('customers')
        .select(`
            *,
            customer_tag_links(
                customer_tags(*)
            )
        `)
        .eq('id', id)
        .single()

    if (cError || !customer) {
        redirect('/clientes')
    }

    // Busca Histórico: Agendamentos e Mensagens para montar a Timeline
    const { data: appointments } = await supabase
        .from('appointments')
        .select('id, scheduled_at, duration_min, status, notes')
        .eq('customer_id', id)

    const { data: messages } = await supabase
        .from('conversations')
        .select('id, messages(id, content, sender_type, created_at)')
        .eq('customer_id', id)

    // Agrupando e ordenando histórico (Timeline Adapter)
    const historyEvents: any[] = []

    if (appointments) {
        appointments.forEach((app: any) => {
            historyEvents.push({
                id: `app-${app.id}`,
                type: 'visit',
                date: new Date(app.scheduled_at).toLocaleString('pt-BR'),
                content: `Agendamento: ${app.notes || 'Visita agendada'} (${app.status})`,
                author: 'Sistema',
                rawDate: new Date(app.scheduled_at).getTime()
            })
        })
    }

    if (messages) {
        messages.forEach((conv: any) => {
            conv.messages?.forEach((msg: any) => {
                // Apenas mostrar mensagens do cliente e do agente/vendedor (remover duplicatas AI silenciosas)
                if (!msg.content || msg.content === '[Mídia]') return

                const senderLabel = msg.sender_type === 'customer'
                    ? 'Cliente'
                    : msg.sender_type === 'ai' || msg.sender_type === 'agent'
                        ? 'Agente IA'
                        : 'Vendedor'

                historyEvents.push({
                    id: `msg-${msg.id}`,
                    type: msg.sender_type === 'customer' ? 'lead' : 'note',
                    date: new Date(msg.created_at).toLocaleString('pt-BR'),
                    content: `${msg.content.slice(0, 120)}${msg.content.length > 120 ? '...' : ''}`,
                    author: senderLabel,
                    rawDate: new Date(msg.created_at).getTime()
                })
            })
        })
    }

    historyEvents.sort((a, b) => b.rawDate - a.rawDate)

    return <ProfileClient customer={customer} historyEvents={historyEvents} />
}
