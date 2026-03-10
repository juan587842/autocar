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
    vehicles?: { brand: string; model: string; year_fab: number } | null
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
                    className="flex items-center gap-2 bg-[#FF4D00] text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-[#FF4D00]/90 transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:shadow-[0_0_25px_rgba(255,77,0,0.5)] active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nova Oportunidade
                </button>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-6 -mx-4 px-4 xl:mx-0 xl:px-0">
                    <div className="flex xl:grid gap-4 h-full min-w-max xl:min-w-0 xl:w-full items-start snap-x snap-mandatory xl:snap-none"
                        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>

                        {stages.map((stage) => {
                            const stageDeals = deals.filter(d => d.stage_id === stage.id)

                            return (
                                <div key={stage.id} className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 xl:shrink snap-center h-full flex flex-col rounded-[2xl] bg-[#0A0A0A]/80 border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl relative pb-4">
                                    {/* Header da Coluna */}
                                    <div className="p-4 sm:p-5 border-b border-t-[3px] border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.04] to-transparent z-10" style={{ borderTopColor: stage.color || '#cbd5e1' }}>
                                        <div className="flex items-center gap-3">
                                            <h2 className="font-bold text-white/95 text-[15px] tracking-wide">{stage.name}</h2>
                                        </div>
                                        <span className="text-[11px] font-bold bg-white/5 text-white/60 px-2.5 py-1 rounded-full border border-white/10 shadow-inner">
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
                                                    <div className="h-full min-h-[150px] flex flex-col items-center justify-center p-6 text-center pointer-events-none opacity-50">
                                                        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3">
                                                            <span className="text-white/30 truncate text-xs">Vazio</span>
                                                        </div>
                                                        <p className="text-white/40 text-sm font-medium">Nenhum lead</p>
                                                    </div>
                                                )}

                                                {stageDeals.map((deal, index) => {
                                                    const customerName = deal.customers?.full_name || 'Desconhecido'
                                                    const vehicleName = deal.vehicles ? `${deal.vehicles.brand} ${deal.vehicles.model} ${deal.vehicles.year_fab}` : 'Veículo não informado'
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
                                                                        opacity: snapshot.isDragging ? 0.9 : 1,
                                                                    }}
                                                                    className={`bg-[#121212] hover:bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 transition-all duration-200 group/card relative overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-1 ring-white/20' : ''}`}
                                                                >
                                                                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" style={{ backgroundColor: stage.color || '#fff' }} />

                                                                    <div className="flex items-start justify-between mb-4 pl-1">
                                                                        <h3 className="font-bold text-white/90 text-[15px] leading-tight pr-4">{customerName}</h3>
                                                                        <GripVertical className="w-4 h-4 text-white/20 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                                    </div>

                                                                    <div className="space-y-3 pl-1">
                                                                        <p className="text-xs font-medium text-white/60 bg-white/5 px-2.5 py-1.5 rounded-lg inline-block border border-white/5">
                                                                            {vehicleName}
                                                                        </p>
                                                                        <div className="pt-3 mt-1 border-t border-white/5 flex items-center justify-between">
                                                                            <div className="flex items-center gap-1.5 bg-[#FF4D00]/10 px-2.5 py-1 rounded-md border border-[#FF4D00]/20">
                                                                                <BadgeDollarSign className="w-3.5 h-3.5 text-[#FF4D00]" />
                                                                                <p className="text-xs font-bold text-[#FF4D00]">
                                                                                    {amount}
                                                                                </p>
                                                                            </div>
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

            {/* Modal Nova Oportunidade */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-md relative shadow-2xl"
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const form = e.currentTarget
                            const formData = new FormData(form)
                            const phone = String(formData.get('phone')).replace(/\D/g, '')
                            const name = String(formData.get('name'))
                            const amount = Number(formData.get('amount')) || null
                            const vehicleInfo = String(formData.get('vehicleInfo'))

                            if (!phone || !name) return

                            try {
                                // 1. Buscar ou criar cliente
                                let customerId = null
                                const { data: existingCustomer } = await supabase
                                    .from('customers')
                                    .select('id')
                                    .eq('phone', phone)
                                    .single()

                                if (existingCustomer) {
                                    customerId = existingCustomer.id
                                } else {
                                    const { data: newCustomer, error: cErr } = await supabase
                                        .from('customers')
                                        .insert({ full_name: name, phone })
                                        .select('id')
                                        .single()
                                    if (cErr) throw cErr
                                    customerId = newCustomer.id
                                }

                                // 2. Criar Deal na primeira coluna (Lead Novo)
                                const firstStageId = stages[0]?.id
                                if (!firstStageId) throw new Error('No stages found')

                                const { data: newDeal, error: dErr } = await supabase
                                    .from('deals')
                                    .insert({
                                        customer_id: customerId,
                                        stage_id: firstStageId,
                                        amount,
                                        notes: vehicleInfo || 'Criado manualmente pelo Kanban'
                                    })
                                    .select('*, customers(full_name), vehicles(brand, model, year)')
                                    .single()

                                if (dErr) throw dErr

                                // 3. Atualizar estado local
                                setDeals(prev => [newDeal as any, ...prev])
                                setIsModalOpen(false)
                            } catch (err) {
                                console.error('Error creating deal:', err)
                                alert('Erro ao criar oportunidade. Tente novamente.')
                            }
                        }}
                    >
                        <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[#FF4D00]" />
                            Nova Oportunidade
                        </h2>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Nome do Cliente *</label>
                                <input required name="name" type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all" placeholder="Ex: João da Silva" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">WhatsApp *</label>
                                <input required name="phone" type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all" placeholder="Ex: 11999999999" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Veículo de Interesse / Notas</label>
                                <input name="vehicleInfo" type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all" placeholder="Ex: Honda Civic 2021" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Valor Esperado (R$)</label>
                                <input name="amount" type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all" placeholder="Ex: 120000" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="flex-1 bg-[#FF4D00] text-white font-bold py-3 rounded-xl hover:bg-[#FF4D00]/90 transition-all shadow-lg shadow-[#FF4D00]/20">
                                Criar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
