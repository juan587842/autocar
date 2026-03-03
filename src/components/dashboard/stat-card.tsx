import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <div className="relative group overflow-hidden rounded-[1.5rem] bg-white/[0.03] border border-white/10 p-6 backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20">
            {/* Spotlight no hover */}
            <div className="absolute -inset-px bg-gradient-to-tr from-white/0 via-white/0 to-white/0 group-hover:from-white/0 group-hover:via-[#FF4D00]/10 group-hover:to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none rounded-[1.5rem]" />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/50">{title}</h3>
                <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/60 group-hover:text-[#FF4D00] transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
                {trend && (
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.isPositive
                                ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                                : 'text-red-400 bg-red-400/10 border border-red-400/20'
                            }`}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>

            {description && (
                <p className="mt-2 text-xs text-white/40">{description}</p>
            )}
        </div>
    )
}
