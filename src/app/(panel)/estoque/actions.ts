'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertVehicle(data: any) {
    const supabase = await createClient()

    // Geração automática do slug: marca-modelo-ano
    const baseSlug = `${data.brand}-${data.model}-${data.year_fab}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    // Lida com duplicidade (adiciona timestamp no final se precisar)
    const { data: existing } = await supabase.from('vehicles').select('id').eq('slug', baseSlug).single()
    const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const payload = {
        ...data,
        slug: data.id ? data.slug || finalSlug : finalSlug,
        status: data.status || 'available'
    }

    let query = supabase.from('vehicles')
    let result

    if (data.id) {
        result = await query.update(payload).eq('id', data.id).select().single()
    } else {
        result = await query.insert([payload]).select().single()
    }

    const { data: vehicle, error } = result

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

export async function updateVehicleStatus(id: string, newStatus: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/estoque')
    revalidatePath(`/estoque/${id}`)
    return { success: true }
}
