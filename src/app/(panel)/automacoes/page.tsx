import { createClient } from '@/lib/supabase/server'
import AutomacoesClient from './AutomacoesClient'

export const metadata = {
    title: 'Automações e Gatilhos - AutoCar Painel',
}

export default async function AutomacoesPage() {
    const supabase = await createClient()

    // Buscar configurações de automação
    const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

    // Setup initial state se não existir
    const defaultAutomations = {
        birthdayCampaign: false,
        birthdayTemplate: 'Parabéns {nome}! A AutoCar te deseja felicidades no seu dia especial! 🎉',
        matchPerfeito: true,
        matchSensitivity: 3, // >= 3 matches required
        stockClearance: false,
        stockClearanceTemplate: 'Olá {nome}, temos uma oferta especial para o veículo que você procurou: {marca} {modelo}!'
    }

    const automations = storeSettings?.automations || defaultAutomations

    return <AutomacoesClient initialAutomations={automations} storeSettingsId={storeSettings?.id} />
}
