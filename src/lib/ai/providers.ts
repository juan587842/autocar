// =======================================================
// AI Providers — Factory Multi-Provider (OpenAI / Gemini)
// Story E3.S2 — Agente de IA
// =======================================================

import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export type AIProviderConfig = {
    provider: 'openai' | 'gemini'
    model: string
}

function getDefaultConfig(): AIProviderConfig {
    // Auto-detect: se não tem chave OpenAI mas tem chave Google, usa Gemini
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGemini = !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY)

    if (!hasOpenAI && hasGemini) {
        return { provider: 'gemini', model: 'gemini-2.5-flash' }
    }

    return { provider: 'openai', model: 'gpt-4o-mini' }
}

const DEFAULT_CONFIG: AIProviderConfig = getDefaultConfig()

/**
 * Retorna o modelo do Vercel AI SDK com base na configuração do dono.
 * Puxa de store_settings ou usa default.
 */
export function getLanguageModel(config?: AIProviderConfig) {
    const { provider, model } = config || DEFAULT_CONFIG

    if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || '',
        })
        return google(model || 'gemini-2.0-flash')
    }

    // Default: OpenAI
    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
    })
    return openai(model || 'gpt-4o-mini')
}

/**
 * Mapeia as strings salvas no DB para o formato do factory
 */
export function parseProviderConfig(aiModel?: string): AIProviderConfig {
    if (!aiModel) return DEFAULT_CONFIG

    const lower = aiModel.toLowerCase()

    if (lower.includes('gemini')) {
        return { provider: 'gemini', model: lower }
    }

    // Qualquer variação de GPT
    return { provider: 'openai', model: lower.includes('gpt-4o-mini') ? 'gpt-4o-mini' : lower.includes('gpt-4o') ? 'gpt-4o' : 'gpt-4o-mini' }
}
