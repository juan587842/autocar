'use client'

import { useState } from 'react'
import { Bell, BellOff, Calendar, CalendarClock, CalendarX2, Car, ChevronRight, Clock, MapPin, Trash2, Edit2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ContaClient({
    initialPreferences,
    initialAppointments,
    customerId
}: {
    initialPreferences: any[],
    initialAppointments: any[],
    customerId: string | null
}) {
    const [activeTab, setActiveTab] = useState<'buscas' | 'agendamentos'>('buscas')
    const [preferences, setPreferences] = useState(initialPreferences)
    const [appointments, setAppointments] = useState(initialAppointments)
    const [loading, setLoading] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const togglePreference = async (id: string, currentStatus: boolean) => {
        setLoading(id)
        const { error } = await supabase
            .from('customer_preferences')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setPreferences(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
        }
        setLoading(null)
    }

    const deletePreference = async (id: string) => {
        if (!confirm('Deseja realmente excluir este alerta?')) return
        setLoading(`del-${id}`)

        const { error } = await supabase
            .from('customer_preferences')
            .delete()
            .eq('id', id)

        if (!error) {
            setPreferences(prev => prev.filter(p => p.id !== id))
        }
        setLoading(null)
    }

    const cancelAppointment = async (id: string) => {
        if (!confirm('Cancelar este agendamento?')) return
        setLoading(`cancel-${id}`)

        const { error } = await supabase
            .from('scheduling_sessions')
            .update({ status: 'cancelled' })
            .eq('id', id)

        if (!error) {
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
        }
        setLoading(null)
    }

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
                <button
                    onClick={() => setActiveTab('buscas')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'buscas' ? 'bg-[#FF4D00] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    <Car className="w-4 h-4" />
                    Buscas Ativas
                </button>
                <button
                    onClick={() => setActiveTab('agendamentos')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'agendamentos' ? 'bg-[#FF4D00] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    <Calendar className="w-4 h-4" />
                    Meus Agendamentos
                </button>
            </div>

            {/* Buscas Ativas Content */}
            {activeTab === 'buscas' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {preferences.length === 0 ? (
                            <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Car className="w-8 h-8 text-white/20" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Nenhuma busca ativa</h3>
                                <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">Você ainda não demonstrou interesse em nenhum veículo fora de estoque. Peça à nossa inteligência artificial para procurar um veículo para você!</p>
                            </div>
                        ) : (
                            preferences.map((pref) => (
                                <div key={pref.id} className={`bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden transition-all hover:bg-white/10 group ${!pref.is_active ? 'opacity-60 grayscale' : ''}`}>
                                    {pref.is_active && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4D00]/20 blur-[40px] pointer-events-none" />
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                            {pref.brand || 'Qualquer'} {pref.model || 'Modelo'}
                                        </h3>
                                        <div className="flex items-center gap-2 scale-90 sm:scale-100">
                                            <button
                                                onClick={() => togglePreference(pref.id, pref.is_active)}
                                                disabled={loading === pref.id}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${pref.is_active ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-white/10 text-white/40 hover:text-white'}`}
                                                title={pref.is_active ? 'Desativar Alerta' : 'Ativar Alerta'}
                                            >
                                                {pref.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => deletePreference(pref.id)}
                                                disabled={loading === `del-${pref.id}`}
                                                className="w-8 h-8 rounded-full bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {pref.max_price && (
                                            <p className="text-sm font-medium text-green-400">Até R$ {Number(pref.max_price).toLocaleString('pt-BR')}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {pref.color && <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/70">Cor: {pref.color}</span>}
                                            {pref.min_year && <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/70">Ano: {pref.min_year}{pref.max_year ? ` a ${pref.max_year}` : '+'}</span>}
                                            {pref.body_type && <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/70">{pref.body_type}</span>}
                                            {pref.transmission && <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/70">{pref.transmission}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider font-bold truncate border-t border-white/10 pt-4">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span>Criado em {new Date(pref.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Agendamentos Content */}
            {activeTab === 'agendamentos' && (
                <div className="space-y-6 animate-fade-in max-w-3xl">
                    {appointments.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <CalendarClock className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-white font-bold text-lg">Nenhum agendamento</h3>
                            <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">Você não possui visitas marcadas. Fale com nossa assistente virtual no WhatsApp para agendar!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((appt) => {
                                const isCancelled = appt.status === 'cancelled'
                                const isCompleted = appt.status === 'completed'
                                const dateStr = new Date(appt.appointment_date).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })

                                return (
                                    <div key={appt.id} className={`bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex items-start gap-4 transition-all ${isCancelled ? 'opacity-50 grayscale' : 'hover:bg-white/10'}`}>

                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? 'bg-white/5 text-white/30' : 'bg-[#FF4D00]/20 text-[#FF4D00]'}`}>
                                            {isCancelled ? <CalendarX2 className="w-6 h-6" /> : <CalendarClock className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4 border-r border-white/10">
                                            <h3 className={`text-lg font-bold truncate ${isCancelled ? 'line-through text-white/50' : 'text-white'}`}>
                                                Visita na Loja
                                            </h3>
                                            <p className="text-white/60 text-sm mt-1 mb-3 capitalize line-clamp-1">{dateStr}</p>

                                            {appt.vehicles && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-white/70 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                    <Car className="w-3.5 h-3.5" />
                                                    {appt.vehicles.brand} {appt.vehicles.model}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pl-2 sm:pl-4 flex flex-col gap-2 justify-center h-full">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-center w-full ${isCancelled ? 'bg-red-500/20 text-red-500' : isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {isCancelled ? 'Cancelado' : isCompleted ? 'Concluído' : 'Confirmado'}
                                            </span>

                                            {!isCancelled && !isCompleted && (
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <button onClick={() => alert('Para reagendar, responda no WhatsApp da loja: "Quero reagendar minha visita" e nossa assistente resolverá!')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-colors tooltip" title="Reagendar">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => cancelAppointment(appt.id)} disabled={loading === `cancel-${appt.id}`} className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors tooltip" title="Cancelar">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
