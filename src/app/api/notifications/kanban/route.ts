import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { dealId, customerName, stageName } = body

        if (!dealId || !customerName || !stageName) {
            return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 })
        }

        await createNotification({
            user_id: 'all',
            title: '📊 Movimentação no Kanban',
            description: `O negócio de ${customerName} foi movido para: ${stageName}.`,
            type: 'info',
            link: '/vendas',
        })

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('[API Kanban Notification]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
