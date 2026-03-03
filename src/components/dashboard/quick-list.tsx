import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

export interface ListItem {
    id: string
    title: string
    subtitle: string
    badge?: string
    badgeColor?: 'green' | 'red' | 'blue' | 'orange' | 'default'
    icon?: LucideIcon
    avatar?: string
    time?: string
}

interface QuickListProps {
    title: string
    items: ListItem[]
    actionLabel?: string
    actionHref?: string
    onActionClick?: () => void
}

const badgeStyleMap = {
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    default: 'text-white/70 bg-white/10 border-white/10',
}

export function QuickList({ title, items, actionLabel = 'Ver todos', actionHref, onActionClick }: QuickListProps) {
    return (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {actionLabel && actionHref ? (
                    <Link
                        href={actionHref}
                        className="text-xs font-medium text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors"
                    >
                        {actionLabel}
                    </Link>
                ) : actionLabel && (
                    <button
                        onClick={onActionClick}
                        className="text-xs font-medium text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-sm">
                        Nenhum registro encontrado.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {/* Esquerda: Avatar ou Icono */}
                                {item.avatar ? (
                                    <img
                                        src={item.avatar}
                                        alt={item.title}
                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-white/10"
                                    />
                                ) : item.icon ? (
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 group-hover:text-white transition-colors">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-white/60 font-medium text-sm">
                                            {item.title.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {/* Meio: Textos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-white truncate">
                                            {item.title}
                                        </p>
                                        {item.badge && (
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyleMap[item.badgeColor || 'default']}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/50 truncate mt-0.5">
                                        {item.subtitle}
                                    </p>
                                </div>

                                {/* Direita: Tempo/Extra */}
                                {item.time && (
                                    <div className="text-xs text-white/30 whitespace-nowrap">
                                        {item.time}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
