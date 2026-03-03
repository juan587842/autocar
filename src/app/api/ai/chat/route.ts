// =======================================================
// POST /api/ai/chat — Endpoint para Chat com IA
// Story E3.S2 — Endpoint auxiliar para futuro Inbox (E3.S3)
// =======================================================

import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/lib/ai/ai-agent'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { conversationId, message, phone } = body

        if (!conversationId || !message) {
            return NextResponse.json(
                { error: 'conversationId e message são obrigatórios' },
                { status: 400 }
            )
        }

        const result = await processMessage(
            conversationId,
            message,
            phone || 'web-chat'
        )

        return NextResponse.json({
            success: true,
            response: result.response,
            toolCalls: result.toolCalls?.map(tc => ({
                tool: tc.toolName,
                args: tc.args,
            })),
        })
    } catch (err: any) {
        console.error('[API AI Chat] Error:', err)
        return NextResponse.json(
            { error: err.message || 'Erro interno' },
            { status: 500 }
        )
    }
}
