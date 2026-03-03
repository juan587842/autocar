import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VehicleGallery } from '@/components/vehicles/vehicle-gallery'
import { VehicleSpecs } from '@/components/vehicles/vehicle-specs'
import { WhatsAppButton } from '@/components/vehicles/whatsapp-button'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { Badge } from '@/components/ui'

async function getVehicle(slug: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_photos(*), vehicle_categories(name, slug)')
            .eq('slug', slug)
            .is('deleted_at', null)
            .single()
        if (error) {
            console.error('[getVehicle] Supabase error for slug:', slug, error)
            return null
        }
        // Fetch vehicle_fields separately since there's no FK relationship PostgREST can discover
        if (data) {
            const { data: fields } = await supabase
                .from('vehicle_fields')
                .select('*')
                .eq('vehicle_id', data.id)
            data.vehicle_fields = fields || []
        }
        return data
    } catch (err) {
        console.error('[getVehicle] Exception for slug:', slug, err)
        return null
    }
}

async function getSimilarVehicles(categoryId: string, currentId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('vehicles')
        .select('*, vehicle_photos(url, is_cover), vehicle_categories(name)')
        .eq('category_id', categoryId)
        .neq('id', currentId)
        .is('deleted_at', null)
        .in('status', ['available', 'reserved'])
        .limit(3)
    return data || []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const vehicle = await getVehicle(slug)
    if (!vehicle) return { title: 'Veículo não encontrado — AutoCar' }

    const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.price)
    const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year_fab}/${vehicle.year_model} — AutoCar`
    const description = `${vehicle.brand} ${vehicle.model} ${vehicle.year_fab}/${vehicle.year_model} por ${price}. ${vehicle.mileage ? new Intl.NumberFormat('pt-BR').format(vehicle.mileage) + ' km.' : ''} Veja fotos e detalhes.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: vehicle.vehicle_photos?.find((p: any) => p.is_cover)?.url
                ? [{ url: vehicle.vehicle_photos.find((p: any) => p.is_cover)!.url }]
                : [],
        },
    }
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const vehicle = await getVehicle(slug)
    if (!vehicle) notFound()

    const similar = await getSimilarVehicles(vehicle.category_id, vehicle.id)

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(vehicle.price)

    const customFields = (vehicle.vehicle_fields || []).map((f: any) => ({
        label: f.label,
        value: f.value,
    }))

    return (
        <>
            <Header />
            <main className="pt-20 pb-24 lg:pb-16 min-h-screen bg-[var(--color-bg-primary)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link href="/catalogo" className="inline-flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors">
                            <ArrowLeft size={14} />
                            Catálogo
                        </Link>
                        <span>/</span>
                        {vehicle.vehicle_categories && (
                            <>
                                <Link href={`/catalogo?categoria=${vehicle.vehicle_categories.slug}`} className="hover:text-[var(--color-accent)] transition-colors">
                                    {vehicle.vehicle_categories.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-[var(--color-text-primary)] font-medium">{vehicle.brand} {vehicle.model}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left: Gallery + Specs */}
                        <div className="lg:col-span-2 space-y-8">
                            <VehicleGallery
                                photos={vehicle.vehicle_photos || []}
                                brand={vehicle.brand}
                                model={vehicle.model}
                            />
                            <VehicleSpecs vehicle={vehicle} customFields={customFields} />
                        </div>

                        {/* Right: Price Card (sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--color-glass-bg)] backdrop-blur-2xl border border-[var(--color-glass-border)] p-6 space-y-5 shadow-2xl">
                                    {/* Inner Glows */}
                                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--color-glass-glow-orange)] rounded-full blur-[50px] pointer-events-none" />
                                    <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-[var(--color-glass-glow-blue)] rounded-full blur-[60px] pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                                                {vehicle.brand} {vehicle.model}
                                            </h1>
                                            <Badge variant={vehicle.status === 'available' ? 'success' : 'warning'} dot>
                                                {vehicle.status === 'available' ? 'Disponível' : 'Reservado'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            {vehicle.year_fab}/{vehicle.year_model}
                                            {vehicle.vehicle_categories && ` · ${vehicle.vehicle_categories.name}`}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-3 border-t border-[var(--color-glass-border)]">
                                        <p className="text-xs text-[var(--color-glass-text-dim)] mb-1">Preço</p>
                                        <p className="text-3xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
                                            {formattedPrice}
                                        </p>
                                    </div>

                                    {/* WhatsApp CTA */}
                                    <div className="relative z-10">
                                        <WhatsAppButton vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year_fab}/${vehicle.year_model}`} />
                                    </div>

                                    {/* Actions */}
                                    <div className="relative z-10 flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[1rem] bg-[var(--color-glass-inner)] text-[var(--color-glass-text-muted)] text-sm font-medium hover:bg-[var(--color-glass-input)] border border-[var(--color-glass-border)] transition-colors cursor-pointer">
                                            <Heart size={16} />
                                            Favoritar
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[1rem] bg-[var(--color-glass-inner)] text-[var(--color-glass-text-muted)] text-sm font-medium hover:bg-[var(--color-glass-input)] border border-[var(--color-glass-border)] transition-colors cursor-pointer">
                                            <Share2 size={16} />
                                            Compartilhar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Vehicles */}
                    {similar.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                                Veículos similares
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {similar.map((v: any) => (
                                    <VehicleCard
                                        key={v.slug}
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
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
