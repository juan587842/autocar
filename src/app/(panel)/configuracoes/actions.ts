"use server"

import { createClient } from "@/lib/supabase/server"

export async function getEvolutionCredentials() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error("Unauthorized")
    }

    return {
        url: process.env.EVOLUTION_API_URL || '',
        key: process.env.EVOLUTION_API_KEY || ''
    }
}
