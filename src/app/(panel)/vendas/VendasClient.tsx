'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, GripVertical, AlertCircle, Phone, FileText, BadgeDollarSign, CheckCircle2, XCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DealStage {
    id: string
    name: string
    color: string
    order: number
}

interface Deal {
    id: string
    customer_id: string
    vehicle_id?: string | null
    stage_id: string
    amount?: number | null
    expected_close_date?: string | null
    created_at: string
    customers?: { full_name: string } | null
    vehicles?: { brand: string; model: string; year: number } | null
}

export default function VendasClient({
    initialStages = [],
    initialDeals = []
}: {
    initialStages: any[],
    initialDeals: any[]
}) {
    const supabase = createClient()
    const [stages, setStages] = useState<DealStage[]>(initialStages)
    const [deals, setDeals] = useState<Deal[]>(initialDeals)
    const [isMounted, setIsMounted] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const newStageId = destination.droppableId

        // Optimistic UI update
        setDeals(prev => prev.map(deal =>
            deal.id === draggableId ? { ...deal, stage_id: newStageId } : deal
        ))

        // DB update
        const { error } = await supabase
            .from('deals')
            .update({ stage_id: newStageId })
            .eq('id', draggableId)

        if (error) {
            console.error('Failed to move deal in DB', error)
            // Ideally revert state here if needed
        }
    }

    if (!isMounted) return null

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Level */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        Pipeline de Vendas
                    </h1>
                    <p className="text-white/60">Arraste os cards para atualizar o status das oportunidades.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#FF4D00] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#FF4D00]/90 transition-colors shadow-lg shadow-[#FF4D00]/20"
                >
                    <Plus className="h-5 w-5" />
                    Nova Oportunidade
                </button>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex xl:grid gap-4 xl:gap-6 h-full min-w-max xl:min-w-0 xl:w-full items-start snap-x snap-mandatory"
                        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>

                        {stages.map((stage) => {
                            const stageDeals = deals.filter(d => d.stage_id === stage.id)

                            return (
                                <div key={stage.id} className="w-[85vw] sm:w-[340px] xl:w-auto shrink-0 snap-center h-full flex flex-col rounded-[2xl] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl relative pb-4">
                                    {/* Header da Coluna */}
                                    <div className="p-5 border-b border-t-2 border-white/5 flex items-center justify-between bg-white/5 z-10" style={{ borderTopColor: stage.color || '#cbd5e1' }}>
                                        <div className="flex items-center gap-3">
                                            <h2 className="font-bold text-white/90 text-[15px]">{stage.name}</h2>
                                        </div>
                                        <span className="text-xs font-bold bg-black/40 text-white/50 px-2.5 py-1 rounded-full border border-white/10">
                                            {stageDeals.length}
                                        </span>
                                    </div>

                                    {/* Área Droppable */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar z-10 transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                                            >
                                                {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="h-full min-h-[150px] flex items-center justify-center p-6 text-center pointer-events-none">
                                                        <p className="text-white/30 text-sm font-medium border border-dashed border-white/10 rounded-2xl p-6 w-full">Vazio</p>
                                                    </div>
                                                )}

                                                {stageDeals.map((deal, index) => {
                                                    const customerName = deal.customers?.full_name || 'Desconhecido'
                                                    const vehicleName = deal.vehicles ? `${deal.vehicles.brand} ${deal.vehicles.model} ${deal.vehicles.year}` : 'Veículo não informado'
                                                    const amount = deal.amount ? `R$ ${Number(deal.amount).toLocaleString('pt-BR')}` : 'S/ Valor'

                                                    return (
                                                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                                                    }}
                                                                    className="bg-black/60 hover:bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors group/card relative overflow-hidden shadow-xl shadow-black/40"
                                                                >
                                                                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50" style={{ backgroundColor: stage.color || '#fff' }} />

                                                                    <div className="flex items-start justify-between mb-3 pl-2">
                                                                        <h3 className="font-bold text-white text-sm leading-tight pr-4 truncate">{customerName}</h3>
                                                                        <GripVertical className="w-4 h-4 text-white/20 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                                    </div>

                                                                    <div className="space-y-2 pl-2">
                                                                        <p className="text-xs font-medium text-white/40 truncate bg-white/5 px-2 py-1 rounded-md inline-block border border-white/5">
                                                                            {vehicleName}
                                                                        </p>
                                                                        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                                                                            <p className="text-xs font-bold text-[#FF4D00] flex items-center gap-1">
                                                                                <BadgeDollarSign className="w-3.5 h-3.5" />
                                                                                {amount}
                                                                            </p>
                                                                            <p className="text-[10px] text-white/30 font-semibold">{new Date(deal.created_at).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DragDropContext>

            {/* Modal Mock */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Nova Oportunidade</h2>
                        <p className="text-sm text-white/60 mb-6">Esta funcionalidade será implementada no próximo ciclo (Painel completo do Lead).</p>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-[#FF4D00] text-white font-bold py-3 rounded-xl transition-all">
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
