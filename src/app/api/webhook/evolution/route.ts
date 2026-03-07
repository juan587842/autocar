import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { WebhookPayload } from '@/lib/evolution'
import { processMessage } from '@/lib/ai/ai-agent'
import { fetchProfilePicture } from '@/lib/evolution'
import { createNotification } from '@/lib/notifications'

// POST /api/webhook/evolution — Recebe eventos da Evolution API
export async function POST(req: NextRequest) {
    console.log('[Webhook Evolution] POST Request Recebida!')

    // Instantiate inside the handler to prevent build-time eval errors
    const supabaseUrls = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    // Only proceed if we have valid vars, or return early to avoid crash during dev/build
    if (!supabaseUrls) {
        console.error('[Webhook Evolution] ERROR: Missing NEXT_PUBLIC_SUPABASE_URL')
        return NextResponse.json({ error: 'Missing Database URL' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrls, supabaseKey)

    try {
        const payload: any = await req.json()
        const rawEvent = payload.event || ''
        const eventName = rawEvent.toUpperCase().replace(/[.-]/g, '_') // Normalize messages.upsert / messages-upsert -> MESSAGES_UPSERT

        console.log(`[Webhook Evolution] Event: ${eventName} (Raw: ${rawEvent})`, payload.data ? JSON.stringify(payload.data).substring(0, 150) : 'No data')

        switch (eventName) {
            case 'MESSAGES_UPSERT':
                await handleMessageReceived(payload.data, supabase)
                break

            case 'MESSAGES_UPDATE':
                await handleButtonResponse(payload.data, supabase)
                break

            case 'CONNECTION_UPDATE':
                await handleConnectionUpdate(payload.data, supabase)
                break

            case 'QRCODE_UPDATED':
                // QR Code foi atualizado — pode ser tratado via polling na UI
                console.log('[Webhook] QR Code atualizado')
                break

            default:
                console.log(`[Webhook] Evento não tratado: ${payload.event}`)
        }

        return NextResponse.json({ received: true })
    } catch (err: any) {
        console.error('[Webhook Evolution] Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// ==============================================
// Handler: Nova Mensagem Recebida
// ==============================================
async function handleMessageReceived(data: any, supabase: any) {
    const messages = Array.isArray(data) ? data : [data]

    for (const msg of messages) {
        const key = msg.key
        if (!key) continue

        // Ignora mensagens de status (broadcast)
        if (key.remoteJid === 'status@broadcast') continue

        const isFromMe = key.fromMe === true
        const phone = key.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', '')
        const externalId = key.id
        const msgContent = msg.message

        if (!phone || !msgContent) continue

        // Extrair texto da mensagem
        const text = msgContent.conversation
            || msgContent.extendedTextMessage?.text
            || msgContent.imageMessage?.caption
            || msgContent.videoMessage?.caption
            || msgContent.documentMessage?.caption
            || '[Mídia]'

        // Determinar tipo de conteúdo
        let contentType = 'text'
        let mediaUrl = ''
        if (msgContent.imageMessage) { contentType = 'image'; mediaUrl = msgContent.imageMessage.url || '' }
        else if (msgContent.audioMessage) { contentType = 'audio'; mediaUrl = msgContent.audioMessage.url || '' }
        else if (msgContent.videoMessage) { contentType = 'video'; mediaUrl = msgContent.videoMessage.url || '' }
        else if (msgContent.documentMessage) { contentType = 'document'; mediaUrl = msgContent.documentMessage.url || '' }
        else if (msgContent.stickerMessage) { contentType = 'sticker' }
        else if (msgContent.contactMessage) { contentType = 'contact' }
        else if (msgContent.locationMessage) { contentType = 'location' }

        // 1. Resolver ou Criar Conversation
        let conversationId: string
        const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('phone', phone)
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (existingConv) {
            conversationId = existingConv.id
        } else {
            // === AUTO-REGISTRO DE LEAD ===
            // 1. Verificar se já existe um cliente com esse telefone
            let customerId: string | null = null
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('phone', phone)
                .limit(1)
                .single()

            if (existingCustomer) {
                customerId = existingCustomer.id
            } else {
                // 2. Criar novo cliente automaticamente usando pushName e telefone
                const pushName = msg.pushName || `Lead WhatsApp ${phone}`
                const { data: newCustomer, error: custErr } = await supabase
                    .from('customers')
                    .insert({
                        full_name: pushName,
                        phone,
                        source: 'whatsapp',
                        is_active: true,
                        notes: `Lead capturado automaticamente via WhatsApp em ${new Date().toLocaleDateString('pt-BR')}`,
                    })
                    .select('id')
                    .single()

                if (custErr || !newCustomer) {
                    console.error('[Webhook] Erro ao criar cliente:', custErr)
                } else {
                    customerId = newCustomer.id
                    console.log(`[Webhook] ✅ Novo cliente cadastrado: ${pushName} (${phone}) | ID: ${customerId}`)

                    fetchProfilePicture(phone).then(async (res) => {
                        const profileUrl = res?.data?.profilePictureUrl || res?.data?.picture
                        if (profileUrl) {
                            await supabase.from('customers').update({
                                metadata: { profilePictureUrl: profileUrl }
                            }).eq('id', customerId)
                            await supabase.from('conversations').update({
                                metadata: { remoteJid: key.remoteJid, pushName, profilePictureUrl: profileUrl }
                            }).eq('phone', phone)
                        }
                    }).catch(err => console.error('[Webhook] Erro ao buscar foto:', err.message))

                    // 3. Criar Deal (oportunidade) no funil de vendas — estágio "Lead Novo"
                    const { data: leadStage } = await supabase
                        .from('deal_stages')
                        .select('id')
                        .eq('name', 'Lead Novo')
                        .limit(1)
                        .single()

                    if (leadStage) {
                        const { error: dealErr } = await supabase
                            .from('deals')
                            .insert({
                                customer_id: customerId,
                                stage_id: leadStage.id,
                                notes: `Lead capturado automaticamente via WhatsApp. Primeira mensagem: "${text.substring(0, 100)}"`,
                            })

                        if (dealErr) {
                            console.error('[Webhook] Erro ao criar deal:', dealErr)
                        } else {
                            console.log(`[Webhook] ✅ Deal criado no funil "Lead Novo" para cliente ${customerId}`)
                        }
                    }
                }
            }

            // 4. Criar nova conversa vinculada ao cliente
            const pushNameParam = msg.pushName || `Lead WhatsApp ${phone}`
            const { data: newConv, error: convErr } = await supabase
                .from('conversations')
                .insert({
                    phone,
                    channel: 'whatsapp',
                    status: 'open',
                    customer_id: customerId,
                    metadata: { remoteJid: key.remoteJid, pushName: pushNameParam },
                })
                .select('id')
                .single()

            if (convErr || !newConv) {
                console.error('[Webhook] Erro ao criar conversation:', convErr)
                continue
            }
            conversationId = newConv.id

            // Notificação para a equipe sobre novo lead
            createNotification({
                user_id: 'all',
                title: '🚗 Novo Lead Capturado!',
                description: `Um novo cliente (+${phone}) iniciou contato via WhatsApp.`,
                type: 'message',
                link: '/inbox',
            }).catch(() => { /* silencioso */ })
        }

        // 2. Inserir Mensagem
        const { error: msgErr } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_type: isFromMe ? 'agent' : 'customer',
                content: text,
                content_type: contentType,
                media_url: mediaUrl || null,
                external_id: externalId,
                is_read: isFromMe,
                metadata: { pushName: msg.pushName || null },
            })

        if (msgErr) {
            console.error('[Webhook] Erro ao salvar mensagem:', msgErr)
        } else {
            console.log(`[Webhook] ✅ Mensagem salva | Conv: ${conversationId} | De: ${isFromMe ? 'Loja' : phone}`)

            // === AGENTE DE IA ===
            // Se a mensagem é do cliente e a IA está habilitada, processar com o agente
            if (!isFromMe && text !== '[Mídia]') {
                try {
                    // Verificar se ai_enabled está ativo na conversa
                    const { data: convData } = await supabase
                        .from('conversations')
                        .select('ai_enabled')
                        .eq('id', conversationId)
                        .single()

                    if (convData?.ai_enabled !== false) {
                        // Processar em background (não bloqueia o webhook)
                        processMessage(conversationId, text, phone).catch(err => {
                            console.error('[Webhook] Erro no AI Agent:', err.message)
                        })
                        console.log(`[Webhook] 🤖 AI Agent invocado para conv ${conversationId}`)
                    }
                } catch (aiErr: any) {
                    console.error('[Webhook] Erro ao verificar AI:', aiErr.message)
                }
            }
        }
    }
}

// ==============================================
// Handler: Status de Conexão Atualizado
// ==============================================
async function handleConnectionUpdate(data: any, supabase: any) {
    const state = data?.state || data?.status
    console.log(`[Webhook] Connection Status: ${state}`)
    // Pode-se salvar em store_settings ou cache local
}

// ==============================================
// Handler: Resposta de Botão Interativo (Confirmar/Cancelar/Reagendar)
// ==============================================
async function handleButtonResponse(data: any, supabase: any) {
    const updates = Array.isArray(data) ? data : [data]

    for (const update of updates) {
        // Payloads de botão podem vir em diferentes formatos dependendo da Evolution API version
        const buttonResponse = update?.message?.buttonsResponseMessage
            || update?.message?.listResponseMessage
            || update?.message?.templateButtonReplyMessage

        if (!buttonResponse) continue

        const selectedButtonId = buttonResponse.selectedButtonId
            || buttonResponse.selectedRowId
            || buttonResponse.selectedId
            || ''

        const phone = update?.key?.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', '')

        if (!phone || !selectedButtonId) continue

        console.log(`[Webhook] 🔘 Botão clicado: "${selectedButtonId}" por ${phone}`)

        // Mapear ação do botão para status do agendamento
        const statusMapping: Record<string, string> = {
            'confirm_appointment': 'confirmed',
            'cancel_appointment': 'cancelled',
            'reschedule_appointment': 'scheduled', // Marca como rescheduling
        }

        const newStatus = statusMapping[selectedButtonId.toLowerCase()]
        if (!newStatus) {
            console.log(`[Webhook] Botão "${selectedButtonId}" não mapeado, ignorando.`)
            continue
        }

        // Buscar agendamento mais recente do cliente por telefone
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .limit(1)
            .single()

        if (!customer) {
            console.warn(`[Webhook] Cliente com tel ${phone} não encontrado.`)
            continue
        }

        // Atualizar o agendamento mais recente do cliente
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({ status: newStatus })
            .eq('customer_id', customer.id)
            .in('status', ['scheduled', 'confirmed'])
            .order('scheduled_at', { ascending: false })
            .limit(1)
            .select()
            .single()

        if (error) {
            console.error('[Webhook] Erro ao atualizar agendamento:', error)
        } else if (appointment) {
            console.log(`[Webhook] ✅ Agendamento ${appointment.id} atualizado para "${newStatus}"`)

            // Enviar push notification para a equipe sobre a resposta
            try {
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: `📋 Agendamento ${newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'cancelled' ? 'Cancelado' : 'Reagendamento'}`,
                        body: `O cliente ${phone} ${newStatus === 'confirmed' ? 'confirmou' : newStatus === 'cancelled' ? 'cancelou' : 'solicitou reagendamento d'}o agendamento.`,
                        url: '/agenda',
                    }),
                })
            } catch (pushErr) {
                console.warn('[Webhook] Falha ao enviar push:', pushErr)
            }
        }
    }
}

// ==============================================
// Helper: Enviar Push para Novo Lead
// ==============================================
async function sendNewLeadPush(phone: string) {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: '🚗 Novo Lead Capturado!',
                body: `Um novo cliente (+${phone}) iniciou contato via WhatsApp.`,
                url: '/inbox',
            }),
        })
    } catch (err) {
        console.warn('[Webhook] Falha ao enviar push de novo lead:', err)
    }
}

