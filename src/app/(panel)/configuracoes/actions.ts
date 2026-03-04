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

export async function testEvolutionConnection() {
    const creds = await getEvolutionCredentials()
    if (!creds.url || !creds.instanceName) {
        return { success: false, error: 'Credenciais ausentes no .env' }
    }

    try {
        const formattedUrl = creds.url.replace(/\/$/, '')
        const res = await fetch(`${formattedUrl}/instance/connectionState/${creds.instanceName}`, {
            headers: {
                'apikey': creds.key
            },
            cache: 'no-store'
        })

        if (res.ok) {
            const data = await res.json()
            const state = data?.instance?.state || data?.state || 'conectado'
            return { success: true, state }
        } else {
            return { success: false, error: `Falha HTTP: ${res.status} ${res.statusText}` }
        }
    } catch (error: any) {
        console.error('[Evolution API Test]', error)
        return { success: false, error: error.message || 'Erro de rede ao contatar a API.' }
    }
}
