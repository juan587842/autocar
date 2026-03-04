'use server'

import { createClient } from '@/lib/supabase/server'
import { sendText } from '@/lib/evolution'

interface SendMessageResult {
    success: boolean
    message?: string
}

export async function sendMessage(conversationId: string, content: string): Promise<SendMessageResult> {
    try {
        const supabase = await createClient()

        // 1. Obter a conversa
        const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single()

        if (!conv) {
            return { success: false, message: 'Conversa não encontrada' }
        }

        // 2. Se IA estava ligada, desligar (Handoff Automático)
        if (conv.is_ai_active || conv.status === 'ai_handling' || conv.status === 'waiting_human') {
            await supabase
                .from('conversations')
                .update({
                    is_ai_active: false,
                    status: 'human_handling'
                })
                .eq('id', conversationId)
        }

        // 3. Obter configurações da loja para o nome da instância (Evolution)
        const { data: settings } = await supabase
            .from('store_settings')
            .select('evolution_api_instance')
            .limit(1)
            .single()

        const instanceName = settings?.evolution_api_instance || process.env.EVOLUTION_INSTANCE_NAME || 'autocar'

        // 4. Enviar mensagem via WhatsApp através da função centralizada
        const phone = conv.phone

        const response = await sendText(`${phone}@s.whatsapp.net`, content, instanceName, 1200)

        if (response.error) {
            console.error('[Inbox Action] Erro Evolution:', response.error)
            return { success: false, message: 'Falha ao enviar via WhatsApp' }
        }

        const evoData = response.data

        // 5. Inserir a mensagem no Supabase localmente (o webhook de ACK atualiza status depois)
        await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_type: 'seller',
                content: content,
                external_id: evoData?.key?.id || null, // ID gerado pelo WA
                status: 'sent'
            })

        // 6. Atualizar last_message da conversa
        await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId)

        return { success: true }

    } catch (error: any) {
        console.error('[Inbox Action] Exception:', error)
        return { success: false, message: error.message || 'Erro deconhecido' }
    }
}
