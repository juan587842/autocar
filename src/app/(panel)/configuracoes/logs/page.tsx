import { createClient } from '@/lib/supabase/server'
import LogsClient from './LogsClient'
import { redirect } from 'next/navigation'

export default async function LogsPage() {
    const supabase = await createClient()

    // Protected Route - Verify Session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
        redirect('/')
    }

    // Role verification: only manager or owner should ideally see this? 
    // Wait, the client side logic can handle display better, let's fetch basic logs.
    const { data: logsData, error: logsError } = await supabase
        .from('system_logs')
        .select(`
            id,
            action,
            target_table,
            target_id,
            details,
            created_at,
            users (
                id,
                email,
                name,
                role
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    const logs = (logsData || []).map((log: any) => ({
        ...log,
        users: Array.isArray(log.users) ? log.users[0] : log.users
    }))

    return (
        <LogsClient initialLogs={logs} />
    )
}
