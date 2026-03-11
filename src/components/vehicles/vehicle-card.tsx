'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui'
import { Scale } from 'lucide-react'
import { useComparatorStore } from '@/store/useComparatorStore'

interface VehicleCardProps {
    id: string
    brand: string
    model: string
    yearFab: number
    yearModel: number
    price: number
    mileage: number
    slug: string
    color: string
    transmission: string
    fuel: string
    imageUrl?: string
    status: string
    category?: string
    condition?: string
}

export function VehicleCard({
    id,
    brand,
    model,
    yearFab,
    yearModel,
    price,
    mileage,
    slug,
    transmission,
    fuel,
    imageUrl,
    status,
    condition,
}: VehicleCardProps) {
    const { selectedVehicleIds, toggleVehicle } = useComparatorStore()
    const isSelected = selectedVehicleIds.includes(id)

    const formatBrand = (b: string) => {
        if (!b) return ''
        const lower = b.toLowerCase()
        if (['bmw', 'jac', 'ram'].includes(lower)) return lower.toUpperCase()
        if (lower === 'caoa_chery' || lower === 'caoa chery') return 'CAOA Chery'
        if (lower === 'mercedes') return 'Mercedes-Benz'
        if (lower === 'land_rover' || lower === 'land rover') return 'Land Rover'
        return lower.charAt(0).toUpperCase() + lower.slice(1)
    }

    const formattedBrand = formatBrand(brand)

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(price)

    const formattedMileage = new Intl.NumberFormat('pt-BR').format(mileage)

    const transmissionLabel = {
        manual: 'Manual',
        automatic: 'Automático',
        cvt: 'CVT',
        automated: 'Automatizado',
    }[transmission] || transmission

    const fuelLabel = {
        flex: 'Flex',
        gasoline: 'Gasolina',
        ethanol: 'Etanol',
        diesel: 'Diesel',
        electric: 'Elétrico',
        hybrid: 'Híbrido',
    }[fuel] || fuel

    return (
        <Link href={`/catalogo/${slug}`} className="group block">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--color-glass-bg)] backdrop-blur-2xl border border-[var(--color-glass-border)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[var(--color-glass-border-hover)] hover:shadow-[0_0_30px_var(--color-glass-glow-orange)]">

                {/* Inner Glows */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[var(--color-glass-glow-orange)] rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-[var(--color-glass-glow-blue)] rounded-full blur-[60px] pointer-events-none" />

                {/* Image Wrap */}
                <div className="relative aspect-[16/10] bg-[var(--color-glass-input)] overflow-hidden relative z-10 m-2 mt-2 rounded-[1rem] border border-[var(--color-glass-border)]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`${formattedBrand} ${model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-50">🚗</div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant={status === 'available' ? 'success' : 'warning'} dot>
                            {status === 'available' ? 'Disponível' : 'Reservado'}
                        </Badge>
                    </div>
                    {/* Comparator Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleVehicle(id); }}
                        className={`absolute top-3 right-3 p-2.5 rounded-full border backdrop-blur-md transition-all z-20 ${isSelected ? 'bg-[#FF4D00] border-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20' : 'bg-black/50 border-white/20 text-white/70 hover:bg-black/80 hover:text-white hover:border-white/40'}`}
                        title={isSelected ? "Remover do comparador" : "Adicionar ao comparador"}
                    >
                        <Scale className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 relative z-10">
                    <div>
                        <h3 className="text-base font-bold text-[var(--color-glass-text)] group-hover:text-[var(--color-accent)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                            {formattedBrand} {model}
                        </h3>
                        <p className="text-sm text-[var(--color-glass-text-dim)]">
                            {yearFab}/{yearModel}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-glass-text-muted)]">
                        {condition && <span className="px-2 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium border border-[var(--color-accent)]/20">{condition === 'novo' ? '0km' : 'Seminovo'}</span>}
                        <span className="px-2 py-1 rounded-lg bg-[var(--color-glass-inner)] border border-[var(--color-glass-border)]">{transmissionLabel}</span>
                        <span className="px-2 py-1 rounded-lg bg-[var(--color-glass-inner)] border border-[var(--color-glass-border)]">{fuelLabel}</span>
                        <span className="px-2 py-1 rounded-lg bg-[var(--color-glass-inner)] border border-[var(--color-glass-border)]">{formattedMileage} km</span>
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t border-[var(--color-glass-border)]">
                        <p className="text-lg font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {formattedPrice}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
