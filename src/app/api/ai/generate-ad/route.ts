import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || ''
})

export async function POST(req: Request) {
    try {
        const { vehicleId } = await req.json()
        const supabase = await createClient()

        // Authorization check to ensure only authenticated panel users can generate ads
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_fields(label, value)')
            .eq('id', vehicleId)
            .single()

        if (error || !vehicle) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
        }

        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)
        const customFieldsText = vehicle.vehicle_fields ? vehicle.vehicle_fields.map((f: any) => `${f.label}: ${f.value}`).join(', ') : ''

        const prompt = `Você é um estrategista de vendas e especialista em marketing automotivo premium.
Sua tarefa é redigir a legenda perfeita para um anúncio de Instagram/Marketplace focada em vender o seguinte veículo:

[DADOS DO CARRO]
- Marca/Modelo: ${vehicle.brand} ${vehicle.model}
- Fab/Modelo: ${vehicle.year_fab}/${vehicle.year_model}
- Preço: ${formattedPrice}
- Quilometragem: ${vehicle.mileage} km
- Câmbio: ${vehicle.transmission}
- Combustível: ${vehicle.fuel}
- Cor: ${vehicle.color}
- Outros diferenciais: ${customFieldsText}

[DIRETRIZES DO ANÚNCIO]
1. Use um gancho emocional forte na primeira linha (H1/Headline) para chamar a atenção.
2. Destaque os diferenciais competitivos e por que esse carro é uma excelente escolha.
3. Formatação atraente com espaçamento limpo e emojis estratégicos (mas com elegância).
4. Insira um Call to Action (CTA) claro no final chamando para o Direct ou Link na Bio.
5. Inclua 5 ou 6 hashtags relevantes para o nicho de revenda automotiva.

Não inclua textos de confirmação ("Aqui está o texto:"), retorne apenas a cópia publicatária final.`

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
        })

        // Log the AI usage via the triggers we created (implicitly done via action if we decide to log AI usage, 
        // but system_logs currently tracks DB changes. We won't log ad gen in DB for now to save space).

        return NextResponse.json({ text })

    } catch (error) {
        console.error('[GenerateAd API]', error)
        return NextResponse.json({ error: 'Erro interno ao processar IA' }, { status: 500 })
    }
}
