import { NextRequest, NextResponse } from 'next/server'
import { createInstance, getQRCode, getInstanceStatus, logoutInstance, restartInstance } from '@/lib/evolution'

// POST /api/evolution/instance — Criar instância ou obter QR Code
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, instanceName } = body

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        // Permite definir uma URL de webhook específica (útil para redes internas no Docker/EasyPanel)
        const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL || `${appUrl}/api/webhook/evolution`

        switch (action) {
            case 'create': {
                const result = await createInstance(webhookUrl, instanceName)
                return NextResponse.json(result)
            }

            case 'qrcode': {
                const result = await getQRCode(instanceName)
                return NextResponse.json(result)
            }

            case 'status': {
                const result = await getInstanceStatus(instanceName)
                return NextResponse.json(result)
            }

            case 'logout': {
                const result = await logoutInstance(instanceName)
                return NextResponse.json(result)
            }

            case 'restart': {
                const result = await restartInstance(instanceName)
                return NextResponse.json(result)
            }

            default:
                return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
        }
    } catch (err: any) {
        console.error('[API Evolution Instance]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
