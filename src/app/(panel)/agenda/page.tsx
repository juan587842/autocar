export const revalidate = 0 // Força renderização dinâmica ou revalidate 0

import { createClient } from '@/lib/supabase/server'
import AgendaClient from './AgendaClient'

export default async function AgendaPage() {
    const supabase = await createClient()

    // Buca todos os agendamentos do mês vigente (simplificado, pega todos por enquanto)
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            customers(full_name, phone),
            vehicles(brand, model),
            users(full_name)
        `)
        .gte('scheduled_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) // Apenas agendamentos a partir do mês atual
        .order('scheduled_at', { ascending: true })

    return (
        <AgendaClient initialAppointments={appointments || []} />
    )
}
