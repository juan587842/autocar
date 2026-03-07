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

// Known Gemini model name mappings (from human-readable → API model ID)
const GEMINI_MODEL_MAP: Record<string, string> = {
    'gemini 2.5 flash': 'gemini-2.0-flash',           // 2.5 preview not available via Cloud API key
    'gemini 2.5 flash preview': 'gemini-2.0-flash',
    'gemini 2.0 flash': 'gemini-2.0-flash',
    'gemini 2.0 flash exp': 'gemini-2.0-flash-exp',
    'gemini 1.5 pro': 'gemini-1.5-pro',
    'gemini 1.5 flash': 'gemini-1.5-flash',
}

function normalizeGeminiModelId(raw: string): string {
    const lower = raw.toLowerCase().trim()
    // Check map first
    if (GEMINI_MODEL_MAP[lower]) return GEMINI_MODEL_MAP[lower]
    // If already has hyphens and looks like an API ID, use as-is
    if (lower.includes('-') && lower.startsWith('gemini-')) return lower
    // Fallback: replace spaces with hyphens
    return lower.replace(/\s+/g, '-')
}

function getGeminiApiKey(): string {
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY
        || process.env.GEMINI_API_KEY
        || process.env.GOOGLE_CLOUD_API_KEY
        || ''
}

function getDefaultConfig(): AIProviderConfig {
    const hasGemini = !!getGeminiApiKey()
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    // Prefer Gemini if key is present
    if (hasGemini) {
        return { provider: 'gemini', model: 'gemini-2.0-flash' }
    }

    if (hasOpenAI) {
        return { provider: 'openai', model: 'gpt-4o-mini' }
    }

    // If neither key is configured, prefer Gemini (will error with clear message)
    return { provider: 'gemini', model: 'gemini-2.0-flash' }
}

const DEFAULT_CONFIG: AIProviderConfig = getDefaultConfig()

/**
 * Retorna o modelo do Vercel AI SDK com base na configuração do dono.
 */
export function getLanguageModel(config?: AIProviderConfig) {
    const { provider, model } = config || DEFAULT_CONFIG

    if (provider === 'gemini') {
        const apiKey = getGeminiApiKey()
        if (!apiKey) {
            console.error('[Providers] ❌ GOOGLE_GENERATIVE_AI_API_KEY não configurada! Defina essa variável no EasyPanel.')
        }
        const google = createGoogleGenerativeAI({ apiKey })
        const modelId = normalizeGeminiModelId(model)
        console.log(`[Providers] 🤖 Usando Gemini | Model: ${modelId}`)
        return google(modelId)
    }

    // OpenAI
    const apiKey = process.env.OPENAI_API_KEY || ''
    if (!apiKey) {
        console.error('[Providers] ❌ OPENAI_API_KEY não configurada!')
    }
    const openai = createOpenAI({ apiKey })
    console.log(`[Providers] 🤖 Usando OpenAI | Model: ${model}`)
    return openai(model || 'gpt-4o-mini')
}

/**
 * Mapeia as strings salvas no DB para o formato do factory.
 * Se o modelo mencionar "gemini", força o provider gemini independente do resto.
 */
export function parseProviderConfig(aiModel?: string | null): AIProviderConfig {
    if (!aiModel) {
        console.log(`[Providers] ai_default_model não definido no DB, usando default: ${DEFAULT_CONFIG.provider}/${DEFAULT_CONFIG.model}`)
        return DEFAULT_CONFIG
    }

    const lower = aiModel.toLowerCase()

    if (lower.includes('gemini')) {
        const modelId = normalizeGeminiModelId(lower)
        console.log(`[Providers] Modelo DB "${aiModel}" → Gemini/${modelId}`)
        return { provider: 'gemini', model: modelId }
    }

    if (lower.includes('gpt')) {
        const modelId = lower.includes('gpt-4o-mini') ? 'gpt-4o-mini'
            : lower.includes('gpt-4o') ? 'gpt-4o'
                : 'gpt-4o-mini'
        return { provider: 'openai', model: modelId }
    }

    // Unknown model string - fall back to env-based default
    console.warn(`[Providers] Modelo desconhecido: "${aiModel}", usando default`)
    return DEFAULT_CONFIG
}
