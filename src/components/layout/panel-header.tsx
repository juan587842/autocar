'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Menu, UserCircle, Bell, MessageSquare, Info, CheckCircle2, AlertTriangle, X, CheckCheck } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

type Notification = {
    id: string
    title: string
    description?: string
    type: 'info' | 'message' | 'success' | 'warning' | 'error'
    link?: string
    is_read: boolean
    created_at: string
}

const notificationIcon = (type: Notification['type']) => {
    const base = 'w-4 h-4'
    switch (type) {
        case 'message': return <MessageSquare className={`${base} text-blue-400`} />
        case 'success': return <CheckCircle2 className={`${base} text-green-400`} />
        case 'warning': return <AlertTriangle className={`${base} text-yellow-400`} />
        case 'error': return <AlertTriangle className={`${base} text-red-400`} />
        default: return <Info className={`${base} text-white/60`} />
    }
}

const notificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'message': return 'bg-blue-500/20'
        case 'success': return 'bg-green-500/20'
        case 'warning': return 'bg-yellow-500/20'
        case 'error': return 'bg-red-500/20'
        default: return 'bg-white/10'
    }
}

export function PanelHeader() {
    const router = useRouter()
    const supabase = createClient()
    const pathname = usePathname()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [user, setUser] = useState<User | null>(null)
    const [userRole, setUserRole] = useState<string>('Carregando...')
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])

    const unreadCount = notifications.filter(n => !n.is_read).length

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
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

                // Load initial notifications
                const { data: notifs } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(30)

                if (notifs) setNotifications(notifs as Notification[])

                // Subscribe to real-time inserts/updates for this user
                const channel = supabase
                    .channel(`notifications:${user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'notifications',
                            filter: `user_id=eq.${user.id}`,
                        },
                        (payload) => {
                            if (payload.eventType === 'INSERT') {
                                setNotifications(prev => [payload.new as Notification, ...prev])
                            } else if (payload.eventType === 'UPDATE') {
                                setNotifications(prev =>
                                    prev.map(n => n.id === (payload.new as Notification).id ? payload.new as Notification : n)
                                )
                            }
                        }
                    )
                    .subscribe()

                return () => {
                    supabase.removeChannel(channel)
                }
            }
        }
        fetchUser()
    }, [supabase])

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const markAllAsRead = async () => {
        if (!user) return
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    let pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'
    if (pathname.startsWith('/estoque/') && pathname.split('/').length === 3) {
        const idSegment = pathname.split('/').pop()
        if (idSegment && idSegment.length > 20) {
            pageTitle = 'Detalhes do Veículo'
        }
    }

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
                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-white/60 hover:text-white transition-colors group"
                            aria-label="Notificações"
                        >
                            <Bell className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D00] opacity-60" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF4D00] text-[9px] font-bold text-white items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-[#111111]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                                {/* Header */}
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm">
                                        Notificações {unreadCount > 0 && <span className="ml-1 text-[#FF4D00]">({unreadCount})</span>}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
                                        >
                                            <CheckCheck className="w-3 h-3" />
                                            Marcar lidas
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-[360px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/30">
                                            <Bell className="w-8 h-8" />
                                            <p className="text-sm">Nenhuma notificação</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => {
                                            const content = (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-white/[0.03]' : ''}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notificationColor(n.type)}`}>
                                                        {notificationIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm leading-tight truncate ${n.is_read ? 'text-white/60' : 'text-white font-medium'}`}>
                                                            {n.title}
                                                        </p>
                                                        {n.description && (
                                                            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.description}</p>
                                                        )}
                                                        <p className="text-[10px] text-white/30 mt-1.5 uppercase tracking-widest">
                                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                                        </p>
                                                    </div>
                                                    {!n.is_read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] mt-1.5 shrink-0" />
                                                    )}
                                                </div>
                                            )

                                            return n.link ? (
                                                <Link key={n.id} href={n.link} onClick={() => { markAsRead(n.id); setShowNotifications(false) }}>
                                                    {content}
                                                </Link>
                                            ) : content
                                        })
                                    )}
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
