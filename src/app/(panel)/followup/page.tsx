'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Calendar, Car, HelpCircle, Loader2, MessageSquare, ChevronRight, User, AlertCircle } from 'lucide-react'
import { format, differenceInDays, isFuture, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TabType = 'inativos' | 'agendamentos' | 'wishlist' | 'sem_conversao'

interface Deal {
    id: string
    customer_id: string
    vehicle_id: string | null
    stage_id: string
    amount: number
    notes: string | null
    updated_at: string
    created_at: string
    customer?: {
        name: string
        phone: string
        email: string
    }
    stage?: {
        name: string
        color: string
        order: number
    }
    vehicle?: {
        brand: string
        model: string
        year: number
    }
}

interface Activity {
    id: string
    deal_id: string | null
    customer_id: string
    type: string
    title: string
    due_date: string
    completed_at: string | null
    customer?: {
        name: string
        phone: string
    }
    deal?: {
        stage_id: string
        stage?: {
            name: string
            color: string
        }
    }
}

interface PreferenceMatch {
    id: string
    customer_id: string
    brand: string | null
    model: string | null
    customer?: {
        name: string
        phone: string
    }
    matches: {
        id: string
        brand: string
        model: string
        version: string
        year: number
        price: number
    }[]
}

export default function FollowUpDashboard() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<TabType>('inativos')
    const [isLoading, setIsLoading] = useState(true)

    // Data lists
    const [inativos, setInativos] = useState<Deal[]>([])
    const [lembretes, setLembretes] = useState<Activity[]>([])
    const [wishlist, setWishlist] = useState<PreferenceMatch[]>([])
    const [perdidos, setPerdidos] = useState<Deal[]>([])

    useEffect(() => {
        fetchData()
    }, [activeTab])

    async function fetchData() {
        setIsLoading(true)
        switch (activeTab) {
            case 'inativos':
                await fetchInativos()
                break
            case 'agendamentos':
                await fetchLembretes()
                break
            case 'wishlist':
                await fetchWishlist()
                break
            case 'sem_conversao':
                await fetchPerdidos()
                break
        }
        setIsLoading(false)
    }

    async function fetchInativos() {
        // Busca deals nos estágios iniciais sem atualização recente (ex: > 2 dias)
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

        const { data } = await supabase
            .from('deals')
            .select(`
                *,
                customer:customers(name, phone, email),
                stage:deal_stages(name, color, "order"),
                vehicle:vehicles(brand, model, year)
            `)
            .lte('updated_at', twoDaysAgo.toISOString())
            .order('updated_at', { ascending: true })

        // Filtra via frontend os deals cujos "order" (do stage) indicam início do funil (ex. Lead Novo, Em Atendimento)
        if (data) {
            const initialStagesData = data.filter((d: any) => d.stage?.order <= 2)
            setInativos(initialStagesData)
        }
    }

    async function fetchLembretes() {
        // Busca atividades do tipo meeting ou call que não foram completadas
        const { data } = await supabase
            .from('activities')
            .select(`
                *,
                customer:customers(name, phone),
                deal:deals(stage_id, stage:deal_stages(name, color))
            `)
            .in('type', ['meeting', 'call'])
            .is('completed_at', null)
            .order('due_date', { ascending: true })

        if (data) setLembretes(data)
    }

    async function fetchWishlist() {
        // Puxa as preferências ativas
        const { data: prefs } = await supabase
            .from('customer_preferences')
            .select(`
                *,
                customer:customers(name, phone)
            `)
            .eq('is_active', true)

        if (!prefs) return

        // Para simplificar: buscar todos veículos disponíveis no estoque
        const { data: cars } = await supabase
            .from('vehicles')
            .select('id, brand, model, version, year, price')
            .eq('status', 'disponivel')

        if (!cars) return

        const matchedPrefs: PreferenceMatch[] = []

        prefs.forEach((p: any) => {
            // Lógica simples de match
            const matches = cars.filter(c => {
                const matchBrand = !p.brand || c.brand.toLowerCase() === p.brand.toLowerCase()
                const matchModel = !p.model || c.model.toLowerCase().includes(p.model.toLowerCase())
                const matchMinYear = !p.min_year || c.year >= p.min_year
                const matchMaxYear = !p.max_year || c.year <= p.max_year
                
                // Se cliente informou apenas marca/modelo, cruza apenas isso por enquanto.
                return matchBrand && matchModel && matchMinYear && matchMaxYear
            })

            if (matches.length > 0) {
                matchedPrefs.push({
                    id: p.id,
                    customer_id: p.customer_id,
                    brand: p.brand,
                    model: p.model,
                    customer: p.customer,
                    matches: matches.slice(0, 3) // Exibe os 3 primeiros matches
                })
            }
        })

        setWishlist(matchedPrefs)
    }

    async function fetchPerdidos() {
        // Deals com "veículo alvo" preenchido e estágio "Perdido"
        const { data } = await supabase
            .from('deals')
            .select(`
                *,
                customer:customers(name, phone, email),
                stage:deal_stages(name, color, "order"),
                vehicle:vehicles(brand, model, year)
            `)
            .not('vehicle_id', 'is', null)
            .order('updated_at', { ascending: false })

        // Filtra pelo order alto assumindo que o maior order é o status "Perdido" ou inativo. 
        // No seed atual Perdida é order 6.
        if (data) {
            const perdidosData = data.filter((d: any) => d.stage?.order >= 6)
            setPerdidos(perdidosData)
        }
    }

    const unformatPhone = (phone: string) => phone.replace(/\D/g, '')

    const handleSendWhatsapp = (phone: string, text: string) => {
        if (!phone) return alert('Cliente sem telefone cadastrado.')
        const formattedPhone = unformatPhone(phone)
        const url = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    // --- RENDERIZADORES DE TABS ---

    const renderInativos = () => (
        <div className="grid gap-4 mt-6">
            {inativos.length === 0 ? (
                <EmptyState icon={<Clock className="w-10 h-10 opacity-40 m-auto" />} text="Nenhum cliente esquecido." sub="Todos os leads novos receberam atendimento recente." />
            ) : inativos.map(deal => {
                const daysInative = differenceInDays(new Date(), new Date(deal.updated_at))
                return (
                    <Card key={deal.id} indicatorColor={deal.stage?.color || '#555'}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-white/40" /> {deal.customer?.name}
                                </h3>
                                <p className="text-white/50 text-sm mt-1">Estágio atual: <span style={{ color: deal.stage?.color }}>{deal.stage?.name}</span></p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded">Sem contato há {daysInative} dias</span>
                                    {deal.vehicle && <span className="text-xs bg-white/5 text-white/50 border border-white/10 px-2 py-1 rounded">{deal.vehicle.brand} {deal.vehicle.model}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleSendWhatsapp(deal.customer?.phone || '', `Olá ${deal.customer?.name?.split(' ')[0]}, tudo bem? Como posso te ajudar hoje com a escolha do seu carro?`)}
                                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Retomar Contato
                            </button>
                        </div>
                    </Card>
                )
            })}
        </div>
    )

    const renderLembretes = () => (
        <div className="grid gap-4 mt-6">
            {lembretes.length === 0 ? (
                <EmptyState icon={<Calendar className="w-10 h-10 opacity-40 m-auto" />} text="Sua agenda está limpa!" sub="Nenhum agendamento pendente para os próximos dias." />
            ) : lembretes.map(act => {
                const date = act.due_date ? new Date(act.due_date) : new Date()
                const past = isPast(date)
                return (
                    <Card key={act.id} indicatorColor={past ? '#ef4444' : '#eab308'}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-white/40" /> {act.customer?.name}
                                </h3>
                                <p className="text-white/80 text-sm mt-1 font-medium">{act.title}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded border ${past ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSendWhatsapp(act.customer?.phone || '', `Olá ${act.customer?.name?.split(' ')[0]}, passando para confirmar nosso agendamento: ${act.title} para o dia ${format(date, 'dd/MM/yyyy')}. Tudo certo?`)}
                                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Confirmar
                            </button>
                        </div>
                    </Card>
                )
            })}
        </div>
    )

    const renderWishlist = () => (
        <div className="grid gap-4 mt-6">
            {wishlist.length === 0 ? (
                <EmptyState icon={<Car className="w-10 h-10 opacity-40 m-auto" />} text="Nenhum Match Encontrado." sub="Nenhum veículo novo no estoque cruza com a lista de desejos atual." />
            ) : wishlist.map(pref => (
                <Card key={pref.id} indicatorColor="#a855f7">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <div className="flex justify-between items-center w-full">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-white/40" /> {pref.customer?.name}
                                </h3>
                                <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded">Match de Wishlist ✨</span>
                            </div>
                            <p className="text-white/50 text-sm mt-1">
                                Procurava por: <strong>{pref.brand} {pref.model}</strong>
                            </p>
                            
                            <div className="mt-3 space-y-2">
                                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Veículos Recentes em Estoque</p>
                                {pref.matches.map(car => (
                                    <div key={car.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-sm text-white font-medium">{car.brand} {car.model} {car.version}</p>
                                            <p className="text-xs text-white/40">{car.year} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(car.price)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSendWhatsapp(pref.customer?.phone || '', `Olá ${pref.customer?.name?.split(' ')[0]}, lembra daquele ${pref.brand} ${pref.model} que você estava procurando? Temos algumas novidades no estoque que acabaram de chegar! Gostaria de ver as fotos?`)}
                                            className="text-white/40 hover:text-[#25D366] transition-colors p-2 bg-white/5 rounded-md hover:bg-[#25D366]/10"
                                            title="Enviar Sugestão"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )

    const renderPerdidos = () => (
        <div className="grid gap-4 mt-6">
            {perdidos.length === 0 ? (
                <EmptyState icon={<HelpCircle className="w-10 h-10 opacity-40 m-auto" />} text="Sem Leads na Fila Quarentena." sub="Ninguém perguntou sobre veículos e parou de responder." />
            ) : perdidos.map(deal => {
                const daysInative = differenceInDays(new Date(), new Date(deal.updated_at))
                return (
                    <Card key={deal.id} indicatorColor="#ef4444">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-white/40" /> {deal.customer?.name}
                                </h3>
                                <p className="text-white/50 text-sm mt-1">Interessado no <strong>{deal.vehicle?.brand} {deal.vehicle?.model}</strong> e sumiu há {daysInative} dias.</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded">
                                        <AlertCircle className="w-3 h-3" /> Frio / Perdido
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSendWhatsapp(deal.customer?.phone || '', `Olá ${deal.customer?.name?.split(' ')[0]}, tudo bem? Chegou a verificar aquele ${deal.vehicle?.model} que te enviei? Abaixamos o preço dele essa semana, quer dar mais uma olhada?`)}
                                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Tentar Resgate
                            </button>
                        </div>
                    </Card>
                )
            })}
        </div>
    )

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold font-heading text-white">Tarefas e Follow-Up</h1>
                <p className="text-white/60 text-sm mt-1">Gerencie leads ociosos, agendamentos e oportunidades de resgate no Kanban.</p>
            </div>

            {/* TAB BAR NAVIGATION */}
            <div className="flex overflow-x-auto hidden-scrollbar pb-2 pt-2 gap-2 border-b border-white/10">
                <TabButton active={activeTab === 'inativos'} onClick={() => setActiveTab('inativos')} icon={<Clock className="w-4 h-4" />} label="Esquecidos" count={activeTab === 'inativos' ? inativos.length : undefined} />
                <TabButton active={activeTab === 'agendamentos'} onClick={() => setActiveTab('agendamentos')} icon={<Calendar className="w-4 h-4" />} label="Agenda (Hoje/Amanhã)" count={activeTab === 'agendamentos' ? lembretes.length : undefined} />
                <TabButton active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} icon={<Car className="w-4 h-4" />} label="Fila de Espera (Wishlist)" count={activeTab === 'wishlist' ? wishlist.length : undefined} />
                <TabButton active={activeTab === 'sem_conversao'} onClick={() => setActiveTab('sem_conversao')} icon={<HelpCircle className="w-4 h-4" />} label="Interesse Perdido" count={activeTab === 'sem_conversao' ? perdidos.length : undefined} />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#FF4D00] animate-spin" />
                </div>
            ) : (
                <div className="animate-fade-in">
                    {activeTab === 'inativos' && renderInativos()}
                    {activeTab === 'agendamentos' && renderLembretes()}
                    {activeTab === 'wishlist' && renderWishlist()}
                    {activeTab === 'sem_conversao' && renderPerdidos()}
                </div>
            )}
        </div>
    )
}

// Composants auxilaires internos para o layout

const TabButton = ({ active, onClick, icon, label, count }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
            active 
                ? 'bg-white/5 border-[#FF4D00] text-white shadow-[inset_0_-1px_0_0_#FF4D00]' 
                : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
        }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span className={`ml-1 text-xs w-5 h-5 flex items-center justify-center rounded-full ${active ? 'bg-[#FF4D00] text-white' : 'bg-white/10 text-white/40'}`}>
                {count}
            </span>
        )}
    </button>
)

const EmptyState = ({ icon, text, sub }: any) => (
    <div className="text-center py-20 text-white/40 bg-white/5 border border-white/10 rounded-2xl border-dashed">
        <div className="mb-4 text-[#FF4D00]/60">{icon}</div>
        <p className="text-lg font-medium text-white/80">{text}</p>
        <p className="text-sm mt-1">{sub}</p>
    </div>
)

const Card = ({ children, indicatorColor }: { children: React.ReactNode, indicatorColor: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: indicatorColor }} />
        <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: indicatorColor }} />
        <div className="pl-3 relative z-10">
            {children}
        </div>
    </div>
)
