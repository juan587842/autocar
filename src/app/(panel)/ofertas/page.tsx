import { createClient } from '@/lib/supabase/server'
import OffersClient from './OffersClient'

export default async function OffersPage() {
    const supabase = await createClient()

    // Query robusta para buscar as ofertas.
    const { data, error } = await supabase
        .from('vehicle_offers')
        .select('*')
        .order('created_at', { ascending: false })

    const offers = data || []

    return (
        <OffersClient initialOffers={offers} />
    )
}
