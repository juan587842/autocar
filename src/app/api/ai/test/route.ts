import { NextResponse } from 'next/server'
import { getLanguageModel, parseProviderConfig } from '@/lib/ai/providers'
import { generateText } from 'ai'

// GET /api/ai/test — Testa a conexão com o provedor de IA configurado
export async function GET() {
    try {
        const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || ''
        const openaiKey = process.env.OPENAI_API_KEY || ''

        const envReport = {
            GOOGLE_GENERATIVE_AI_API_KEY: geminiKey ? `✅ Configurada (${geminiKey.slice(0, 8)}...)` : '❌ NÃO CONFIGURADA',
            OPENAI_API_KEY: openaiKey ? `✅ Configurada (${openaiKey.slice(0, 8)}...)` : '❌ Não configurada',
        }

        // Testa o modelo Gemini diretamente
        const config = parseProviderConfig('Gemini 2.5 Flash')
        const model = getLanguageModel(config)

        const result = await generateText({
            model,
            prompt: 'Responda apenas: OK',
            maxTokens: 10,
        })

        return NextResponse.json({
            status: 'success',
            provider: config.provider,
            model: config.model,
            response: result.text,
            env: envReport,
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            env: {
                GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ Presente' : '❌ AUSENTE',
                OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Presente' : '❌ Ausente',
            }
        }, { status: 500 })
    }
}
