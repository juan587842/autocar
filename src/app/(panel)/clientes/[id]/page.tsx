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

    const { data: interests } = await supabase
        .from('customer_interests')
        .select(`
            id,
            created_at,
            notes,
            vehicles (
                brand,
                model,
                year_fab,
                year_model
            )
        `)
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

    if (interests) {
        interests.forEach((interest: any) => {
            const v = interest.vehicles
            const vehicleInfo = v 
                ? `${v.brand} ${v.model} ${v.year_fab}/${v.year_model}`
                : 'Veículo não informado'
            
            historyEvents.push({
                id: `int-${interest.id}`,
                type: 'lead',
                date: new Date(interest.created_at).toLocaleString('pt-BR'),
                content: `Interesse: ${vehicleInfo}${interest.notes ? ` - ${interest.notes}` : ''}`,
                author: 'Sistema',
                rawDate: new Date(interest.created_at).getTime()
            })
        })
    }

    historyEvents.sort((a, b) => b.rawDate - a.rawDate)

    return <ProfileClient customer={customer} historyEvents={historyEvents} />
}
