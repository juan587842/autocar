import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    let isSeller = false
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        isSeller = userData?.role === 'seller'
    }

    // Query robusta para buscar os clientes e as tags associadas.
    let query = supabase.from('customers').select(`
        *,
        customer_tag_links (
            customer_tags (
                name,
                color
            )
        )
    `).order('created_at', { ascending: false })

    if (isSeller && user) {
        query = query.eq('assigned_to', user.id)
    }

    const { data, error } = await query

    const customers = data || []

    return (
        <CustomersClient initialCustomers={customers} />
    )
}
