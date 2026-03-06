import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processMessage } from '@/lib/ai/ai-agent'
import { fetchProfilePicture } from '@/lib/evolution'

// =============================================================================
// Catch-All Route: /api/webhook/evolution/[...event]
// Quando a Evolution API está com "Webhook by Events" ativado, ela envia
// cada tipo de evento para uma URL separada, por exemplo:
//   /api/webhook/evolution/messages_upsert
//   /api/webhook/evolution/connection_update
//
// Esta rota captura todas essas URLs e roteia para os handlers corretos.
// =============================================================================

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ event: string[] }> }
) {
    const { event: eventSegments } = await params
    const eventFromUrl = (eventSegments || []).join('_').toUpperCase().replace(/[.-]/g, '_')

    console.log(`[Webhook Evolution ByEvent] Rota: /api/webhook/evolution/${eventSegments?.join('/')} | Evento: ${eventFromUrl}`)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl) {
        console.error('[Webhook ByEvent] ERROR: Missing NEXT_PUBLIC_SUPABASE_URL')
        return NextResponse.json({ error: 'Missing Database URL' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const payload: any = await req.json()

        // O evento pode vir no corpo OU na URL. Priorizar a URL pois é o que define a rota.
        const bodyEvent = (payload.event || '').toUpperCase().replace(/[.-]/g, '_')
        const eventName = eventFromUrl || bodyEvent

        console.log(`[Webhook ByEvent] Event: ${eventName}`, payload.data ? JSON.stringify(payload.data).substring(0, 150) : 'No data')

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
                console.log('[Webhook ByEvent] QR Code atualizado')
                break

            default:
                console.log(`[Webhook ByEvent] Evento não tratado: ${eventName}`)
        }

        return NextResponse.json({ received: true })
    } catch (err: any) {
        console.error('[Webhook ByEvent] Error:', err)
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
                    console.error('[Webhook ByEvent] Erro ao criar cliente:', custErr)
                } else {
                    customerId = newCustomer.id
                    console.log(`[Webhook ByEvent] ✅ Novo cliente cadastrado: ${pushName} (${phone}) | ID: ${customerId}`)

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
                    }).catch(err => console.error('[Webhook ByEvent] Erro ao buscar foto:', err.message))

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
                            console.error('[Webhook ByEvent] Erro ao criar deal:', dealErr)
                        } else {
                            console.log(`[Webhook ByEvent] ✅ Deal criado no funil "Lead Novo" para cliente ${customerId}`)
                        }
                    }
                }
            }

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
                console.error('[Webhook ByEvent] Erro ao criar conversation:', convErr)
                continue
            }
            conversationId = newConv.id
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
            console.error('[Webhook ByEvent] Erro ao salvar mensagem:', msgErr)
        } else {
            console.log(`[Webhook ByEvent] ✅ Mensagem salva | Conv: ${conversationId} | De: ${isFromMe ? 'Loja' : phone}`)

            // === AGENTE DE IA ===
            if (!isFromMe && text !== '[Mídia]') {
                try {
                    const { data: convData } = await supabase
                        .from('conversations')
                        .select('ai_enabled')
                        .eq('id', conversationId)
                        .single()

                    if (convData?.ai_enabled !== false) {
                        processMessage(conversationId, text, phone).catch(err => {
                            console.error('[Webhook ByEvent] Erro no AI Agent:', err.message)
                        })
                        console.log(`[Webhook ByEvent] 🤖 AI Agent invocado para conv ${conversationId}`)
                    }
                } catch (aiErr: any) {
                    console.error('[Webhook ByEvent] Erro ao verificar AI:', aiErr.message)
                }
            }
        }
    }
}

// ==============================================
// Handler: Status de Conexão
// ==============================================
async function handleConnectionUpdate(data: any, supabase: any) {
    const state = data?.state || data?.status
    console.log(`[Webhook ByEvent] Connection Status: ${state}`)
}

// ==============================================
// Handler: Resposta de Botão Interativo
// ==============================================
async function handleButtonResponse(data: any, supabase: any) {
    const updates = Array.isArray(data) ? data : [data]

    for (const update of updates) {
        const buttonResponse = update?.message?.buttonsResponseMessage
            || update?.message?.listResponseMessage
            || update?.message?.templateButtonReplyMessage

        if (!buttonResponse) continue

        const selectedButtonId = buttonResponse.selectedButtonId
            || buttonResponse.singleSelectReply?.selectedRowId
            || buttonResponse.selectedId

        if (!selectedButtonId) continue

        console.log(`[Webhook ByEvent] Button Response: ${selectedButtonId}`)
    }
}
