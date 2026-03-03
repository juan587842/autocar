import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContaClient from './ContaClient'
import { LogoutButton } from './logout-button'
import { CarFront } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Minha Conta - AutoCar',
}

export default async function ContaPage() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    // Protected Route
    if (!session) {
        redirect('/conta/login')
    }

    // 1. Fetch User Data / Customer Data
    // We assume the auth.users.email matches customers.email, or we use phone.
    // For MVP, we get customer by checking auth email matching customer email.
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', session.user.email)
        .limit(1)
        .single()

    const customerId = customer?.id || null

    // 2. Fetch Buscas Ativas (Match Perfeito)
    const { data: preferences } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

    // 3. Fetch Agendamentos
    const { data: appointments } = await supabase
        .from('scheduling_sessions')
        .select(`
            *,
            vehicles (brand, model, year)
        `)
        .eq('client_phone', customer?.phone || 'none')
        .order('appointment_date', { ascending: true })

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12">
            {/* Header / Navbar simplificado do cliente */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF4D00] to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                        <CarFront className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold font-heading text-white tracking-tight">AutoCar</span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-[#FF4D00]">
                            {customer?.full_name?.charAt(0) || session.user.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white/80 font-medium text-sm hidden sm:block">
                            {customer?.full_name || session.user.email}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-white/20 mx-2 hidden sm:block"></div>
                    <LogoutButton />
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 mt-8 animate-fade-in relative z-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold font-heading text-white">Minha Conta</h1>
                    <p className="text-white/50 mt-1">Gerencie suas preferências, alertas e agendamentos de visita.</p>
                </div>

                <ContaClient
                    initialPreferences={preferences || []}
                    initialAppointments={appointments || []}
                    customerId={customerId}
                />
            </main>

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
                <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#FF4D00]/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>
        </div>
    )
}
