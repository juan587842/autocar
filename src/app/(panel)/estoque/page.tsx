import { createClient } from '@/lib/supabase/server'
import InventoryClient from './InventoryClient'

export default async function InventoryPage() {
    const supabase = await createClient()

    // Fetch vehicles from Supabase with photos included
    const { data: vehiclesData, error } = await supabase
        .from('vehicles')
        .select('*, vehicle_photos(url, is_cover, display_order)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    // Tratativa caso a tabela não exista ou erro
    const vehiclesList = vehiclesData || []

    return (
        <InventoryClient initialVehicles={vehiclesList} />
    )
}
