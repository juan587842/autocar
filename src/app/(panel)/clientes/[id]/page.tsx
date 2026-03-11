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

    // 1. Busca Veículos Comprados pelo Cliente
    const { data: purchasedVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('buyer_id', id)
        .order('sold_at', { ascending: false })

    // 2. Busca Ofertas realizadas por este Cliente
    const { data: offersMade } = await supabase
        .from('vehicle_offers')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })

    // Agrupando e ordenando histórico (Timeline Adapter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historyEvents: any[] = []

    if (appointments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appointments.forEach((app: any) => {
            const statusMap: Record<string, string> = {
                scheduled: 'Agendado',
                confirmed: 'Confirmado',
                cancelled: 'Cancelado',
                completed: 'Concluído',
                no_show: 'Não Compareceu',
            }
            const translatedStatus = statusMap[app.status] || app.status

            historyEvents.push({
                id: `app-${app.id}`,
                type: 'visit',
                date: new Date(app.scheduled_at).toLocaleString('pt-BR'),
                content: `Agendamento: ${app.notes || 'Visita agendada'} (${translatedStatus})`,
                author: 'Sistema',
                rawDate: new Date(app.scheduled_at).getTime()
            })
        })
    }

    if (interests) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    return (
        <ProfileClient 
            customer={customer} 
            historyEvents={historyEvents} 
            purchasedVehicles={purchasedVehicles || []} 
            offersMade={offersMade || []} 
        />
    )
}
