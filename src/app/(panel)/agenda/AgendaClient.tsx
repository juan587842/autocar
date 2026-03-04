"use client"

import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Filter, MapPin, X } from "lucide-react"
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, startOfWeek, endOfWeek, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, getHours, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

type ViewType = 'month' | 'week' | 'day'

// Dados de Feriados (Holidays) - Vazio por padrão
const mockHolidays: { date: Date, title: string }[] = []

// Helpers de Cores Baseados no Status
const getStatusColors = (status: string) => {
    switch (status) {
        case 'confirmed': return "bg-green-500/20 text-green-400 border-green-500/30";
        case 'scheduled': return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case 'cancelled': return "bg-red-500/20 text-red-400 border-red-500/30";
        case 'completed': return "bg-purple-500/20 text-purple-400 border-purple-500/30";
        case 'no_show': return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        default: return "bg-white/10 text-white/80 border-white/20";
    }
}

const getStatusBorder = (status: string) => {
    switch (status) {
        case 'confirmed': return "border-l-green-500";
        case 'scheduled': return "border-l-blue-500";
        case 'cancelled': return "border-l-red-500";
        case 'completed': return "border-l-purple-500";
        case 'no_show': return "border-l-orange-500";
        default: return "border-l-white/50";
    }
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'confirmed': return "Confirmado";
        case 'scheduled': return "Agendado (Aviso)";
        case 'cancelled': return "Cancelado";
        case 'completed': return "Realizado";
        case 'no_show': return "Não Compareceu";
        default: return "Status Desconhecido";
    }
}

// Helper de Horários para view Semana/Dia (8h as 18h)
const workingHours = Array.from({ length: 11 }, (_, i) => i + 8)

export default function AgendaClient({ initialAppointments = [] }: { initialAppointments: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date()) // Usa a data atual real
    const [view, setView] = useState<ViewType>('month')
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Mapeamento de agendamentos reais do DB
    const appointments = useMemo(() => {
        return initialAppointments.map(app => {
            const dateObj = new Date(app.scheduled_at)
            return {
                id: app.id,
                date: dateObj,
                time: format(dateObj, 'HH:mm'),
                hour: getHours(dateObj),
                customer: app.customers?.full_name || "Desconhecido",
                phone: app.customers?.phone || "Não informado",
                vehicle: app.vehicles ? `${app.vehicles.brand} ${app.vehicles.model}` : "Não informado",
                seller: app.users?.full_name || "Vendedor", // Pega nome do vendedor associado do DB
                status: app.status || "scheduled",
                duration: `${app.duration_min || 30} min`,
                notes: app.notes || "Sem observações",
                summary: app.summary || ""
            }
        })
    }, [initialAppointments])

    // Navegação
    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
        if (view === 'day') setCurrentDate(subDays(currentDate, 1))
    }

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
        if (view === 'day') setCurrentDate(addDays(currentDate, 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    // Gerador de Header Baseado na View
    const renderHeaderLabel = () => {
        if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR })
        if (view === 'week') {
            const start = startOfWeek(currentDate)
            const end = endOfWeek(currentDate)
            return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM, yyyy', { locale: ptBR })}`
        }
        return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
    }

    // --- RENDER MONTH VIEW ---
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)
        const dateFormat = "d"
        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ""

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat)
                const cloneDay = day
                const isCurrentMonth = isSameMonth(day, monthStart)
                const dayAppointments = appointments.filter(a => isSameDay(a.date, cloneDay))
                const holiday = mockHolidays.find(h => isSameDay(h.date, cloneDay))

                days.push(
                    <div
                        key={day.toString()}
                        className={`border-r border-b border-white/5 p-2 min-h-[120px] transition-colors relative group 
                            ${!isCurrentMonth ? 'bg-black/10 opacity-50' : 'hover:bg-white/5'}
                            ${holiday ? 'bg-red-500/5' : ''}
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold 
                                ${isToday(cloneDay) ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : (isCurrentMonth ? 'text-white/80' : 'text-white/30')}
                                hover:!text-white
                            `}>
                                {formattedDate}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    router.push(`/agenda/novo?date=${format(cloneDay, 'yyyy-MM-dd')}`)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 hover:bg-white/20 rounded text-white/80 transition-all cursor-pointer relative z-10"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {holiday && (
                            <div className="text-[10px] uppercase font-bold text-red-400 mb-2 truncate px-1">
                                🌴 {holiday.title}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                            {dayAppointments.map((app: any) => (
                                <div
                                    key={app.id}
                                    onClick={() => setSelectedAppointment(app)}
                                    className={`text-xs p-1.5 rounded border border-l-2 cursor-pointer hover:brightness-110 transition-all truncate ${getStatusColors(app.status)} ${getStatusBorder(app.status)}`}
                                    title={`${app.time} - ${app.customer}`}
                                >
                                    <span className="font-bold mr-1">{app.time}</span>
                                    {app.customer}
                                </div>
                            ))}
                        </div>
                    </div>
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            )
            days = []
        }

        return (
            <div className="flex-1 flex flex-col min-w-[700px]">
                <div className="grid grid-cols-7 border-b border-white/10 bg-black/20 shrink-0 capitalize">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="py-3 text-center text-sm font-semibold text-white/60 font-heading">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {rows}
                </div>
            </div>
        )
    }

    // --- RENDER WEEK VIEW ---
    const renderWeekView = () => {
        const startDate = startOfWeek(currentDate)
        const weekDays = eachDayOfInterval({ start: startDate, end: endOfWeek(currentDate) })

        return (
            <div className="flex-1 flex flex-col min-w-[700px]">
                {/* Header dos Dias da Semana */}
                <div className="grid grid-cols-8 border-b border-white/10 bg-black/20 shrink-0 sticky top-0 z-20">
                    <div className="py-3 text-center border-r border-white/5 opacity-0">Horas</div>
                    {weekDays.map(day => (
                        <div key={day.toString()} className="py-2 text-center border-r border-white/5 relative bg-black/20">
                            <div className="text-xs text-white/50 uppercase font-medium">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className={`text-lg font-bold font-heading mx-auto w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-white/80'}`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Horário */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {workingHours.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-white/5 group relative">
                            {/* Coluna da Hora */}
                            <div className="py-4 text-center text-xs text-white/40 border-r border-white/5 sticky left-0 bg-[#0c0c0c] z-10 w-full flex items-center justify-center">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>

                            {/* Celulas dos Dias */}
                            {weekDays.map(day => {
                                const cellAppointments = appointments.filter(a => isSameDay(a.date, day) && a.hour === hour)

                                return (
                                    <div key={`${day}-${hour}`} className="min-h-[60px] border-r border-white/5 relative hover:bg-white/5 p-1">
                                        {/* Botão Add Oculto */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                                            <button
                                                onClick={() => router.push(`/agenda/novo?date=${format(day, 'yyyy-MM-dd')}&time=${hour.toString().padStart(2, '0')}:00`)}
                                                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center pointer-events-auto"
                                            >
                                                <Plus className="w-3 h-3 text-white/50" />
                                            </button>
                                        </div>

                                        {/* Agendamentos */}
                                        <div className="flex flex-col gap-1 relative z-10">
                                            {cellAppointments.map(app => (
                                                <div
                                                    key={app.id}
                                                    onClick={() => setSelectedAppointment(app)}
                                                    className={`p-1.5 rounded-lg border-l-2 cursor-pointer transition-transform hover:scale-105 shadow-md ${getStatusColors(app.status)} ${getStatusBorder(app.status)}`}
                                                >
                                                    <div className="text-[10px] font-bold opacity-80">{app.time}</div>
                                                    <div className="text-xs font-semibold truncate leading-tight">{app.customer}</div>
                                                    <div className="text-[10px] truncate opacity-80 mt-0.5">{app.vehicle}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // --- RENDER DAY VIEW ---
    const renderDayView = () => {
        const day = currentDate

        return (
            <div className="flex-1 flex flex-col min-w-[400px]">
                {/* Header do Dia */}
                <div className="grid grid-cols-[80px_1fr] border-b border-white/10 bg-black/20 shrink-0 sticky top-0 z-20">
                    <div className="py-3 text-center border-r border-white/5 opacity-0">Horas</div>
                    <div className="py-3 px-6 flex items-center gap-4 bg-black/20">
                        <div className={`text-2xl font-bold font-heading w-12 h-12 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/90'}`}>
                            {format(day, 'd')}
                        </div>
                        <div>
                            <div className="text-xl font-bold capitalize text-white">{format(day, 'EEEE', { locale: ptBR })}</div>
                        </div>
                    </div>
                </div>

                {/* Grid Horário Linear */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {workingHours.map(hour => {
                        const cellAppointments = appointments.filter(a => isSameDay(a.date, day) && a.hour === hour)

                        return (
                            <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-white/5 group relative min-h-[80px]">
                                {/* Hora */}
                                <div className="py-4 text-center text-sm font-medium text-white/40 border-r border-white/5 sticky left-0 bg-[#0c0c0c] z-10">
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </div>

                                {/* Area Limpa do Dia */}
                                <div className="relative hover:bg-white/[0.02] p-2 pl-4">
                                    {/* Botão Add */}
                                    <button
                                        onClick={() => router.push(`/agenda/novo?date=${format(day, 'yyyy-MM-dd')}&time=${hour.toString().padStart(2, '0')}:00`)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all pointer-events-auto"
                                    >
                                        <Plus className="w-3 h-3" /> Agendar
                                    </button>

                                    {/* Cards de Agendamento Ocupando o Espaço */}
                                    <div className="flex flex-col gap-2 relative z-10 w-full max-w-3xl">
                                        {cellAppointments.map(app => (
                                            <div
                                                key={app.id}
                                                onClick={() => setSelectedAppointment(app)}
                                                className={`p-3 rounded-xl border border-l-4 cursor-pointer hover:brightness-110 shadow-lg flex items-center justify-between gap-4 transition-all ${getStatusColors(app.status)} ${getStatusBorder(app.status)}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-black/20 px-2 py-1 rounded text-xs font-bold font-mono">
                                                        {app.time}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{app.customer}</div>
                                                        <div className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
                                                            <MapPin className="w-3 h-3" /> {app.vehicle}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-black/20 rounded border border-white/10 hide-mobile">
                                                        {app.duration}
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                                                        <User className="w-4 h-4 opacity-70" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in text-white pb-24 h-[calc(100vh-6rem)] flex flex-col">

            {/* Header Interativo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-red-500" />
                        Agenda de Visitas
                    </h1>
                    <p className="text-white/60 mt-1 capitalize">
                        {view === 'month' && "Sincronizado "} {renderHeaderLabel()}
                        <span className="text-green-400 text-xs ml-2 font-medium bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 hide-mobile">Online</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex items-center p-1 bg-black/20 border border-white/10 rounded-xl mr-2">
                        {['month', 'week', 'day'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v as ViewType)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${view === v ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                            >
                                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
                            </button>
                        ))}
                    </div>

                    {/* Navegação do Mês/Semana/Dia */}
                    <div className="flex items-center gap-1 bg-black/20 border border-white/10 rounded-full p-1">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-white/80" /></button>
                        <button onClick={handleToday} className="px-3 py-1 text-sm font-medium hover:bg-white/10 rounded-full transition-colors text-white/80 hide-mobile">Hoje</button>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-white/80" /></button>
                    </div>

                    <button className="p-2.5 bg-black/20 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-colors hide-mobile" title="Filtros">
                        <Filter className="w-5 h-5" />
                    </button>

                    <Link
                        href="/agenda/novo"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Novo Agendamento</span>
                        <span className="sm:hidden">Novo</span>
                    </Link>
                </div>
            </div>

            {/* Calendário UI (Glassmorphism) Container */}
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-x-auto">
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </div>

            {/* ===== MODAL DETALHES DO AGENDAMENTO ===== */}
            {mounted && selectedAppointment && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedAppointment(null)}>
                    <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-md relative shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedAppointment(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold font-heading text-white mb-1 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#FF4D00]" /> Detalhes do Agendamento
                        </h2>
                        <div className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border mb-6 mt-1 ${getStatusColors(selectedAppointment.status)}`}>
                            {getStatusLabel(selectedAppointment.status)}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-white/60" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/50 font-medium">Cliente</p>
                                    <p className="text-sm font-bold text-white">{selectedAppointment.customer}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-white/60" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/50 font-medium">Data / Horário / Duração</p>
                                    <p className="text-sm font-bold text-white capitalize">{format(selectedAppointment.date, "dd MMM yyyy", { locale: ptBR })} às {selectedAppointment.time} — {selectedAppointment.duration}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-white/60" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/50 font-medium">Veículo de Interesse</p>
                                    <p className="text-sm font-bold text-white">{selectedAppointment.vehicle}</p>
                                </div>
                            </div>

                            {selectedAppointment.notes && selectedAppointment.notes !== "Sem observações" && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                                    <p className="text-xs text-white/50 font-bold uppercase mb-1">Observações</p>
                                    <p className="text-sm text-white/80">{selectedAppointment.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setSelectedAppointment(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-all cursor-pointer">
                                Fechar
                            </button>
                            <Link
                                href={`https://wa.me/55${selectedAppointment.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                className="flex-1 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 rounded-xl text-[#25D366] font-bold transition-all text-center"
                            >
                                WhatsApp
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
