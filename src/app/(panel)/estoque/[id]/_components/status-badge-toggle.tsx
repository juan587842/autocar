'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateVehicleStatus } from '../../actions'
import { toast } from 'react-hot-toast'
import { ChevronDown, Check } from 'lucide-react'
import { SaleCustomerModal } from '@/components/vehicles/SaleCustomerModal'

interface Props {
    vehicleId: string
    initialStatus: string
    carModel: string
}

const statusMap: Record<string, string> = {
    'available': 'Disponível',
    'disponível': 'Disponível',
    'disponivel': 'Disponível',
    'reserved': 'Reservado',
    'reservado': 'Reservado',
    'sold': 'Vendido',
    'vendido': 'Vendido',
}

const statusOptions = ['Disponível', 'Reservado', 'Vendido']

export function StatusBadgeToggle({ vehicleId, initialStatus, carModel }: Props) {
    // Traduz o status inicial vindo do banco caso esteja em inglês ("available" -> "Disponível")
    const translatedInitial = statusMap[initialStatus?.toLowerCase()] || 'Disponível'

    const [status, setStatus] = useState(translatedInitial)
    const [isOpen, setIsOpen] = useState(false)
    const [saleModalOpen, setSaleModalOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])

    const getStatusColor = (s: string) => {
        const lower = s.toLowerCase()
        if (lower === 'vendido') return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
        if (lower === 'reservado') return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
        return 'text-green-400 bg-green-400/10 border-green-400/20'
    }

    const getDotColor = (s: string) => {
        const lower = s.toLowerCase()
        if (lower === 'vendido') return 'bg-blue-400'
        if (lower === 'reservado') return 'bg-orange-400'
        return 'bg-green-400'
    }

    const handleSelect = (newStatus: string) => {
        if (isPending || newStatus === status) {
            setIsOpen(false)
            return
        }

        if (newStatus === 'Vendido') {
            setIsOpen(false)
            setSaleModalOpen(true)
            return
        }

        setStatus(newStatus)
        setIsOpen(false)

        const dbStatusMap: Record<string, string> = {
            'Disponível': 'available',
            'Reservado': 'reserved',
            'Vendido': 'sold'
        }
        const dbStatus = dbStatusMap[newStatus] || newStatus

        startTransition(async () => {
            try {
                const res = await updateVehicleStatus(vehicleId, dbStatus)
                if (res?.error) {
                    toast.error(`Erro ao atualizar: ${res.error}`)
                    setStatus(status) // revert
                } else {
                    toast.success(`Veículo marcado como ${newStatus}`)
                    router.refresh()
                }
            } catch (err) {
                toast.error('Erro ao atualizar status')
                setStatus(status) // revert
            }
        })
    }

    const handleConfirmSale = async (buyerId: string | null) => {
        setSaleModalOpen(false)
        setStatus('Vendido')
        
        startTransition(async () => {
            try {
                const res = await updateVehicleStatus(vehicleId, 'sold', buyerId)
                if (res?.error) {
                    toast.error(`Erro ao vincular venda: ${res.error}`)
                    setStatus(status) // revert
                } else {
                    toast.success('Veículo marcado como Vendido')
                    router.refresh()
                }
            } catch (err) {
                toast.error('Erro ao vincular venda')
                setStatus(status) // revert
            }
        })
    }

    return (
        <div className="absolute bottom-4 left-4 z-30" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full border backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${getStatusColor(status)}`}
                title="Clique para alterar o status"
            >
                {status}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-36 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(opt)}`} />
                                {opt}
                            </span>
                            {status === opt && <Check className="w-3 h-3 text-white/50" />}
                        </button>
                    ))}
                </div>
            )}

            <SaleCustomerModal
                isOpen={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onConfirm={handleConfirmSale}
                carModel={carModel}
            />
        </div>
    )
}
