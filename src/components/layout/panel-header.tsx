'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Menu, UserCircle, Bell, CarFront, Calendar, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function PanelHeader() {
    const router = useRouter()
    const supabase = createClient()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [userRole, setUserRole] = useState<string>('Carregando...')
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                // Busca o role na tabela users
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    const rolesMap: Record<string, string> = {
                        owner: 'Proprietário',
                        manager: 'Gerente',
                        seller: 'Vendedor'
                    }
                    setUserRole(rolesMap[data.role] || data.role)
                }
            }
        }
        fetchUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    // Pega o último segmento da URL para o título (ex: /clientes -> Clientes)
    const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-3xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button className="p-2 text-white/60 hover:text-white lg:hidden">
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6">
                {/* Header Title */}
                <h2 className="text-xl font-semibold capitalize text-white">
                    {pageTitle}
                </h2>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Botão de Notificações Central (Mock) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-white/60 hover:text-white transition-colors group"
                        >
                            <Bell className="h-6 w-6" />
                            {/* Badget com pulse e quantidade fake de notificações */}
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black text-[8px] font-bold text-white items-center justify-center">
                                    3
                                </span>
                            </span>
                        </button>

                        {/* Dropdown de Notificações (Glassmorphism) */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                    <h3 className="font-bold text-white">Notificações</h3>
                                    <span className="text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors">Marcar todas como lidas</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">

                                    {/* Notification Mock 1 */}
                                    <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                            <CarFront className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/90 font-medium leading-tight">Nova Oferta Recebida!</p>
                                            <p className="text-xs text-white/50 mt-1 line-clamp-2">Carlos Eduardo ofereceu <strong>R$ 115.000</strong> num Compass L. 2022.</p>
                                            <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">Há 5 min</p>
                                        </div>
                                    </div>

                                    {/* Notification Mock 2 */}
                                    <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/90 font-medium leading-tight">Visita Agendada: Hoje 15h</p>
                                            <p className="text-xs text-white/50 mt-1 line-clamp-2">Lembrete: Visita agendada de Mariana Costa para o Polo Highline 2023.</p>
                                            <p className="text-[10px] text-blue-400 mt-2 font-bold uppercase tracking-widest">Há 2 horas</p>
                                        </div>
                                    </div>

                                    {/* Notification Mock 3 */}
                                    <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                            <MessageSquare className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/90 font-medium leading-tight">Robô em Ação</p>
                                            <p className="text-xs text-white/50 mt-1 line-clamp-2">O Auto Cérebro qualificou 2 novos leads do Instagram nas últimas 1h.</p>
                                            <p className="text-[10px] text-green-400 mt-2 font-bold uppercase tracking-widest">Ontem</p>
                                        </div>
                                    </div>

                                </div>
                                <div className="p-3 border-t border-white/10 bg-black/20 text-center">
                                    <button className="text-sm font-medium text-white/80 hover:text-white transition-colors">Ver Central Completa</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" aria-hidden="true" />

                    {/* User Profile Area */}
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                        <span className="text-sm font-semibold leading-5 text-white">
                            {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                        </span>
                        <span className="text-xs leading-4 text-[#FF4D00]">
                            {userRole}
                        </span>
                    </div>

                    <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60">
                        <UserCircle className="h-5 w-5" />
                    </div>

                    <div className="h-6 w-[1px] bg-white/10" aria-hidden="true" />

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-red-400 transition-colors group"
                    >
                        <LogOut className="h-5 w-5 bg-white/5 group-hover:bg-red-500/10 p-1 rounded-md transition-colors" />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
