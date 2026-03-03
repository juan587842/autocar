import { google, calendar_v3 } from 'googleapis'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ─── Constants ──────────────────────────────────────────
const SCOPES = ['https://www.googleapis.com/auth/calendar']
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`

// ─── OAuth2 Client ──────────────────────────────────────
export function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados no .env')
    }

    return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)
}

// ─── Generate Auth URL ──────────────────────────────────
export function getAuthUrl(userId: string): string {
    const client = getOAuth2Client()
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        state: userId, // Passamos o userId para o callback
    })
}

// ─── Exchange Code for Tokens ───────────────────────────
export async function exchangeCodeForTokens(code: string) {
    const client = getOAuth2Client()
    const { tokens } = await client.getToken(code)
    return tokens
}

// ─── Get Authenticated Calendar Client ──────────────────
async function getCalendarClient(userId: string): Promise<calendar_v3.Calendar> {
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: integration } = await supabaseAdmin
        .from('user_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')
        .single()

    if (!integration?.access_token) {
        throw new Error('Integração Google Calendar não encontrada para este usuário.')
    }

    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        expiry_date: integration.expires_at ? new Date(integration.expires_at).getTime() : undefined,
    })

    // Auto-refresh token
    oauth2Client.on('tokens', async (tokens) => {
        const updates: Record<string, any> = {}
        if (tokens.access_token) updates.access_token = tokens.access_token
        if (tokens.expiry_date) updates.expires_at = new Date(tokens.expiry_date).toISOString()
        if (tokens.refresh_token) updates.refresh_token = tokens.refresh_token

        if (Object.keys(updates).length > 0) {
            await supabaseAdmin
                .from('user_integrations')
                .update(updates)
                .eq('user_id', userId)
                .eq('provider', 'google_calendar')
        }
    })

    return google.calendar({ version: 'v3', auth: oauth2Client })
}

// ─── Create Event ───────────────────────────────────────
export async function createCalendarEvent(
    userId: string,
    event: {
        summary: string
        description?: string
        startDateTime: string // ISO 8601
        endDateTime: string
        attendees?: string[]
    }
): Promise<calendar_v3.Schema$Event | null> {
    try {
        const calendar = await getCalendarClient(userId)

        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: event.summary,
                description: event.description,
                start: {
                    dateTime: event.startDateTime,
                    timeZone: 'America/Sao_Paulo',
                },
                end: {
                    dateTime: event.endDateTime,
                    timeZone: 'America/Sao_Paulo',
                },
                attendees: event.attendees?.map(email => ({ email })),
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 30 },
                    ],
                },
            },
        })

        return res.data
    } catch (error) {
        console.error('[Google Calendar] Erro ao criar evento:', error)
        return null
    }
}

// ─── Update Event ───────────────────────────────────────
export async function updateCalendarEvent(
    userId: string,
    eventId: string,
    updates: {
        summary?: string
        description?: string
        startDateTime?: string
        endDateTime?: string
        status?: 'confirmed' | 'cancelled'
    }
): Promise<calendar_v3.Schema$Event | null> {
    try {
        const calendar = await getCalendarClient(userId)

        const body: calendar_v3.Schema$Event = {}
        if (updates.summary) body.summary = updates.summary
        if (updates.description) body.description = updates.description
        if (updates.status) body.status = updates.status
        if (updates.startDateTime) {
            body.start = { dateTime: updates.startDateTime, timeZone: 'America/Sao_Paulo' }
        }
        if (updates.endDateTime) {
            body.end = { dateTime: updates.endDateTime, timeZone: 'America/Sao_Paulo' }
        }

        const res = await calendar.events.update({
            calendarId: 'primary',
            eventId,
            requestBody: body,
        })
        return res.data
    } catch (error) {
        console.error('[Google Calendar] Erro ao atualizar evento:', error)
        return null
    }
}

// ─── Delete Event ───────────────────────────────────────
export async function deleteCalendarEvent(
    userId: string,
    eventId: string
): Promise<boolean> {
    try {
        const calendar = await getCalendarClient(userId)
        await calendar.events.delete({
            calendarId: 'primary',
            eventId,
        })
        return true
    } catch (error) {
        console.error('[Google Calendar] Erro ao deletar evento:', error)
        return false
    }
}

// ─── List Events (Sync) ────────────────────────────────
export async function listCalendarEvents(
    userId: string,
    timeMin: string,
    timeMax: string
): Promise<calendar_v3.Schema$Event[]> {
    try {
        const calendar = await getCalendarClient(userId)

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100,
        })

        return res.data.items || []
    } catch (error) {
        console.error('[Google Calendar] Erro ao listar eventos:', error)
        return []
    }
}
