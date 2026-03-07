import { createClient } from '@supabase/supabase-js'

/**
 * Creates a notification in the database and optionally sends a PWA push notification.
 * Should be called from server-side code (webhooks, API routes, server actions).
 */
export async function createNotification({
    user_id,
    title,
    description,
    type = 'info',
    link,
    sendPush = true,
}: {
    user_id: string | string[] | 'all'
    title: string
    description?: string
    type?: 'info' | 'message' | 'success' | 'warning' | 'error'
    link?: string
    sendPush?: boolean
}) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let userIds: string[] | null = null

    if (user_id === 'all') {
        const { data: allUsers, error: fetchErr } = await supabaseAdmin.from('users').select('id')
        if (fetchErr) {
            console.error('[createNotification] Erro ao buscar usuários:', fetchErr)
            return
        }
        userIds = (allUsers || []).map((u: { id: string }) => u.id)
    } else if (Array.isArray(user_id)) {
        userIds = user_id
    } else {
        userIds = [user_id]
    }

    if (!userIds || userIds.length === 0) {
        console.warn('[createNotification] Nenhum user_id resolvido.')
        return
    }

    const rows = userIds.map(uid => ({
        user_id: uid,
        title,
        description,
        type,
        link,
    }))

    const { error: insertErr } = await supabaseAdmin.from('notifications').insert(rows)
    if (insertErr) {
        console.error('[createNotification] Erro na inserção Supabase:', insertErr)
    } else {
        console.log(`[createNotification] ✅ Salvo no DB para ${rows.length} usuário(s)`)
    }

    if (sendPush) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        await fetch(`${appUrl}/api/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_ids: userIds,
                title,
                body: description || title,
                url: link || '/inbox',
            }),
        }).catch(err => console.warn('[createNotification] Push send error:', err))
    }
}
