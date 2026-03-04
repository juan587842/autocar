// =======================================================
// AI Agent — Módulo Core do Agente de IA
// Story E3.S2 — Agente de IA (Vercel AI SDK)
// =======================================================

import { generateText, stepCountIs } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { getLanguageModel, parseProviderConfig } from './providers'
import { buildSystemPrompt } from './system-prompt'
import { agentTools } from './tools'
import { sendText } from '@/lib/evolution'

// Admin client (sem RLS) para operações do agente
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const MAX_HISTORY_MESSAGES = 20

/**
 * Processa uma mensagem recebida do cliente e gera resposta via IA.
 *
 * @param conversationId - ID da conversa no Supabase
 * @param userMessage - Texto enviado pelo cliente
 * @param phone - Número do telefone do cliente
 * @param instanceName - Nome da instância Evolution API
 */
export async function processMessage(
    conversationId: string,
    userMessage: string,
    phone: string,
    instanceName?: string
): Promise<{ response: string; toolCalls?: any[] }> {
    const supabase = getSupabase()

    try {
        // 1. Carregar configurações da loja
        const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('*')
            .limit(1)
            .single()

        // 2. Carregar histórico da conversa (últimas N mensagens)
        const { data: history } = await supabase
            .from('messages')
            .select('content, sender_type, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(MAX_HISTORY_MESSAGES)

        // Montar array de mensagens para o SDK (ordem cronológica)
        const conversationHistory = (history || [])
            .reverse()
            .map(msg => ({
                role: msg.sender_type === 'customer' ? 'user' as const : 'assistant' as const,
                content: msg.content || '',
            }))

        // 3. Configurar provider com base nas settings do dono
        const aiModelSetting = storeSettings?.ai_model || 'gpt-4o-mini'
        const providerConfig = parseProviderConfig(aiModelSetting)
        const model = getLanguageModel(providerConfig)

        // 4. Montar system prompt
        const systemPrompt = buildSystemPrompt({
            storeName: storeSettings?.store_name,
            address: storeSettings?.address,
            phone: storeSettings?.phone,
            businessHours: storeSettings?.business_hours,
        })

        // 5. Gerar resposta com AI SDK + Tools
        const result = await generateText({
            model,
            system: systemPrompt,
            messages: [
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ],
            tools: agentTools,
            stopWhen: stepCountIs(5), // Permite até 5 steps (tool calls encadeados)
        })

        const responseText = result.text || 'Desculpe, não consegui processar sua mensagem. Pode repetir?'

        // 6. Salvar resposta no banco de dados
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'agent',
            content: responseText,
            content_type: 'text',
            is_read: true,
            metadata: {
                ai_generated: true,
                provider: providerConfig.provider,
                model: providerConfig.model,
                tool_calls: result.toolCalls?.map(tc => tc.toolName) || [],
            },
        })

        // 7. Enviar resposta via WhatsApp (Evolution API) em partes
        const evoInstance = instanceName || process.env.EVOLUTION_INSTANCE_NAME || 'autocar'

        // Quebra o texto por quebras de linha duplas (parágrafos)
        const paragraphs = responseText.split(/\n\n+/).map(p => p.trim()).filter(Boolean)

        for (const paragraph of paragraphs) {
            // Simula tempo digitação: 30ms por caractere (mínimo 1000ms, máximo 4000ms)
            const delayInMs = Math.min(Math.max(paragraph.length * 30, 1000), 4000)
            await sendText(phone, paragraph, evoInstance, delayInMs)
        }

        // 8. Atualizar conversa (última atividade + contagem)
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)

        console.log(`[AI Agent] ✅ Resposta gerada e enviada | Conv: ${conversationId} | Provider: ${providerConfig.provider}/${providerConfig.model} | Tools: ${result.toolCalls?.map(tc => tc.toolName).join(', ') || 'none'}`)

        return {
            response: responseText,
            toolCalls: result.toolCalls,
        }
    } catch (error: any) {
        console.error('[AI Agent] ❌ Erro ao processar mensagem:', error.message)

        // Fallback: mensagem de erro amigável
        const fallbackMsg = 'Desculpe, estou com dificuldades técnicas no momento. Um de nossos vendedores entrará em contato em breve! 😊'

        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'agent',
            content: fallbackMsg,
            content_type: 'text',
            is_read: true,
            metadata: { ai_generated: true, error: error.message },
        })

        const evoInstance = instanceName || process.env.EVOLUTION_INSTANCE_NAME || 'autocar'
        await sendText(phone, fallbackMsg, evoInstance)

        return { response: fallbackMsg }
    }
}
