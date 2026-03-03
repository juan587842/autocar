'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Edit, PowerOff, LayoutGrid, List as ListIcon, ChevronDown, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const statusColors = {
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    vendido: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    disponivel: 'text-green-400 bg-green-400/10 border-green-400/20',
    reservado: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

type ViewMode = 'grid' | 'list'

export default function InventoryClient({ initialVehicles = [] }: { initialVehicles: any[] }) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filterBrand, setFilterBrand] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const getTranslatedStatus = (status?: string) => {
        if (!status) return 'Disponível'
        const s = status.toLowerCase()
        if (s === 'available') return 'Disponível'
        if (s === 'sold') return 'Vendido'
        if (s === 'reserved') return 'Reservado'
        return status
    }

    const mapVehicle = (car: any) => {
        const isDB = car.id && car.id.includes && car.id.includes('-')

        // Determinar cor baseada no status mapeado ou na string explícita 'available', 'sold', 'reserved'
        const lowerStatus = car.status?.toLowerCase() || ''
        let mappedColor = 'disponivel' // fallback
        if (['vendido', 'sold'].includes(lowerStatus)) mappedColor = 'vendido'
        if (['reservado', 'reserved'].includes(lowerStatus)) mappedColor = 'reservado'

        return {
            id: car.id,
            brand: car.brand || 'Marca',
            model: car.model || car.name || 'Modelo Desconhecido',
            yearFab: car.yearFab || car.year_fab || car.year || '20-',
            yearMod: car.yearMod || car.year_model || car.year || '20-',
            price: car.price ? (typeof car.price === 'number' ? `R$ ${car.price.toLocaleString('pt-BR')}` : car.price) : 'R$ ----',
            status: getTranslatedStatus(car.status),
            statusColor: car.statusColor || mappedColor,
            image: car.image || car.thumbnail_url || car.photos?.[0] || null,
            shortId: isDB ? car.id.substring(0, 5).toUpperCase() : car.id.toString().padStart(5, '0')
        }
    }

    const allMapped = initialVehicles.map(mapVehicle)

    // Extrair marcas únicas para filtro
    const uniqueBrands = [...new Set(allMapped.map(c => c.brand))].filter(Boolean)

    const filteredVehicles = allMapped.filter(car => {
        const matchesSearch = car.model.toLowerCase().includes(searchQuery.toLowerCase()) || car.brand.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesBrand = !filterBrand || car.brand === filterBrand
        const matchesStatus = !filterStatus || car.status.toLowerCase() === filterStatus.toLowerCase()
        return matchesSearch && matchesBrand && matchesStatus
    })

    const handleToggleStatus = async (e: React.MouseEvent, carId: string, currentStatus: string) => {
        e.preventDefault()
        e.stopPropagation()
        const newStatus = currentStatus.toLowerCase() === 'disponível' ? 'Reservado' : 'Disponível'
        await supabase.from('vehicles').update({ status: newStatus }).eq('id', carId)
        router.refresh()
    }

    const handleDeleteVehicle = async (e: React.MouseEvent, carId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm("Deseja realmente excluir (arquivar) este veículo?")) {
            await supabase.from('vehicles').update({ deleted_at: new Date().toISOString() }).eq('id', carId)
            router.refresh()
        }
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1590362891991-f20bc081e537?q=80&w=2670&auto=format&fit=crop'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Estoque {initialVehicles.length > 0 && <span className="text-[#FF4D00] text-sm ml-2 px-2 py-0.5 rounded-md bg-[#FF4D00]/10 border border-[#FF4D00]/20">Banco Conectado</span>}</h1>
                    <p className="text-white/60">Gerencie todos os veículos da loja.</p>
                </div>

                <Link
                    href="/estoque/novo"
                    className="flex items-center gap-2 bg-[#FF4D00] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#FF4D00]/90 transition-colors shadow-lg shadow-[#FF4D00]/20"
                >
                    <Plus className="h-5 w-5" />
                    Novo Veículo
                </Link>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF4D00]/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="p-6 sm:p-8">
                    {/* Filters & View Toggles */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                            <div className="relative flex-1 w-full sm:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Buscar veículo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        title="Visualização em Grid"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                        title="Visualização em Lista"
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 border text-white px-5 py-3 rounded-xl transition-colors shrink-0 ${showFilters ? 'border-[#FF4D00]/50' : 'border-white/10'}`}
                                >
                                    <Filter className="h-4 w-4 text-[#FF4D00]" />
                                    <span className="hidden sm:inline font-medium">Filtros</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Filter Panel */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Marca</label>
                                    <select
                                        value={filterBrand}
                                        onChange={e => setFilterBrand(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                    >
                                        <option value="" className="bg-[#111]">Todas as marcas</option>
                                        {uniqueBrands.map(b => (
                                            <option key={b} value={b} className="bg-[#111]">{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                    >
                                        <option value="" className="bg-[#111]">Todos</option>
                                        <option value="disponível" className="bg-[#111]">Disponível</option>
                                        <option value="reservado" className="bg-[#111]">Reservado</option>
                                        <option value="vendido" className="bg-[#111]">Vendido</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content View Switcher */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredVehicles.map(car => (
                                <Link
                                    key={car.id}
                                    href={`/estoque/${car.id}`}
                                    className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 block"
                                >
                                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg flex items-center border border-white/10">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/estoque/novo') }}
                                            className="p-2 text-white hover:text-[#FF4D00] transition-colors"
                                            title="Editar veículo"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleToggleStatus(e, car.id, car.status)}
                                            className="p-2 text-white hover:text-green-500 transition-colors"
                                            title="Alternar status"
                                        >
                                            <PowerOff className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-white/20" />
                                        <button
                                            onClick={(e) => handleDeleteVehicle(e, car.id)}
                                            className="p-2 text-white hover:text-red-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-white/5">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                        <img
                                            src={car.image || fallbackImg}
                                            alt={car.model}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                                        />
                                        <span className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-bold rounded-full border z-20 backdrop-blur-md ${statusColors[car.statusColor as keyof typeof statusColors] || statusColors.disponivel}`}>
                                            {car.status}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{car.brand} &bull; {car.yearFab}/{car.yearMod}</p>
                                        <h3 className="text-white font-bold text-lg mb-4 truncate">{car.model}</h3>
                                        <div className="flex justify-between items-end">
                                            <p className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{car.price}</p>
                                            <p className="text-white/30 text-xs text-right">#ID {car.shortId}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left text-sm text-white/70">
                                <thead className="bg-white/5 border-y border-white/10 text-white/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium whitespace-nowrap rounded-tl-xl border-l border-white/10">Veículo</th>
                                        <th className="px-6 py-4 font-medium">Ano</th>
                                        <th className="px-6 py-4 font-medium">Preço (R$)</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right rounded-tr-xl border-r border-white/10">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map((car) => (
                                        <tr
                                            key={car.id}
                                            onClick={() => router.push(`/estoque/${car.id}`)}
                                            className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={car.image || fallbackImg}
                                                        alt={car.model}
                                                        className="w-16 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{car.brand} {car.model}</p>
                                                        <p className="text-xs text-white/40">{car.shortId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {car.yearFab}/{car.yearMod}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                {car.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${statusColors[car.statusColor as keyof typeof statusColors] || statusColors.disponivel}`}>
                                                    {car.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push('/estoque/novo') }}
                                                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleToggleStatus(e, car.id, car.status)}
                                                        className="p-2 text-white/40 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                                        title="Alternar status"
                                                    >
                                                        <PowerOff className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteVehicle(e, car.id)}
                                                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
                        <p>Mostrando {filteredVehicles.length} veículos</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-colors" disabled>
                                Anterior
                            </button>
                            <button className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-colors bg-white/5 text-white">
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
