'use client'

import { useEffect, useState } from 'react'
import { useComparatorStore } from '@/store/useComparatorStore'
import { createClient } from '@/lib/supabase/client'
import { X, CheckCircle2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function ComparatorDrawer() {
    const { selectedVehicleIds, isOpen, setIsOpen, removeVehicle, clearVehicles } = useComparatorStore()
    const [vehicles, setVehicles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchVehicles = async () => {
            if (selectedVehicleIds.length === 0) {
                setVehicles([])
                return
            }

            setIsLoading(true)
            const { data } = await supabase
                .from('vehicles')
                .select('*')
                .in('id', selectedVehicleIds)

            if (data) {
                // Keep the order of selection
                const orderedData = selectedVehicleIds.map(id => data.find(v => v.id === id)).filter(Boolean)
                setVehicles(orderedData)
            }
            setIsLoading(false)
        }

        fetchVehicles()
    }, [selectedVehicleIds])

    if (selectedVehicleIds.length === 0 && !isOpen) return null

    const bestValueHighlight = (field: string, carId: string, type: 'higher' | 'lower') => {
        if (vehicles.length < 2) return false

        let bestId = vehicles[0].id
        let bestVal = Number(vehicles[0][field]) || 0

        vehicles.forEach(v => {
            const val = Number(v[field]) || 0
            if (type === 'higher' && val > bestVal) {
                bestVal = val; bestId = v.id;
            }
            if (type === 'lower' && val < bestVal) {
                bestVal = val; bestId = v.id;
            }
        })

        return bestId === carId && bestVal > 0
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price || 0)
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: isOpen ? 0 : 'calc(100% - 60px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none pb-4 px-4"
            >
                <div className="w-full max-w-6xl pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">

                    {/* Header bar (Clickable to toggle) */}
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-[60px] cursor-pointer flex items-center justify-between px-6 bg-gradient-to-r from-white/5 to-transparent border-b border-white/5 hover:bg-white/10 transition-colors shrink-0"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-white font-bold tracking-tight">Comparador de Veículos</span>
                            <div className="flex -space-x-3">
                                {vehicles.map((v, i) => (
                                    <div key={v.id} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-white/10 relative z-10" style={{ zIndex: 10 - i }}>
                                        <img src={v.image || v.thumbnail_url || v.photos?.[0]} alt={v.model} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop' }} />
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 3 - vehicles.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 bg-transparent relative" style={{ zIndex: 5 - i }} />
                                ))}
                            </div>
                            <span className="text-sm text-white/50">{selectedVehicleIds.length} / 3 selecionados</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedVehicleIds.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearVehicles(); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Limpar
                                </button>
                            )}
                            <button className="p-2 text-white/70 hover:text-white transition-colors bg-white/5 rounded-full">
                                {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6 overflow-y-auto custom-scrollbar flex-1"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="w-8 h-8 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : vehicles.length === 0 ? (
                                    <div className="text-center py-20 text-white/40">
                                        Selecione veículos no catálogo para compará-los lado a lado.
                                    </div>
                                ) : (
                                    <div className="flex gap-6 overflow-x-auto snap-x custom-scrollbar snap-mandatory">
                                        {vehicles.map((car) => (
                                            <div key={car.id} className="min-w-[300px] flex-1 flex flex-col border border-white/5 rounded-[1.5rem] bg-white/[0.02] snap-center overflow-hidden relative">

                                                <button
                                                    onClick={() => removeVehicle(car.id)}
                                                    className="absolute top-3 right-3 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                <div className="aspect-video bg-white/5 relative">
                                                    <img
                                                        src={car.image || car.thumbnail_url || car.photos?.[0]}
                                                        alt={car.model}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop' }}
                                                    />
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col gap-4">
                                                    <div className="text-center space-y-1">
                                                        <h3 className="text-xl font-bold text-white leading-tight">{car.brand} {car.model}</h3>
                                                        <p className="text-[#FF4D00] font-black text-2xl tracking-tight">{formatPrice(car.price)}</p>
                                                    </div>

                                                    <div className="space-y-2 mt-4">
                                                        <div className={`p-3 rounded-xl flex justify-between items-center text-sm border border-transparent ${bestValueHighlight('yearFab', car.id, 'higher') ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-white/5 text-white/70'}`}>
                                                            <span>Ano</span>
                                                            <span className="font-bold">{car.yearFab}/{car.yearMod || car.year_model}</span>
                                                        </div>
                                                        <div className={`p-3 rounded-xl flex justify-between items-center text-sm border border-transparent ${bestValueHighlight('mileage', car.id, 'lower') ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-white/5 text-white/70'}`}>
                                                            <span>Quilometragem</span>
                                                            <span className="font-bold">{new Intl.NumberFormat('pt-BR').format(car.mileage || 0)} km</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-white/5 text-sm flex justify-between items-center text-white/70">
                                                            <span>Câmbio</span>
                                                            <span className="font-bold capitalize">{car.transmission}</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-white/5 text-sm flex justify-between items-center text-white/70">
                                                            <span>Combustível</span>
                                                            <span className="font-bold capitalize">{car.fuel}</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-white/5 text-sm flex justify-between items-center text-white/70">
                                                            <span>Cor</span>
                                                            <span className="font-bold capitalize">{car.color}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4">
                                                        <Link href={`/catalogo/${car.slug}`} onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-white border border-white text-black font-semibold rounded-xl hover:bg-transparent hover:text-white transition-all">
                                                            Ver Detalhes
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
