import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit3, Calendar, Fuel, Gauge, Settings2, Car, Tag, BadgeCheck } from "lucide-react"
import VehicleImage from "@/components/ui/VehicleImage"
import { AdGenerator } from "./AdGenerator"
import { StatusBadgeToggle } from "./_components/status-badge-toggle"

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*, vehicle_photos(url, is_cover, display_order)')
        .eq('id', id)
        .single()

    if (error || !vehicle) {
        redirect('/estoque')
    }

    const v = vehicle

    // Sort and get cover photo, fallback to first photo, then fallback to mock image.
    const sortedPhotos = v.vehicle_photos ? [...v.vehicle_photos].sort((a, b) => {
        if (a.is_cover) return -1
        if (b.is_cover) return 1
        return a.display_order - b.display_order
    }) : []
    const imageUrl = sortedPhotos.length > 0 ? sortedPhotos[0].url : 'https://images.unsplash.com/photo-1590362891991-f20bc081e537?q=80&w=2670&auto=format&fit=crop'

    return (
        <div className="space-y-6 animate-fade-in text-white pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/estoque"
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {v.brand} {v.model}
                        </h1>
                        <p className="text-white/60 mt-1">{v.year_fab || v.year}/{v.year_model || v.year} • #{v.id.substring(0, 5).toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center w-full sm:w-auto mt-4 sm:mt-0">
                    <AdGenerator vehicleId={v.id} />
                    <Link
                        href={`/estoque/${v.id}/edit`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all text-white"
                    >
                        <Edit3 className="w-4 h-4" /> Editar
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Imagem principal */}
                <div className="lg:col-span-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl relative">
                    <div className="aspect-[16/9] w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 rounded-3xl" />
                        <VehicleImage
                            src={imageUrl}
                            alt={`${v.brand} ${v.model}`}
                            className="w-full h-full object-cover rounded-3xl"
                        />
                        <StatusBadgeToggle vehicleId={v.id} initialStatus={v.status || 'Disponível'} carModel={`${v.brand} ${v.model}`} />
                    </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Preço */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF4D00]/10 rounded-full blur-3xl pointer-events-none" />
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">Preço</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            {v.price ? `R$ ${Number(v.price).toLocaleString('pt-BR')}` : 'Sob Consulta'}
                        </p>
                    </div>

                    {/* Specs Grid */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Especificações</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Car className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Marca</p>
                                    <p className="text-sm font-bold">{v.brand || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Calendar className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Ano</p>
                                    <p className="text-sm font-bold">{v.year_fab || v.year || 'N/A'}/{v.year_model || v.year || ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Fuel className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Combustível</p>
                                    <p className="text-sm font-bold">{v.fuel || 'Flex'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Settings2 className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Câmbio</p>
                                    <p className="text-sm font-bold">{v.transmission || 'Automático'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Gauge className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">KM</p>
                                    <p className="text-sm font-bold">{v.mileage ? Number(v.mileage).toLocaleString('pt-BR') : 'N/A'} km</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><Tag className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Cor</p>
                                    <p className="text-sm font-bold">{v.color || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg"><BadgeCheck className="w-4 h-4 text-white/60" /></div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase">Condição</p>
                                    <p className="text-sm font-bold">{v.condition === 'novo' ? 'Novo (0km)' : v.condition === 'seminovo' ? 'Seminovo' : v.condition || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    {v.description && (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Descrição</h3>
                            <p className="text-sm text-white/80 leading-relaxed">{v.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
