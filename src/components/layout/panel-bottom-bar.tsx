'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Menu,
    X,
    Users,
    CarFront,
    Trello,
    Tags,
    RefreshCw,
    Send,
    Settings
} from 'lucide-react'

const mainTabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
]

const moreMenu = [
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Estoque', href: '/estoque', icon: CarFront },
    { name: 'Vendas', href: '/vendas', icon: Trello },
    { name: 'Ofertas', href: '/ofertas', icon: Tags },
    { name: 'Follow-Up', href: '/followup', icon: RefreshCw },
    { name: 'Campanhas', href: '/campanhas', icon: Send },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function PanelBottomBar() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Hide panel bottom bar if NOT in panel routes
    const panelRoutes = [
        '/dashboard', '/inbox', '/agenda', '/clientes', '/estoque',
        '/vendas', '/ofertas', '/followup', '/campanhas', '/configuracoes'
    ]
    const isPanelRoute = panelRoutes.some(route => pathname.startsWith(route))

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    if (!isPanelRoute) return null

    return (
        <>
            {/* The Main Bottom Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/10 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {mainTabs.map((tab) => {
                        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
                        const Icon = tab.icon
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="relative flex flex-col items-center justify-center gap-1 w-16 py-1 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="panel-bottombar-indicator"
                                        className="absolute -top-px left-2 right-2 h-[2px] rounded-full bg-[#FF4D00]"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        y: isActive ? -2 : 0,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className={`transition-colors duration-300 ${isActive ? 'text-[#FF4D00]' : 'text-white/50 group-hover:text-white/80'}`}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </motion.div>
                                <span
                                    className={`text-[10px] font-semibold transition-colors ${isActive
                                        ? 'text-[#FF4D00]'
                                        : 'text-white/50'
                                        }`}
                                >
                                    {tab.name}
                                </span>
                            </Link>
                        )
                    })}

                    {/* More Button (+) */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative flex flex-col items-center justify-center gap-1 w-16 py-1 group"
                    >
                        <motion.div
                            animate={{ rotate: isMenuOpen ? 45 : 0 }}
                            className={`transition-colors duration-300 ${isMenuOpen ? 'text-[#FF4D00]' : 'text-white/50 group-hover:text-white/80'}`}
                        >
                            <Menu size={26} strokeWidth={isMenuOpen ? 2.5 : 2} />
                        </motion.div>
                        <span className={`text-[10px] font-semibold transition-colors ${isMenuOpen ? 'text-[#FF4D00]' : 'text-white/50'}`}>
                            Menu
                        </span>
                    </button>
                </div>
            </nav>

            {/* Slide-out Drawer for More Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="lg:hidden fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer content */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed bottom-16 left-0 right-0 z-[55] bg-[#111111]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-3xl pb-safe shadow-2xl overflow-hidden"
                            style={{ maxHeight: 'calc(100vh - 8rem)' }}
                        >
                            <div className="p-4 pt-6 overflow-y-auto max-h-[70vh]">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h3 className="text-lg font-bold text-white">Mais opções</h3>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 px-1 mb-6">
                                    {moreMenu.map((item) => {
                                        const isActive = pathname.startsWith(item.href)
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${isActive
                                                    ? 'bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-white'
                                                    : 'bg-white/5 border border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-[#FF4D00]' : 'text-white/50'}`} />
                                                <span className="font-semibold text-sm">{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
