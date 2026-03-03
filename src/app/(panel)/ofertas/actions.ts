'use server'

import { createClient } from '@/lib/supabase/server'
import { sendText } from '@/lib/evolution'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(offerId: string, phone: string, customerName: string, vehicleName: string) {
    const supabase = await createClient()

    // 1. Atualizar status da oferta para 'accepted'
    const { error } = await supabase
        .from('vehicle_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId)

    if (error) {
        console.error('Erro ao aceitar oferta:', error)
        return { success: false, message: 'Erro ao aceitar a oferta.' }
    }

    // 2. Enviar notificação via WhatsApp para o cliente
    const message = `Olá, ${customerName}! Ótimas notícias! 🎉\nSua proposta de venda para o *${vehicleName}* foi pré-aprovada pela nossa equipe da AutoCar.\n\nUm de nossos avaliadores entrará em contato por aqui para agendarmos a vistoria presencial.`

    try {
        await sendText(phone, message)
    } catch (err) {
        console.error('Erro ao enviar WhatsApp:', err)
        // Não falhamos a action se o whats falhar
    }

    revalidatePath('/ofertas')
    return { success: true, message: 'Oferta aceita com sucesso.' }
}

export async function rejectOffer(offerId: string, phone: string, customerName: string, vehicleName: string) {
    const supabase = await createClient()

    // 1. Atualizar status da oferta para 'rejected'
    const { error } = await supabase
        .from('vehicle_offers')
        .update({ status: 'rejected' })
        .eq('id', offerId)

    if (error) {
        console.error('Erro ao recusar oferta:', error)
        return { success: false, message: 'Erro ao recusar a oferta.' }
    }

    // 2. Enviar notificação via WhatsApp para o cliente
    const message = `Olá, ${customerName}.\nAgradecemos muito por oferecer o seu *${vehicleName}* para a AutoCar.\n\nFizemos uma análise detalhada, mas no momento o perfil do veículo não se encaixa no nosso estoque atual e não poderemos seguir com a compra.\n\nAgradecemos a oportunidade e ficamos à disposição!`

    try {
        await sendText(phone, message)
    } catch (err) {
        console.error('Erro ao enviar WhatsApp:', err)
        // Não falhamos a action se o whats falhar
    }

    revalidatePath('/ofertas')
    return { success: true, message: 'Oferta recusada com sucesso.' }
}

export async function contactOfferCustomer(phone: string, customerName: string) {
    const supabase = await createClient()

    // 1. Buscar se existe cliente
    let customerId = ''
    let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .limit(1)
        .single()

    if (customer) {
        customerId = customer.id
    } else {
        // Criar cliente
        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({ name: customerName, phone: phone })
            .select('id')
            .single()

        if (insertError || !newCustomer) {
            console.error('Erro ao criar cliente:', insertError)
            return { success: false, message: 'Erro ao criar cliente para a conversa.' }
        }
        customerId = newCustomer.id
    }

    // 2. Buscar conversa ativa
    let conversationId = ''
    let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .limit(1)
        .single()

    if (conversation) {
        conversationId = conversation.id
        // Pausar IA
        await supabase.from('conversations').update({ ai_enabled: false }).eq('id', conversationId)
    } else {
        // Criar conversa pausando IA
        const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({ customer_id: customerId, status: 'active', ai_enabled: false })
            .select('id')
            .single()

        if (convError || !newConv) {
            return { success: false, message: 'Erro ao criar conversa.' }
        }
        conversationId = newConv.id
    }

    return { success: true, conversationId }
}
