'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Car, Info, Tag } from 'lucide-react'

const tabs = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Catálogo', href: '/catalogo', icon: Car },
    { label: 'Sobre', href: '/sobre', icon: Info },
    { label: 'Vender', href: '/venda-seu-veiculo', icon: Tag },
]

export function BottomBar() {
    const pathname = usePathname()

    // Hide bottom bar on detail pages (slug pages) and admin panel routes
    const segments = pathname.split('/').filter(Boolean)
    const isDetailPage = segments.length >= 2 && segments[0] === 'catalogo'

    const panelRoutes = [
        '/dashboard', '/inbox', '/agenda', '/clientes', '/estoque',
        '/vendas', '/ofertas', '/followup', '/campanhas', '/configuracoes'
    ]
    const isPanelRoute = panelRoutes.some(route => pathname.startsWith(route))

    if (isDetailPage || isPanelRoute) return null

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-glass-bg)] backdrop-blur-2xl border-t border-[var(--color-glass-border)] safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
                    const Icon = tab.icon
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className="relative flex flex-col items-center justify-center gap-1 w-16 py-1 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottombar-indicator"
                                    className="absolute -top-px left-2 right-2 h-0.5 rounded-full bg-[var(--color-accent)]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    y: isActive ? -2 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className={`transition-colors duration-300 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-glass-text-muted)]'}`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            <span
                                className={`text-[10px] font-medium transition-colors ${isActive
                                    ? 'text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {tab.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

