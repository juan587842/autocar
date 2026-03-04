import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens } from '@/lib/google-calendar'

const APP_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://autocar.juanpaulo.com.br').replace(/^http:\/\//, 'https://')

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state') // userId

        if (!code || !state) {
            return NextResponse.redirect(
                `${APP_BASE_URL}/configuracoes?error=missing_params`
            )
        }

        const tokens = await exchangeCodeForTokens(code)

        // Salvar tokens no banco usando service_role (bypass RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Tenta atualizar registro existente primeiro
        const { data: existing } = await supabaseAdmin
            .from('user_integrations')
            .select('id')
            .eq('user_id', state)
            .eq('provider', 'google_calendar')
            .maybeSingle()

        if (existing) {
            await supabaseAdmin
                .from('user_integrations')
                .update({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expiry_date
                        ? new Date(tokens.expiry_date).toISOString()
                        : null,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
        } else {
            await supabaseAdmin
                .from('user_integrations')
                .insert({
                    user_id: state,
                    provider: 'google_calendar',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expiry_date
                        ? new Date(tokens.expiry_date).toISOString()
                        : null,
                    is_active: true,
                })
        }

        return NextResponse.redirect(
            `${APP_BASE_URL}/configuracoes?success=google_calendar`
        )
    } catch (error: any) {
        console.error('[Calendar Callback] Erro:', error)
        return NextResponse.redirect(
            `${APP_BASE_URL}/configuracoes?error=google_auth_failed`
        )
    }
}

