// =======================================================
// AI Agent Tools — Tools do Agente de IA
// Story E3.S2 — Agente de IA (AI SDK v6)
// =======================================================

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { sendMedia } from '@/lib/evolution'
import { createCalendarEvent } from '@/lib/google-calendar'

// Admin client (sem RLS) para operações do agente
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ============================================
// 1. searchVehicles — Busca veículos e verifica disponibilidade
// ============================================
export const searchVehicles = tool({
    description: 'ÚNICA ferramenta para checar disponibilidade de veículos, estoque ou procurar opções. Use para encontrar qualquer carro. Obrigatório o uso antes de confirmar ou negar estoque.',
    inputSchema: z.object({
        brand: z.array(z.string()).optional().describe('Marcas a pesquisar. Ex: ["Toyota", "Honda"]. Envie todas as marcas desejadas no array.'),
        model: z.array(z.string()).optional().describe('Modelos a pesquisar. Ex: ["Corolla", "Nivus", "Polo"]. Envie TODOS os modelos desejados no array para buscar múltiplos carros de uma vez.'),
        minPrice: z.number().optional().describe('Preço mínimo em reais'),
        maxPrice: z.number().optional().describe('Preço máximo em reais'),
        minYear: z.number().optional().describe('Ano mínimo de fabricação'),
        maxYear: z.number().optional().describe('Ano máximo de fabricação'),
        fuel: z.string().optional().describe('Tipo de combustível (flex, gasolina, diesel, elétrico, híbrido)'),
        transmission: z.string().optional().describe('Tipo de câmbio (manual, automático, CVT)'),
    }),
    execute: async (input) => {
        console.log('[AI Tool] searchVehicles input:', input)
        const supabase = getSupabase()

        let query = supabase
            .from('vehicles')
            .select(`
                id, brand, model, year_fab, year_model, price, mileage, fuel, transmission, color, status, slug,
                vehicle_photos ( url, is_cover )
            `)
            .eq('status', 'available')
            .order('price', { ascending: true })
            .limit(10)

        if (input.brand && input.brand.length > 0) {
            const orQuery = input.brand.map((b: string) => `brand.ilike.%${b}%`).join(',')
            query = query.or(orQuery)
        }
        if (input.model && input.model.length > 0) {
            const orQuery = input.model.map((m: string) => `model.ilike.%${m}%`).join(',')
            query = query.or(orQuery)
        }
        if (input.minPrice) query = query.gte('price', input.minPrice)
        if (input.maxPrice) query = query.lte('price', input.maxPrice)
        if (input.minYear) query = query.gte('year_fab', input.minYear)
        if (input.maxYear) query = query.lte('year_fab', input.maxYear)
        if (input.fuel) query = query.ilike('fuel', `%${input.fuel}%`)
        if (input.transmission) query = query.ilike('transmission', `%${input.transmission}%`)

        const { data, error } = await query

        if (error) {
            console.error('[AI Tool] searchVehicles error:', error.message)
            return { vehicles: [] as any[], count: 0, message: 'Erro ao buscar veículos.' }
        }

        return {
            vehicles: (data || []).map(v => {
                const photos = v.vehicle_photos as any[] || [];
                const mainImage = photos.find(p => p.is_cover)?.url || photos[0]?.url || '';

                return {
                    id: v.id,
                    nome: `${v.brand} ${v.model} ${v.year_fab}/${v.year_model}`,
                    preco: `R$ ${Number(v.price).toLocaleString('pt-BR')}`,
                    km: v.mileage ? `${Number(v.mileage).toLocaleString('pt-BR')} km` : 'Não informado',
                    combustivel: v.fuel || 'Flex',
                    cambio: v.transmission || 'Não informado',
                    cor: v.color || 'Não informada',
                    slug: v.slug,
                    imagem: mainImage
                }
            }),
            count: data?.length || 0,
            message: data?.length ? `Encontrei ${data.length} veículo(s) disponível(is).` : 'Nenhum veículo encontrado com esses critérios.',
        }
    },
})

// ============================================
// 2. sendVehicleImages — Envia fotos reais via WhatsApp
// ============================================
export const sendVehicleImages = tool({
    description: 'Envia as fotos reais de um veículo diretamente no WhatsApp do cliente. Use SEMPRE após encontrar veículos com searchVehicles para enviar as imagens. Isso envia a imagem real, não um link.',
    inputSchema: z.object({
        vehicleId: z.string().describe('ID do veículo para enviar as fotos'),
        phone: z.string().describe('Número do WhatsApp do cliente (o mesmo número da conversa atual, ex: 5512991448266)'),
        vehicleName: z.string().optional().describe('Nome do veículo para usar como legenda (ex: Honda HR-V 2023/2024)'),
    }),
    execute: async (input) => {
        console.log('[AI Tool] sendVehicleImages input:', input)
        const supabase = getSupabase()

        // Buscar fotos do veículo
        const { data: photos, error } = await supabase
            .from('vehicle_photos')
            .select('url, is_cover')
            .eq('vehicle_id', input.vehicleId)
            .order('is_cover', { ascending: false })
            .limit(5)

        if (error || !photos || photos.length === 0) {
            console.error('[AI Tool] sendVehicleImages: sem fotos', error?.message)
            return { sent: false, count: 0, message: 'Não encontrei fotos deste veículo para enviar.' }
        }

        // Enviar cada foto via Evolution API (sendMedia)
        const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'autocar'
        let sentCount = 0

        for (const photo of photos) {
            try {
                const caption = sentCount === 0 && input.vehicleName
                    ? `📸 ${input.vehicleName}`
                    : ''
                await sendMedia(input.phone, photo.url, caption, 'image', instanceName)
                sentCount++
                // Pequeno delay entre fotos para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 800))
            } catch (err: any) {
                console.error('[AI Tool] sendVehicleImages: erro ao enviar foto', err.message)
            }
        }

        return {
            sent: sentCount > 0,
            count: sentCount,
            message: sentCount > 0
                ? `Enviei ${sentCount} foto(s) do veículo diretamente no WhatsApp do cliente.`
                : 'Não consegui enviar as fotos. Tente novamente.'
        }
    },
})

// A ferramenta checkAvailability foi removida para reduzir a sobrecarga cognitiva da IA. Todo processo de verificação de estoque e veículos agora ocorre via searchVehicles.

// ============================================
// 3. scheduleVisit — Agenda visita
// ============================================
export const scheduleVisit = tool({
    description: 'Agenda uma visita do cliente à loja para ver um veículo. Solicite nome, email e data/horário do cliente. NÃO peça telefone, pois você já tem o número do WhatsApp.',
    inputSchema: z.object({
        customerName: z.string().describe('Nome completo do cliente'),
        customerEmail: z.string().describe('Email do cliente (para convite no Google Calendar)'),
        customerPhone: z.string().describe('Número do WhatsApp do cliente (o mesmo número da conversa atual, que você já sabe)'),
        date: z.string().describe('Data da visita no formato YYYY-MM-DD'),
        time: z.string().describe('Horário da visita no formato HH:MM'),
        vehicleId: z.string().optional().describe('ID ÚNICO (UUID) do veículo que foi retornado na busca (ex: 550e8400-e29b-41d4-a716-446655440000). OBRIGATÓRIO se o cliente estiver interessado em um veículo específico.'),
        vehicleName: z.string().optional().describe('Nome do veículo de interesse (ex: Jeep Compass Longitude T270 2021/2022)'),
        notes: z.string().optional().describe('Observações adicionais'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        // Montar datetime no fuso correto
        const scheduledAt = new Date(`${input.date}T${input.time}:00-03:00`)

        // Verificar se é horário comercial (segunda a sexta 8-18, sabado 8-12)
        const day = scheduledAt.getDay() // 0=dom, 6=sab
        const hour = scheduledAt.getHours()

        if (day === 0) {
            return { scheduled: false, message: 'Desculpe, não funcionamos aos domingos. Gostaria de agendar para outro dia?' }
        }
        if (day === 6 && (hour < 8 || hour >= 12)) {
            return { scheduled: false, message: 'Aos sábados funcionamos das 8h às 12h. Podemos ajustar o horário?' }
        }
        if (day >= 1 && day <= 5 && (hour < 8 || hour >= 18)) {
            return { scheduled: false, message: 'Nosso horário é de 8h às 18h de segunda a sexta. Podemos ajustar?' }
        }

        // Resolver ou criar customer + salvar email
        let customerId: string | null = null
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', input.customerPhone)
            .limit(1)
            .single()

        if (existingCustomer) {
            customerId = existingCustomer.id
            // Atualizar email e nome do cliente
            await supabase
                .from('customers')
                .update({ email: input.customerEmail, full_name: input.customerName })
                .eq('id', customerId)
        } else {
            const { data: newCustomer } = await supabase
                .from('customers')
                .insert({
                    full_name: input.customerName,
                    phone: input.customerPhone,
                    email: input.customerEmail,
                    source: 'whatsapp_ai',
                })
                .select('id')
                .single()
            customerId = newCustomer?.id || null
        }

        // Validar vehicleId (deve ser UUID válido, IA pode alucinar valores como "1")
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const validVehicleId = input.vehicleId && uuidRegex.test(input.vehicleId) ? input.vehicleId : null

        // Buscar seller padrão (primeiro usuário do sistema)
        let sellerId: string | null = null
        try {
            // Tentar via user_integrations (quem conectou Google Calendar)
            const { data: integration } = await supabase
                .from('user_integrations')
                .select('user_id')
                .limit(1)
                .single()
            if (integration?.user_id) {
                sellerId = integration.user_id
            }
        } catch { }
        if (!sellerId) {
            // Fallback: buscar qualquer appointment existente para pegar um seller_id
            try {
                const { data: existingAppt } = await supabase
                    .from('appointments')
                    .select('seller_id')
                    .not('seller_id', 'is', null)
                    .limit(1)
                    .single()
                if (existingAppt?.seller_id) sellerId = existingAppt.seller_id
            } catch { }
        }
        if (!sellerId) {
            console.error('[AI Tool] scheduleVisit: seller_id não encontrado')
            return { scheduled: false, message: 'Erro interno ao agendar. Tente novamente ou ligue para a loja.' }
        }

        // Criar o appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                customer_id: customerId,
                vehicle_id: validVehicleId,
                seller_id: sellerId,
                scheduled_at: scheduledAt.toISOString(),
                duration_min: 30,
                status: 'scheduled',
                notes: input.notes || `Agendamento via IA - ${input.customerName}`,
            })
            .select('id')
            .single()

        if (error) {
            console.error('[AI Tool] scheduleVisit error:', error.message)
            return { scheduled: false, message: 'Houve um erro ao agendar. Por favor, tente novamente ou fale com um de nossos vendedores.' }
        }

        // Vincular o veículo ao Deal ativo no Kanban
        if (validVehicleId) {
            try {
                const { data: latestDeal } = await supabase
                    .from('deals')
                    .select('id, deal_stages!inner(name)')
                    .eq('customer_id', customerId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                const isDealActive = latestDeal &&
                    (latestDeal as any).deal_stages?.name !== 'Ganha' &&
                    (latestDeal as any).deal_stages?.name !== 'Perdida'

                if (isDealActive) {
                    await supabase
                        .from('deals')
                        .update({ vehicle_id: validVehicleId })
                        .eq('id', latestDeal.id)
                }
            } catch (err) {
                console.warn('[AI Tool] Falha ao atualizar deal com vehicle_id:', err)
            }
        }

        // Criar evento no Google Calendar com o cliente como convidado
        let calendarEventCreated = false
        try {
            // Buscar o primeiro user admin para usar seu Google Calendar
            const { data: adminUser } = await supabase
                .from('user_integrations')
                .select('user_id')
                .eq('provider', 'google_calendar')
                .eq('is_active', true)
                .limit(1)
                .single()

            if (adminUser) {
                const endAt = new Date(scheduledAt.getTime() + 30 * 60 * 1000) // +30 min
                const vehicleInfo = input.vehicleName || 'Veículo'

                await createCalendarEvent(adminUser.user_id, {
                    summary: `🚗 Visita: ${input.customerName} — ${vehicleInfo}`,
                    description: `Visita agendada via WhatsApp (IA).\nCliente: ${input.customerName}\nEmail: ${input.customerEmail}\nTelefone: ${input.customerPhone}\nVeículo: ${vehicleInfo}`,
                    startDateTime: scheduledAt.toISOString(),
                    endDateTime: endAt.toISOString(),
                    attendees: [input.customerEmail],
                })
                calendarEventCreated = true
            }
        } catch (calErr: any) {
            console.error('[AI Tool] scheduleVisit: erro ao criar evento no Google Calendar', calErr.message)
        }

        const dateFormatted = scheduledAt.toLocaleDateString('pt-BR')
        const timeFormatted = scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

        return {
            scheduled: true,
            appointmentId: appointment?.id,
            calendarInvite: calendarEventCreated,
            message: `✅ Visita agendada com sucesso!\n\n📅 Data: ${dateFormatted}\n🕐 Horário: ${timeFormatted}\n👤 Nome: ${input.customerName}${calendarEventCreated ? '\n📬 Convite enviado para: ' + input.customerEmail : ''}\n\nEstamos aguardando sua visita! Se precisar reagendar, é só avisar.`,
        }
    },
})

// ============================================
// 4. getStoreInfo — Informações da loja
// ============================================
export const getStoreInfo = tool({
    description: 'Retorna informações da loja como endereço, horário de funcionamento, formas de pagamento e telefone.',
    inputSchema: z.object({
        infoType: z.enum(['all', 'hours', 'address', 'payment', 'contact']).describe('Tipo de informação desejada'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        const { data: settings } = await supabase
            .from('store_settings')
            .select('*')
            .limit(1)
            .single()

        const info = {
            nome: settings?.store_name || 'AutoCar',
            endereco: settings?.address || 'Endereço não configurado',
            telefone: settings?.phone || 'Não configurado',
            horario: settings?.business_hours || 'Segunda a Sexta, 8h às 18h | Sábado, 8h às 12h',
            pagamento: 'Financiamento bancário, à vista, consórcio, troca com ou sem troco',
            cnpj: settings?.cnpj || '',
        }

        switch (input.infoType) {
            case 'hours': return { info: `🕐 Horário: ${info.horario}` }
            case 'address': return { info: `📍 Endereço: ${info.endereco}` }
            case 'payment': return { info: `💳 Formas de pagamento: ${info.pagamento}` }
            case 'contact': return { info: `📞 Telefone: ${info.telefone}` }
            default: return { info: `📍 ${info.nome}\nEndereço: ${info.endereco}\nTelefone: ${info.telefone}\nHorário: ${info.horario}\nPagamento: ${info.pagamento}` }
        }
    },
})

// ============================================
// 5. saveInterest — Salva interesse do cliente
// ============================================
export const saveInterest = tool({
    description: 'Salva que o cliente demonstrou interesse em um veículo específico (ID existente no estoque), para follow-up posterior.',
    inputSchema: z.object({
        customerPhone: z.string().describe('Telefone do cliente'),
        vehicleId: z.string().describe('ID do veículo de interesse'),
        notes: z.string().optional().describe('Observações sobre o interesse'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        // Encontrar customer pelo phone
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', input.customerPhone)
            .limit(1)
            .single()

        if (!customer) {
            return { saved: false, message: 'Cliente não encontrado. O interesse será registrado quando possível.' }
        }

        // Inserir interesse
        const { error } = await supabase
            .from('customer_interests')
            .insert({
                customer_id: customer.id,
                vehicle_id: input.vehicleId,
                notes: input.notes || 'Demonstrou interesse via WhatsApp IA',
            })

        if (error) {
            console.error('[AI Tool] saveInterest error:', error.message)
            return { saved: false, message: 'Erro ao salvar interesse.' }
        }

        return { saved: true, message: 'Interesse registrado! Nossa equipe pode entrar em contato com mais detalhes.' }
    },
})

// ============================================
// 5.5 savePreferences — Salva características genéricas
// ============================================
export const savePreferences = tool({
    description: 'Salva características de um veículo que o cliente busca, mas que NÃO temos no estoque atual. O sistema avisará o cliente quando um veículo compatível chegar (Match Perfeito).',
    inputSchema: z.object({
        customerPhone: z.string().describe('Telefone do cliente (para localizar no banco)'),
        brand: z.string().optional().describe('Marca desejada'),
        model: z.string().optional().describe('Modelo desejado'),
        maxPrice: z.number().optional().describe('Preço máximo que o cliente quer pagar'),
        color: z.string().optional().describe('Cor desejada'),
        bodyType: z.string().optional().describe('Categoria do carro (Hatch, Sedan, SUV, etc)'),
        transmission: z.string().optional().describe('Tipo de câmbio (Automático, Manual)'),
        minYear: z.number().optional().describe('Ano mínimo'),
        maxYear: z.number().optional().describe('Ano máximo'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        // Encontrar customer
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', input.customerPhone)
            .limit(1)
            .single()

        if (!customer) {
            return { saved: false, message: 'Não achei o cliente para salvar as preferências.' }
        }

        const { error } = await supabase
            .from('customer_preferences')
            .insert({
                customer_id: customer.id,
                brand: input.brand,
                model: input.model,
                max_price: input.maxPrice,
                color: input.color,
                body_type: input.bodyType,
                transmission: input.transmission,
                min_year: input.minYear,
                max_year: input.maxYear,
                is_active: true
            })

        if (error) {
            console.error('[AI Tool] savePreferences error:', error.message)
            return { saved: false, message: 'Erro ao salvar preferências.' }
        }

        return {
            saved: true,
            message: 'Preferência capturada com sucesso nas listas de desejos! O robô deve informar o cliente que avisaremos assim que algo semelhante chegar.'
        }
    },
})

// ============================================
// 6. transferToHuman — Transferência para humano
// ============================================
export const transferToHuman = tool({
    description: 'Transfere a conversa para um atendente humano. Use quando o cliente pedir para falar com alguém, demonstrar frustração, ou o assunto for complexo demais.',
    inputSchema: z.object({
        conversationId: z.string().describe('ID da conversa atual'),
        reason: z.enum(['customer_request', 'frustration', 'complex_topic', 'negotiation', 'unable_to_resolve'])
            .describe('Motivo da transferência'),
        summary: z.string().describe('Resumo da conversa até agora para o atendente'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        // Atualizar status da conversa
        const { error } = await supabase
            .from('conversations')
            .update({
                status: 'waiting_human',
                ai_enabled: false,
                metadata: {
                    transfer_reason: input.reason,
                    transfer_summary: input.summary,
                    transferred_at: new Date().toISOString(),
                },
            })
            .eq('id', input.conversationId)

        if (error) {
            console.error('[AI Tool] transferToHuman error:', error.message)
            return { transferred: false, message: 'Erro ao transferir. Tente novamente.' }
        }

        return {
            transferred: true,
            message: 'Vou transferir você para um de nossos especialistas que poderá te ajudar melhor! 🙋‍♂️ Aguarde um momento, por favor.',
        }
    },
})

// ============================================
// 7. checkOfferStatus — Verifica status de proposta
// ============================================
export const checkOfferStatus = tool({
    description: 'Verifica o status de uma proposta de venda de veículo enviada previamente pelo cliente.',
    inputSchema: z.object({
        phone: z.string().describe('Telefone do cliente no formato DDD+999999999 para consultar a proposta'),
    }),
    execute: async (input) => {
        const supabase = getSupabase()

        // O number que vem do whatsapp está como 55+telefone (ex: 5511987654321)
        // input.phone deve vir como 11987654321
        // Tentar formatar com o 55 igual ao banco
        const formattedPhone = input.phone.startsWith('55') ? input.phone : `55${input.phone.replace(/\D/g, '')}`

        const { data: offer } = await supabase
            .from('vehicle_offers')
            .select('brand, model, status, created_at')
            .eq('phone', formattedPhone)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (!offer) {
            return {
                found: false,
                message: 'Não localizei, em meu sistema de propostas, nenhuma avaliação para este número. Se você acabou de enviar no formulário, aguarde alguns instantes ou confira se enviou com este mesmo número do WhatsApp.'
            }
        }

        const dateFormatted = new Date(offer.created_at).toLocaleDateString('pt-BR')

        const mapStatus = (status: string) => {
            switch (status) {
                case 'new': return 'recebida e aguardando triagem pela nossa equipe.'
                case 'reviewing': return 'atualmente em análise pelos nossos avaliadores.'
                case 'accepted': return 'aprovada em pré-avaliação! 🥳 O time já deve ter entrado (ou entrará) em contato para agendar a vistoria.'
                case 'rejected': return 'analisada, mas no momento o perfil do veículo não se encaixa no nosso estoque atual. Agradecemos a preferência!'
                case 'contacted': return 'triada e nossa equipe já assumiu o contato com você referente a ela!'
                default: return 'registrada no nosso sistema.'
            }
        }

        return {
            found: true,
            status: offer.status,
            message: `Localizei a sua proposta do **${offer.brand} ${offer.model}**, enviada em ${dateFormatted}. A proposta está **${mapStatus(offer.status)}**`
        }
    },
})

// Export all tools as object for AI SDK
export const agentTools = {
    searchVehicles,
    sendVehicleImages,
    scheduleVisit,
    getStoreInfo,
    saveInterest,
    savePreferences,
    transferToHuman,
    checkOfferStatus,
}
