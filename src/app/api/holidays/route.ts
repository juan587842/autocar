import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa a API pública de feriados brasileiros "brasilapi.com.br"
const BRASIL_API_URL = 'https://brasilapi.com.br/api/feriados/v1'

export async function POST(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Importar feriados do ano atual e próximo
        const currentYear = new Date().getFullYear()
        const years = [currentYear, currentYear + 1]

        let totalInserted = 0

        for (const year of years) {
            const res = await fetch(`${BRASIL_API_URL}/${year}`)
            if (!res.ok) continue

            const holidays: Array<{ date: string; name: string; type: string }> = await res.json()

            for (const holiday of holidays) {
                const { error } = await supabaseAdmin
                    .from('holidays')
                    .upsert(
                        {
                            title: holiday.name,
                            date: holiday.date,
                            recurring: true,
                        },
                        { onConflict: 'date' }
                    )

                if (!error) totalInserted++
            }
        }

        return NextResponse.json({
            success: true,
            message: `${totalInserted} feriados importados/atualizados para ${years.join(' e ')}.`,
        })
    } catch (error: any) {
        console.error('[Holidays Import] Erro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao importar feriados' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabaseAdmin
            .from('holidays')
            .select('*')
            .order('date', { ascending: true })

        if (error) throw error

        return NextResponse.json({ holidays: data })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar feriados' },
            { status: 500 }
        )
    }
}
