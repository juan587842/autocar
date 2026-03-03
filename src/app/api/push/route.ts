import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configura VAPID
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_PUBLIC !== 'your-vapid-public-key') {
    webpush.setVapidDetails(
        `mailto:admin@${process.env.NEXT_PUBLIC_APP_URL || 'autocar.com'}`,
        VAPID_PUBLIC,
        VAPID_PRIVATE
    )
}

/*
  POST /api/push
  Body: {
    user_ids?: string[],    // Enviar para usuários específicos — se vazio envia p/ todos ativos
    title: string,
    body: string,
    icon?: string,
    url?: string,            // Onde levar ao clicar
  }

  Chamada internamente pela API sempre que um evento relevante ocorre:
  - Novo lead capturado
  - IA transferiu para humano (handoff)
  - Agendamento confirmado / lembrete 30min
*/
export async function POST(req: NextRequest) {
    try {
        const { user_ids, title, body, icon, url } = await req.json()

        if (!title || !body) {
            return NextResponse.json({ error: 'title e body são obrigatórios' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Busca subscriptions ativas
        let query = supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .eq('is_active', true)

        if (user_ids && user_ids.length > 0) {
            query = query.in('user_id', user_ids)
        }

        const { data: subscriptions } = await query

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: 'Nenhuma inscrição ativa encontrada.' })
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/favicon.ico',
            url: url || '/',
        })

        let sent = 0
        let failed = 0

        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth_key,
                        },
                    },
                    payload
                )
                sent++
            } catch (err: any) {
                failed++
                // Se endpoint expirou (410 Gone), desativa
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabaseAdmin
                        .from('push_subscriptions')
                        .update({ is_active: false })
                        .eq('id', sub.id)
                }
            }
        }

        return NextResponse.json({ success: true, sent, failed })
    } catch (error: any) {
        console.error('[Push API] Erro:', error)
        return NextResponse.json({ error: error.message || 'Erro ao enviar push' }, { status: 500 })
    }
}
