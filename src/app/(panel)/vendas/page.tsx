import { createClient } from '@/lib/supabase/server'
import VendasClient from './VendasClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VendasPage() {
    const supabase = await createClient()

    // 1. Fetch deal stages
    const { data: stages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('order', { ascending: true })

    // 2. Fetch deals with customers and vehicles
    const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
            *,
            customers (full_name),
            vehicles (brand, model, version, year)
        `)
        .order('created_at', { ascending: false })

    // Fallbacks Se a Migração ainda não rodou:
    const finalStages = (!stagesError && stages && stages.length > 0) ? stages : [
        { id: '1', name: 'Lead Novo', color: '#3b82f6', order: 1 },
        { id: '2', name: 'Em Atendimento', color: '#eab308', order: 2 },
        { id: '3', name: 'Negociação', color: '#f97316', order: 3 },
        { id: '4', name: 'Aguardando Fin', color: '#a855f7', order: 4 },
        { id: '5', name: 'Ganha', color: '#22c55e', order: 5 },
        { id: 'f', name: 'Perdida', color: '#ef4444', order: 6 },
    ]

    const finalDeals = !dealsError && deals ? deals : []

    return <VendasClient initialStages={finalStages} initialDeals={finalDeals} />
}
