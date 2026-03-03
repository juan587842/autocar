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
        .select('id, scheduled_at, duration_min, status, notes, summary')
        .eq('customer_id', id)

    const { data: messages } = await supabase
        .from('conversations')
        .select('id, messages(id, content, sender_type, created_at)')
        .eq('customer_id', id)

    // Agrupando e ordenando histórico (Mock Adapter)
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
                historyEvents.push({
                    id: `msg-${msg.id}`,
                    type: 'lead',
                    date: new Date(msg.created_at).toLocaleString('pt-BR'),
                    content: `Mensagem (${msg.sender_type}): ${msg.content || 'Mídia'}`,
                    author: msg.sender_type === 'agent' ? 'Vendedor' : 'Cliente',
                    rawDate: new Date(msg.created_at).getTime()
                })
            })
        })
    }

    historyEvents.sort((a, b) => b.rawDate - a.rawDate)

    return <ProfileClient customer={customer} historyEvents={historyEvents} />
}
