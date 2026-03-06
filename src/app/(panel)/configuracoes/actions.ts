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
            // Força a atualização do Webhook garantindo que a URL de produção esteja lá
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autocar.juanpaulo.com.br'
            const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL || `${appUrl.replace(/\/$/, '')}/api/webhook/evolution`

            try {
                await fetch(`${formattedUrl}/webhook/set/${creds.instanceName}`, {
                    method: 'POST',
                    headers: {
                        'apikey': creds.key,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        webhook: {
                            url: webhookUrl,
                            byEvents: false,
                            base64: false,
                            events: [
                                "QRCODE_UPDATED",
                                "CONNECTION_UPDATE",
                                "MESSAGES_UPSERT",
                                "MESSAGES_UPDATE",
                                "messages.upsert",
                                "messages.update",
                                "connection.update"
                            ]
                        }
                    })
                })
            } catch (e) {
                console.error('[Evolution API Webhook Update Error]', e)
            }

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
