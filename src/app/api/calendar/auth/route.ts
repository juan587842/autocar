import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/lib/google-calendar'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const authUrl = getAuthUrl(user.id)
        return NextResponse.redirect(authUrl)
    } catch (error: any) {
        console.error('[Calendar Auth] Erro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao iniciar autenticação Google' },
            { status: 500 }
        )
    }
}
