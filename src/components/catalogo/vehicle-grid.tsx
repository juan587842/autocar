'use client'

import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { motion } from 'framer-motion'
import { PackageOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useSearchParams } from 'next/navigation'

interface VehicleGridProps {
    vehicles: any[]
    totalPages: number
}

export function VehicleGrid({ vehicles, totalPages }: VehicleGridProps) {
    const searchParams = useSearchParams()
    const currentPage = Number(searchParams.get('page')) || 1

    if (vehicles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-[var(--color-border)] border-dashed rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)]/50">
                <PackageOpen size={48} className="text-[var(--color-text-muted)] mb-4 opacity-50" />
                <h3 className="text-lg font-bold mb-2">Nenhum veículo encontrado</h3>
                <p className="text-[var(--color-text-secondary)] text-sm max-w-sm mb-6">
                    Não conseguimos encontrar veículos com os filtros selecionados. Tente ajustar sua busca.
                </p>
                <Button variant="secondary" onClick={() => window.location.href = '/catalogo'}>
                    Limpar Filtros
                </Button>
            </div>
        )
    }

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `/catalogo?${params.toString()}`
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {vehicles.map((v, i) => (
                    <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <VehicleCard
                            id={v.id}
                            brand={v.brand}
                            model={v.model}
                            yearFab={v.year_fab}
                            yearModel={v.year_model}
                            price={v.price}
                            mileage={v.mileage || 0}
                            slug={v.slug}
                            color={v.color || ''}
                            transmission={v.transmission || ''}
                            fuel={v.fuel || ''}
                            imageUrl={v.vehicle_photos?.find((p: any) => p.is_cover)?.url || v.vehicle_photos?.[0]?.url}
                            status={v.status}
                            category={v.vehicle_categories?.name}
                            condition={v.condition}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-auto">
                    <Link
                        href={createPageUrl(Math.max(1, currentPage - 1))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                            ? 'opacity-50 pointer-events-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                            : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                            }`}
                    >
                        Anterior
                    </Link>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Link
                                key={page}
                                href={createPageUrl(page)}
                                className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-md ${currentPage === page
                                    ? 'bg-[var(--color-accent)] text-white'
                                    : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>

                    <Link
                        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                            ? 'opacity-50 pointer-events-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                            : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'
                            }`}
                    >
                        Próxima
                    </Link>
                </div>
            )}
        </div>
    )
}
