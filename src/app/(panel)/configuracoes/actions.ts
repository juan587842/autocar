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
        key: process.env.EVOLUTION_API_KEY || '',
        instanceName: process.env.EVOLUTION_INSTANCE_NAME || '',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://autocar.juanpaulo.com.br'
    }
}
