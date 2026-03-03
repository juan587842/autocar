import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state') // userId

        if (!code || !state) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?error=missing_params`
            )
        }

        const tokens = await exchangeCodeForTokens(code)

        // Salvar tokens no banco usando service_role (bypass RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        await supabaseAdmin
            .from('user_integrations')
            .upsert({
                user_id: state,
                provider: 'google_calendar',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expiry_date
                    ? new Date(tokens.expiry_date).toISOString()
                    : null,
                is_active: true,
            }, { onConflict: 'user_id,provider' })

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?success=google_calendar`
        )
    } catch (error: any) {
        console.error('[Calendar Callback] Erro:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?error=google_auth_failed`
        )
    }
}
