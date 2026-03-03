'use client'

import { useState, useTransition } from "react"
import { Search, Filter, MessageSquare, CarFront, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { acceptOffer, rejectOffer, contactOfferCustomer } from "./actions"
import { useRouter } from "next/navigation"

const getStatusSettings = (status: string) => {
    switch (status) {
        case 'new': return { label: "Nova Oferta", style: "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]", icon: <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> };
        case 'analyzing': return { label: "Em Análise", style: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-3 h-3" /> };
        case 'accepted': return { label: "Aceita", style: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> };
        case 'rejected': return { label: "Recusada", style: "bg-white/10 text-white/40 border-white/10", icon: <XCircle className="w-3 h-3" /> };
        default: return { label: "Desconhecido", style: "bg-white/10 text-white/50 border-white/10", icon: null };
    }
}

export default function OffersClient({ initialOffers = [] }: { initialOffers: any[] }) {
    const [selectedOffer, setSelectedOffer] = useState<any | null>(null)
    const [isPending, startTransition] = useTransition()
    const [loadingIds, setLoadingIds] = useState<{ [key: string]: 'accept' | 'reject' | 'contact' | null }>({})
    const router = useRouter()
    const displayOffers = initialOffers

    const mapOffer = (o: any) => {
        const isDB = o.id && o.id.includes && o.id.includes('-') // uuid
        return {
            id: o.id,
            customer: isDB ? o.name || 'Desconhecido' : o.customer,
            phone: o.phone || 'S/ Contato',
            vehicleName: isDB ? `${o.brand || ''} ${o.model || o.vehicle_name || 'Desconhecido'} ${o.year || ''}` : o.vehicleName,
            plate: o.plate || 'S/ Placa',
            km: o.km || o.mileage ? `${o.km || o.mileage} km` : 'S/ KM',
            expectedPrice: isDB
                ? (o.expected_price ? `R$ ${Number(o.expected_price).toLocaleString('pt-BR')}` : 'R$ ---')
                : o.expectedPrice,
            date: isDB ? new Date(o.created_at).toLocaleDateString() : o.date,
            status: o.status || 'new',
            photos: o.photos || o.images || [],
            message: o.message || o.notes || 'Sem observações.'
        }
    }

    const mappedOffers = displayOffers.map(mapOffer)

    const handleAccept = (offer: any) => {
        setLoadingIds(prev => ({ ...prev, [offer.id]: 'accept' }))
        startTransition(async () => {
            const res = await acceptOffer(offer.id, offer.phone, offer.customer, offer.vehicleName)
            if (res.success) {
                setSelectedOffer((prev: any) => prev?.id === offer.id ? { ...prev, status: 'accepted' } : prev)
            } else {
                alert(res.message)
            }
            setLoadingIds(prev => ({ ...prev, [offer.id]: null }))
        })
    }

    const handleReject = (offer: any) => {
        setLoadingIds(prev => ({ ...prev, [offer.id]: 'reject' }))
        startTransition(async () => {
            const res = await rejectOffer(offer.id, offer.phone, offer.customer, offer.vehicleName)
            if (res.success) {
                setSelectedOffer((prev: any) => prev?.id === offer.id ? { ...prev, status: 'rejected' } : prev)
            } else {
                alert(res.message)
            }
            setLoadingIds(prev => ({ ...prev, [offer.id]: null }))
        })
    }

    const handleContact = (offer: any) => {
        setLoadingIds(prev => ({ ...prev, [offer.id]: 'contact' }))
        startTransition(async () => {
            const res = await contactOfferCustomer(offer.phone, offer.customer)
            if (res.success && res.conversationId) {
                router.push(`/inbox?id=${res.conversationId}`)
            } else {
                alert(res.message || 'Erro ao contatar cliente.')
            }
            setLoadingIds(prev => ({ ...prev, [offer.id]: null }))
        })
    }

    return (
        <div className="space-y-6 animate-fade-in relative pb-24 h-[calc(100vh-6rem)] flex flex-col">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
                        Ofertas Recebidas
                        {initialOffers.length > 0 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF4D00]">Server Connected</span>
                        )}
                    </h1>
                    <p className="text-white/60 mt-1 flex items-center gap-2">
                        Propostas de venda submetidas pelo site <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs text-white">Inbox</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar placa, carro..."
                            className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 text-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-black/20 hover:bg-white/10 border border-white/10 rounded-full text-white/80 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Listagem (Caixa de Entrada) */}
                <div className={`flex-1 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${selectedOffer ? 'hidden xl:flex xl:w-1/3 shrink-0' : 'w-full'}`}>
                    <div className="p-4 border-b border-white/10 bg-black/20 text-xs font-semibold text-white/60 uppercase tracking-widest">
                        Caixa de Entrada ({mappedOffers.filter(o => o.status === 'new').length} Novas)
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
                        {mappedOffers.length === 0 ? (
                            <div className="w-full p-6 text-center text-white/40 text-sm border border-white/5 bg-white/5 rounded-xl border-dashed">
                                Nenhuma oferta recebida no banco até momento.
                            </div>
                        ) : (
                            mappedOffers.map(offer => {
                                const status = getStatusSettings(offer.status)
                                const isActive = selectedOffer?.id === offer.id

                                return (
                                    <button
                                        key={offer.id}
                                        onClick={() => setSelectedOffer(offer)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${isActive ? 'bg-white/10 border-red-500/50 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border flex items-center gap-1.5 ${status.style}`}>
                                                {status.icon} {status.label}
                                            </div>
                                            <span className="text-xs text-white/40 font-medium">{offer.date}</span>
                                        </div>
                                        <h3 className="text-white font-bold leading-tight truncate">{offer.vehicleName}</h3>
                                        <p className="text-sm text-red-400 font-bold mt-1">{offer.expectedPrice}</p>
                                        <p className="text-xs text-white/50 mt-2 truncate flex items-center gap-1"><CarFront className="w-3 h-3" /> {offer.customer} • {offer.km}</p>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Detalhe da Oferta (Preview Panel) */}
                {selectedOffer ? (
                    <div className="flex-[2] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up relative">

                        {/* Toolbar Drawer */}
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <span className="text-red-500">•</span> Detalhes da Avaliação
                            </h2>
                            <button onClick={() => setSelectedOffer(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors xl:hidden">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Informações Expandidas */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8">

                            {/* Header Detalhe */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold font-heading text-white">{selectedOffer.vehicleName}</h1>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className="text-xl font-bold text-red-400">{selectedOffer.expectedPrice}</span>
                                        <span className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-md text-xs font-mono text-white/80">{selectedOffer.plate}</span>
                                        <span className="text-sm text-white/60">{selectedOffer.km}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(selectedOffer)}
                                        disabled={isPending && loadingIds[selectedOffer.id] === 'accept'}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending && loadingIds[selectedOffer.id] === 'accept' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Aceitar
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedOffer)}
                                        disabled={isPending && loadingIds[selectedOffer.id] === 'reject'}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending && loadingIds[selectedOffer.id] === 'reject' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        Recusar
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 w-full" />

                            {/* Cliente Card */}
                            <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-black/30 border border-white/5 gap-4">
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Ofertante</p>
                                    <p className="text-lg font-bold text-white">{selectedOffer.customer}</p>
                                    <p className="text-sm text-white/60">{selectedOffer.phone}</p>
                                    <p className="text-xs text-white/30 italic mt-2">"{selectedOffer.message}"</p>
                                </div>
                                <button
                                    onClick={() => handleContact(selectedOffer)}
                                    disabled={isPending && loadingIds[selectedOffer.id] === 'contact'}
                                    className="w-full md:w-auto px-6 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 rounded-xl text-[#25D366] font-medium transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending && loadingIds[selectedOffer.id] === 'contact' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5" />
                                    )}
                                    Chamar WhatsApp
                                </button>
                            </div>

                            {/* Fotos Enviadas */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Fotos Anexadas pelo Cliente</h3>
                                {selectedOffer.photos && selectedOffer.photos.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedOffer.photos.map((url: string, idx: number) => (
                                            <img key={idx} src={url} alt={`Foto ${idx + 1}`} className="w-full h-48 object-cover rounded-xl border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full py-12 border border-white/10 border-dashed rounded-xl bg-white/5 flex flex-col items-center justify-center text-white/40">
                                        <CarFront className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm">Cliente não anexou fotos.</p>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="hidden xl:flex flex-[2] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl items-center justify-center flex-col text-white/30 p-10 text-center">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold font-heading text-white/50">Nenhuma oferta selecionada</h3>
                        <p className="text-sm max-w-sm mt-2">Clique em uma proposta de venda na lista lateral para analisar os detalhes do veículo ofertado.</p>
                    </div>
                )}

            </div>

        </div>
    )
}
