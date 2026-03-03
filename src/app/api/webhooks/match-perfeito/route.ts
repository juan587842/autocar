import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendText } from '@/lib/evolution'

export async function POST(req: Request) {
    try {
        const payload = await req.json()

        // Ensure it's an INSERT on vehicles
        if (payload.type !== 'INSERT' || payload.table !== 'vehicles') {
            return NextResponse.json({ message: 'Ignored: not a vehicle insert' }, { status: 200 })
        }

        const vehicle = payload.record
        if (!vehicle) {
            return NextResponse.json({ message: 'No vehicle data' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch automation setting to see if Match Perfeito is active and get sensitivity
        const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('*')
            .limit(1)
            .single()

        // Assume automations field exists in store_settings as JSON, or default
        const automations = storeSettings?.automations || {}
        if (automations.matchPerfeito === false) {
            return NextResponse.json({ message: 'Match Perfeito automation is disabled' }, { status: 200 })
        }

        const sensitivity = automations.matchSensitivity || 3

        // Fetch active preferences
        const { data: preferences, error } = await supabase
            .from('customer_preferences')
            .select(`
                *,
                customer:customers(phone, full_name)
            `)
            .eq('is_active', true)

        if (error || !preferences) {
            return NextResponse.json({ message: 'Error fetching preferences' }, { status: 500 })
        }

        let matchCount = 0

        for (const pref of preferences) {
            let score = 0

            if (pref.brand && vehicle.brand?.toLowerCase() === pref.brand.toLowerCase()) score++
            if (pref.model && vehicle.model?.toLowerCase() === pref.model.toLowerCase()) score++
            if (pref.color && vehicle.color?.toLowerCase() === pref.color.toLowerCase()) score++
            if (pref.body_type && vehicle.body_type?.toLowerCase() === pref.body_type.toLowerCase()) score++
            if (pref.transmission && vehicle.transmission?.toLowerCase() === pref.transmission.toLowerCase()) score++

            // For year and price, they are boundaries, so if it fits, it's a match.
            // If the user specified min_year but vehicle is >= min_year, it satisfies the condition.
            if (pref.min_year && vehicle.year >= pref.min_year) score++
            if (pref.max_year && vehicle.year <= pref.max_year) score++
            if (pref.max_price && vehicle.price <= pref.max_price) score++

            if (score >= sensitivity) {
                // IT'S A MATCH!
                // customer mapping returns an object or array in Supabase js depending on 1:1 vs 1:N.
                // customers is 1:N reference backwards, so it returns single object if FK is straight.
                // @ts-ignore
                const customerData = Array.isArray(pref.customer) ? pref.customer[0] : pref.customer

                const customerPhone = customerData?.phone
                const customerName = customerData?.full_name?.split(' ')[0] || 'Cliente'

                if (customerPhone) {
                    const message = `🚘 *Match Perfeito, ${customerName}!*\n\nAcaba de chegar em nosso estoque um veículo que bate com suas preferências:\n\n*${vehicle.brand} ${vehicle.model} ${vehicle.year}*\nCor: ${vehicle.color || 'Não informada'}\nPreço: R$ ${Number(vehicle.price).toLocaleString('pt-BR')}\n\nConheça mais detalhes e fotos exclusivas agendando uma visita conosco!`

                    const evoInstance = process.env.EVOLUTION_INSTANCE_NAME || 'autocar'
                    await sendText(customerPhone, message, evoInstance)
                    matchCount++
                }
            }
        }

        return NextResponse.json({ message: 'Matches processed', matchCount }, { status: 200 })

    } catch (error: any) {
        console.error('[Webhook Match Perfeito] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
