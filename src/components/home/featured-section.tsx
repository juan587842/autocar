'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/vehicle-card'

interface Vehicle {
    id: string
    brand: string
    model: string
    year_fab: number
    year_model: number
    price: number
    mileage: number
    slug: string
    color: string
    transmission: string
    fuel: string
    status: string
    vehicle_photos: { url: string; is_cover: boolean }[]
    vehicle_categories: { name: string } | null
    condition?: string
}

export function FeaturedSection({ vehicles }: { vehicles: Vehicle[] }) {
    if (!vehicles.length) return null

    return (
        <section className="py-16 sm:py-20 bg-[var(--color-bg-secondary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-end justify-between mb-10"
                >
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Destaques
                        </h2>
                        <p className="text-[var(--color-text-secondary)]">
                            Os veículos mais procurados da semana
                        </p>
                    </div>
                    <Link
                        href="/catalogo"
                        className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:gap-3 transition-all group"
                    >
                        Ver todos
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle, i) => (
                        <motion.div
                            key={vehicle.slug}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                        >
                            <VehicleCard
                                id={vehicle.id}
                                brand={vehicle.brand}
                                model={vehicle.model}
                                yearFab={vehicle.year_fab}
                                yearModel={vehicle.year_model}
                                price={vehicle.price}
                                mileage={vehicle.mileage || 0}
                                slug={vehicle.slug}
                                color={vehicle.color || ''}
                                transmission={vehicle.transmission || ''}
                                fuel={vehicle.fuel || ''}
                                imageUrl={vehicle.vehicle_photos?.find(p => p.is_cover)?.url || vehicle.vehicle_photos?.[0]?.url}
                                status={vehicle.status}
                                category={vehicle.vehicle_categories?.name}
                                condition={vehicle.condition}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="sm:hidden mt-8 text-center">
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all"
                    >
                        Ver todos os veículos
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    )
}
