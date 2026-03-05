'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVehicleStatus } from '../../actions'
import { toast } from 'react-hot-toast'

interface Props {
    vehicleId: string
    initialStatus: string
}

export function StatusBadgeToggle({ vehicleId, initialStatus }: Props) {
    const [status, setStatus] = useState(initialStatus || 'Disponível')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const statusColor = status.toLowerCase() === 'vendido'
        ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
        : status.toLowerCase() === 'reservado'
            ? 'text-orange-400 bg-orange-400/10 border-orange-400/20'
            : 'text-green-400 bg-green-400/10 border-green-400/20'

    const handleToggle = () => {
        if (isPending) return

        let newStatus = 'Disponível'
        const lower = status.toLowerCase()
        if (lower === 'disponível' || lower === 'available') newStatus = 'Reservado'
        else if (lower === 'reservado' || lower === 'reserved') newStatus = 'Vendido'
        else if (lower === 'vendido' || lower === 'sold') newStatus = 'Disponível'

        setStatus(newStatus)
        startTransition(async () => {
            try {
                // Tenta chamar a action (precisamos garantir que ela existe em actions.ts)
                const res = await updateVehicleStatus(vehicleId, newStatus)
                if (res?.error) {
                    toast.error('Erro ao atualizar status do veículo')
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

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`absolute bottom-4 left-4 px-4 py-1.5 text-xs font-bold rounded-full border z-20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${statusColor}`}
            title="Clique para alterar o status"
        >
            {status}
        </button>
    )
}
