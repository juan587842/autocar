// =======================================================
// Evolution API — SDK Wrapper
// Documentação: https://doc.evolution-api.com
// =======================================================

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'autocar'

interface EvolutionResponse<T = any> {
    data?: T
    error?: string
}

async function evoFetch<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<EvolutionResponse<T>> {
    try {
        const url = `${EVOLUTION_API_URL}${path}`
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY,
                ...(options.headers || {}),
            },
        })

        if (!res.ok) {
            const errBody = await res.text()
            console.error(`[Evolution API] ${res.status} ${path}:`, errBody)
            return { error: `API Error ${res.status}: ${errBody}` }
        }

        const data = await res.json()
        return { data }
    } catch (err: any) {
        console.error('[Evolution API] Network Error:', err.message)
        return { error: `Network Error: ${err.message}` }
    }
}

// ============================================
// Instance Management
// ============================================

export async function createInstance(webhookUrl: string, instanceName: string = INSTANCE_NAME) {
    return evoFetch('/instance/create', {
        method: 'POST',
        body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
            webhook: {
                url: webhookUrl,
                byEvents: false,
                base64: false,
                events: [
                    'QRCODE_UPDATED',
                    'CONNECTION_UPDATE',
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE',
                ],
            },
        }),
    })
}

export async function getInstanceStatus(instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/instance/connectionState/${instanceName}`)
}

export async function getQRCode(instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/instance/connect/${instanceName}`)
}

export async function logoutInstance(instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/instance/logout/${instanceName}`, { method: 'DELETE' })
}

export async function deleteInstance(instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/instance/delete/${instanceName}`, { method: 'DELETE' })
}

export async function restartInstance(instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/instance/restart/${instanceName}`, { method: 'PUT' })
}

// ============================================
// Messaging
// ============================================

export async function sendText(phone: string, text: string, instanceName: string = INSTANCE_NAME, delayInMs?: number) {
    const body: any = {
        number: phone,
        text,
    }

    if (delayInMs && delayInMs > 0) {
        body.delay = delayInMs
    }

    return evoFetch(`/message/sendText/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export async function sendMedia(phone: string, mediaUrl: string, caption?: string, mediatype: 'image' | 'video' | 'document' = 'image', instanceName: string = INSTANCE_NAME) {
    return evoFetch(`/message/sendMedia/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            number: phone,
            mediatype,
            media: mediaUrl,
            caption: caption || '',
        }),
    })
}

// ============================================
// Tipos de Eventos do Webhook
// ============================================
export type EvolutionEvent =
    | 'QRCODE_UPDATED'
    | 'CONNECTION_UPDATE'
    | 'MESSAGES_UPSERT'
    | 'MESSAGES_UPDATE'
    | 'MESSAGES_DELETE'
    | 'SEND_MESSAGE'

export interface WebhookPayload {
    event: EvolutionEvent
    instance: string
    data: any
}

export { INSTANCE_NAME }
