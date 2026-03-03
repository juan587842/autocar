import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Endpoint de Cron Job (para uso com Vercel Cron ou externo)
// Requer header: Authorization: Bearer <CRON_SECRET>

const CRON_SECRET = process.env.CRON_SECRET || 'autocar-cron-secret'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')

    // Verificacao basica (Vercel manda Bearer CRON_SECRET)
    if (authHeader !== `Bearer ${CRON_SECRET}` && req.headers.get('x-vercel-cron') !== '1') {
        if (process.env.NODE_ENV === 'production' && !process.env.IGNORE_CRON_AUTH) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const nowOffset = new Date()
        // Buscar configuracoes da loja (Evolution API keys etc)
        const { data: settings } = await supabase
            .from('store_settings')
            .select('evolution_api_instance, api_keys, store_name, address')
            .limit(1)
            .single()

        const instanceName = settings?.evolution_api_instance || process.env.EVOLUTION_INSTANCE_NAME || 'autocar'
        const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'

        let evolutionKey = process.env.EVOLUTION_API_KEY || ''
        if (settings?.api_keys && typeof settings.api_keys === 'object' && 'evolution_api' in (settings.api_keys as any)) {
            evolutionKey = (settings.api_keys as any).evolution_api || evolutionKey
        }

        const storeName = settings?.store_name || 'AutoCar'
        const storeAddress = settings?.address || 'nossa loja'

        // Buscar agendamentos que estão no status SCHEDULED
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                id, 
                scheduled_at, 
                status, 
                metadata,
                customers (id, full_name, phone)
            `)
            .eq('status', 'scheduled')
            .gte('scheduled_at', new Date().toISOString()) // Somente futuros
            .lte('scheduled_at', new Date(nowOffset.getTime() + 48 * 60 * 60 * 1000).toISOString()) // Limitar a até 48h a frente

        if (error) throw error

        const logs: string[] = []
        let sentCount = 0

        for (const appt of appointments || []) {
            const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
            if (!customer || !customer.phone) continue

            const scheduledAt = new Date(appt.scheduled_at)
            const diffHours = (scheduledAt.getTime() - nowOffset.getTime()) / (1000 * 60 * 60)

            const metadata = (appt.metadata as Record<string, any>) || {}
            let messageToSend = null
            let markAs = ''

            const dateStr = scheduledAt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
            const timeStr = scheduledAt.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })

            // Regra 1: D-1 (Falta ~24h)
            if (diffHours <= 30 && diffHours > 12 && !metadata.reminded_d1) {
                messageToSend = `Olá ${customer.full_name.split(' ')[0]}, tudo bem? Passando para lembrar que nossa visita está agendada para amanhã (${dateStr}) às ${timeStr} na ${storeName}.\n\n📍 Endereço: ${storeAddress}\n\nCaso precise reagendar, basta nos avisar por aqui!`
                markAs = 'reminded_d1'
            }
            // Regra 2: H-2 (Falta ~2h)
            else if (diffHours <= 3 && diffHours > 0 && !metadata.reminded_h2) {
                messageToSend = `Oi ${customer.full_name.split(' ')[0]}! Estamos ansiosos pela sua visita hoje às ${timeStr} na ${storeName}. \n📍 O endereço é: ${storeAddress}.\n\nPara qualquer dúvida, nossa equipe está à disposição.`
                markAs = 'reminded_h2'
            }

            // Enviar mensagem se houver uma trigger acionada
            if (messageToSend && markAs) {
                try {
                    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': evolutionKey
                        },
                        body: JSON.stringify({
                            number: `${customer.phone}@s.whatsapp.net`,
                            text: messageToSend,
                            delay: 1500
                        })
                    })

                    if (response.ok) {
                        // Salvar na metadata para nao reenviar
                        const newMetadata = { ...metadata, [markAs]: true, last_reminder_sent_at: new Date().toISOString() }
                        await supabase
                            .from('appointments')
                            .update({ metadata: newMetadata })
                            .eq('id', appt.id)

                        // Salvar log na tab de mensagems p ficar no CRM (opcional, requer pegar conversation_id, pularemos por simplicidade para não dar gargalo)
                        logs.push(`Enviado ${markAs} para ${customer.phone} (Appt ID: ${appt.id})`)
                        sentCount++
                    } else {
                        logs.push(`Falha no envio para ${customer.phone}. Status: ${response.status}`)
                    }
                } catch (err: any) {
                    logs.push(`Erro fetch Evolution API para ${customer.phone}: ${err.message}`)
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron executado. ${sentCount} lembretes enviados.`,
            logs,
            timestamp: new Date().toISOString()
        })

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
