import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { QuickList } from '@/components/dashboard/quick-list'
import { Car, Users, TrendingUp, CalendarCheck } from 'lucide-react'

// --- FALLBACK MOCKS ---
const chartData = [
    { label: 'Out', value: 8 },
    { label: 'Nov', value: 12 },
    { label: 'Dez', value: 18 },
    { label: 'Jan', value: 15 },
    { label: 'Fev', value: 22 },
    { label: 'Mar', value: 14 },
]

// Removido followUpsMock, pois agora consultamos os agendamentos do banco
// --- FIM MOCKS ---

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isSeller = false
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        isSeller = userData?.role === 'seller'
    }

    // 1. Fetch Veículos Totais
    const { count: vehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })

    // 2. Fetch Clientes Totais
    let customersQuery = supabase.from('customers').select('*', { count: 'exact', head: true })
    if (isSeller && user) {
        customersQuery = customersQuery.eq('assigned_to', user.id)
    }
    const { count: customersCount } = await customersQuery

    // 3. Fetch Ofertas Recebidas
    const { count: offersCount } = await supabase
        .from('vehicle_offers')
        .select('*', { count: 'exact', head: true })

    // 4. Últimos Leads Reais (Limit 4)
    let leadsQuery = supabase
        .from('customers')
        .select('*, customer_tag_links(customer_tags(*))')
        .order('created_at', { ascending: false })
        .limit(4)

    if (isSeller && user) {
        leadsQuery = leadsQuery.eq('assigned_to', user.id)
    }
    const { data: latestLeads } = await leadsQuery

    // 5. Agendamentos de Hoje (Follow-ups)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let appointmentsQuery = supabase
        .from('appointments')
        .select('*, customers(full_name, phone)')
        .gte('scheduled_at', startOfToday.toISOString())
        .lte('scheduled_at', endOfToday.toISOString())
        .not('status', 'in', '("cancelled", "no_show")')
        .order('scheduled_at', { ascending: true })
        .limit(3)

    if (isSeller && user) {
        appointmentsQuery = appointmentsQuery.eq('seller_id', user.id)
    }
    const { data: todayAppointments } = await appointmentsQuery

    const totalVehicles = vehiclesCount || 0
    const totalLeads = customersCount || 0
    const totalOffers = offersCount || 0

    // Mapeando leads do banco
    const mapLeadsToQuickList = (customers: any[]) => {
        if (!customers || customers.length === 0) {
            return []
        }
        return customers.map(c => {
            const firstTag = c.customer_tag_links?.[0]?.customer_tags
            return {
                id: c.id,
                title: c.full_name || 'Desconhecido',
                subtitle: c.source || 'Website',
                badge: firstTag?.name || 'Novo',
                badgeColor: (firstTag?.color === '#ef4444' ? 'red' : 'blue') as 'red' | 'blue' | 'green' | 'orange',
                time: new Date(c.created_at).toLocaleDateString()
            }
        })
    }

    const dbLeads = mapLeadsToQuickList(latestLeads || [])

    // Mapeando Appointments para a formato da QuickList de FollowUps
    const dbFollowUps = (todayAppointments || []).map((app: any) => ({
        id: app.id,
        title: app.customers?.full_name || 'Desconhecido',
        subtitle: app.notes || 'Agendamento Confirmado',
        action: 'WhatsApp',
        time: new Date(app.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        icon: CalendarCheck
    }));

    if (dbFollowUps.length === 0) {
        dbFollowUps.push({ id: 'empty', title: 'Tudo Limpo!', subtitle: 'Sem follow-ups pendentes para hoje.', action: '', time: '', icon: CalendarCheck })
    }

    const dashboardStats = [
        { title: 'Total em Estoque', value: totalVehicles.toString(), icon: Car, trend: { value: 5, isPositive: true }, desc: 'Total cadastrado' },
        { title: 'Total de Clientes', value: totalLeads.toString(), icon: Users, trend: { value: 12, isPositive: true }, desc: 'Na base CRM' },
        { title: 'Ofertas Recebidas', value: totalOffers.toString(), icon: TrendingUp, trend: { value: 2, isPositive: false }, desc: 'Pelo formulário site' },
        { title: 'Agendamentos Hoje', value: todayAppointments?.length.toString() || '0', icon: CalendarCheck, desc: 'Próximos passos' },
    ]

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Visão Geral
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF4D00]">Server Connected</span>
                </h1>
                <p className="text-white/60">
                    Acompanhe as métricas de desempenho e próximos passos da loja.
                </p>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, i) => (
                    <StatCard
                        key={i}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                        description={stat.desc}
                    />
                ))}
            </div>

            {/* Middle Section: Chart (2/3) + Leads (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[350px]">
                    <SalesChart data={chartData} title="Vendas por Mês" subtitle="Desempenho dos últimos 6 meses" />
                </div>

                <div className="h-[350px]">
                    <QuickList title="Últimos Leads" actionHref="/clientes" items={dbLeads} />
                </div>
            </div>

            {/* Bottom Section: Follow-ups */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[300px]">
                    <QuickList title="Agendamentos de Hoje" actionHref="/agenda" items={dbFollowUps} />
                </div>
            </div>
        </div>
    )
}
