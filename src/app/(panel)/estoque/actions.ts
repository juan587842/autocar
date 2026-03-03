'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVehicle(data: any) {
    const supabase = await createClient()

    // Geração automática do slug: marca-modelo-ano
    const baseSlug = `${data.brand}-${data.model}-${data.year_fab}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    // Lida com duplicidade (adiciona timestamp no final se precisar)
    const { data: existing } = await supabase.from('vehicles').select('id').eq('slug', baseSlug).single()
    const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const { data: vehicle, error } = await supabase.from('vehicles').insert([
        {
            ...data,
            slug: finalSlug,
            status: data.status || 'available'
        }
    ]).select().single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/estoque')
    revalidatePath('/catalogo')

    return { success: true, data: vehicle }
}

export async function softDeleteVehicle(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('vehicles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/estoque')
    revalidatePath('/catalogo')
    return { success: true }
}
