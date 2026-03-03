import Link from 'next/link'
import { ArrowLeft, Car, ImageIcon, SlidersHorizontal } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import { VehicleBasicForm } from './_components/vehicle-basic-form'
import { VehiclePhotosForm } from './_components/vehicle-photos-form'
import { VehicleExtrasForm } from './_components/vehicle-extras-form'

export default function NewVehiclePage() {
    const formTabs = [
        {
            id: 'basic',
            label: 'Dados Básicos',
            icon: <Car className="h-4 w-4" />,
            content: <VehicleBasicForm />,
        },
        {
            id: 'photos',
            label: 'Fotos (12 Máx)',
            icon: <ImageIcon className="h-4 w-4" />,
            content: <VehiclePhotosForm />,
        },
        {
            id: 'extras',
            label: 'Extras & Opcionais',
            icon: <SlidersHorizontal className="h-4 w-4" />,
            content: <VehicleExtrasForm />,
        },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header / Nav */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                    <Link
                        href="/estoque"
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Adicionar Veículo</h1>
                        <p className="text-white/60">Prencha o formulário para adicionar ao estoque.</p>
                    </div>
                </div>
            </div>

            {/* Form Container Glass */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
                {/* Refração Glass / Glow Interna */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF4D00]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="p-4 sm:p-8">
                    {/* Componente Universal de Tabs injetando os 3 formulários criados */}
                    <Tabs tabs={formTabs} defaultTabId="basic" />
                </div>
            </div>
        </div>
    )
}
