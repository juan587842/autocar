'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    CarFront,
    Trello,
    Settings,
    Calendar,
    Tags,
    RefreshCw,
    Send,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Estoque', href: '/estoque', icon: CarFront },
    { name: 'Vendas', href: '/vendas', icon: Trello },
    { name: 'Ofertas', href: '/ofertas', icon: Tags },
    { name: 'Follow-Up', href: '/followup', icon: RefreshCw },
    { name: 'Campanhas', href: '/campanhas', icon: Send },
]

export function PanelSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0A0A0A]/80 backdrop-blur-3xl hidden lg:flex flex-col z-40">
            {/* Logo Area */}
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/10 blur-[40px] rounded-full pointer-events-none" />
                <h1 className="text-xl font-bold tracking-tight text-white relative z-10">
                    Auto<span className="text-[#FF4D00]">Car</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col p-4 gap-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon
                                className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-[#FF4D00]' : 'text-white/40 group-hover:text-white/70'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/10 mt-auto">
                <Link
                    href="/configuracoes"
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings className="h-5 w-5 shrink-0 text-white/40 group-hover:text-white/70 transition-colors" />
                    Configurações
                </Link>
            </div>
        </aside>
    )
}
