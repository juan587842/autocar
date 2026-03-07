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
        // Send to all active users
        const { data: allUsers } = await supabaseAdmin.from('users').select('id')
        userIds = (allUsers || []).map((u: { id: string }) => u.id)
    } else if (Array.isArray(user_id)) {
        userIds = user_id
    } else {
        userIds = [user_id]
    }

    if (!userIds || userIds.length === 0) return

    // Insert notifications into DB for all target users
    const rows = userIds.map(uid => ({
        user_id: uid,
        title,
        description,
        type,
        link,
    }))

    await supabaseAdmin.from('notifications').insert(rows)

    // Fire-and-forget Push to mobile/PWA
    if (sendPush) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        fetch(`${appUrl}/api/push`, {
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
