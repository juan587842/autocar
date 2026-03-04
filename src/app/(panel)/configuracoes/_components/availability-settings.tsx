"use client"

import { useState, useEffect } from "react"
import { Clock, CalendarOff, Plus, Trash2, Sun, Moon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSettingsStore } from "@/store/useSettingsStore"

const WEEK_DAYS = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
]

const DEFAULT_HOURS: Record<string, { open: string; close: string; enabled: boolean }> = {
    monday: { open: '08:00', close: '18:00', enabled: true },
    tuesday: { open: '08:00', close: '18:00', enabled: true },
    wednesday: { open: '08:00', close: '18:00', enabled: true },
    thursday: { open: '08:00', close: '18:00', enabled: true },
    friday: { open: '08:00', close: '18:00', enabled: true },
    saturday: { open: '08:00', close: '13:00', enabled: true },
    sunday: { open: '00:00', close: '00:00', enabled: false },
}

type Holiday = {
    id: string
    name: string
    date: string
    type: string
    recurring: boolean
    source: string
}

export function AvailabilitySettings() {
    const supabase = createClient()
    const { settings, updateSetting } = useSettingsStore()

    // Fallback para assegurar que sempre tenhamos um objeto de horas válido
    const hours = settings.business_hours || DEFAULT_HOURS

    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [showNewHoliday, setShowNewHoliday] = useState(false)
    const [newHolidayName, setNewHolidayName] = useState('')
    const [newHolidayDate, setNewHolidayDate] = useState('')
    const [newHolidayRecurring, setNewHolidayRecurring] = useState(false)

    useEffect(() => {
        const load = async () => {

            // Load holidays
            const { data: h } = await supabase.from('holidays').select('*').order('date', { ascending: true })
            if (h) setHolidays(h)
        }
        load()
    }, [supabase])

    const toggleDay = (dayKey: string) => {
        updateSetting("business_hours", {
            ...hours,
            [dayKey]: { ...hours[dayKey], enabled: !hours[dayKey].enabled }
        })
    }

    const changeTime = (dayKey: string, field: 'open' | 'close', value: string) => {
        updateSetting("business_hours", {
            ...hours,
            [dayKey]: { ...hours[dayKey], [field]: value }
        })
    }

    const addHoliday = async () => {
        if (!newHolidayName || !newHolidayDate) return
        const { data, error } = await supabase.from('holidays').insert({
            name: newHolidayName,
            date: newHolidayDate,
            type: 'custom',
            recurring: newHolidayRecurring,
            source: 'manual'
        }).select().single()

        if (data) setHolidays(prev => [...prev, data])
        setNewHolidayName('')
        setNewHolidayDate('')
        setNewHolidayRecurring(false)
        setShowNewHoliday(false)
    }

    const removeHoliday = async (id: string) => {
        await supabase.from('holidays').delete().eq('id', id)
        setHolidays(prev => prev.filter(h => h.id !== id))
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-[#FF4D00]" /> Disponibilidade
                </h2>
                <p className="text-white/60 text-sm mt-1">Configure o horário de funcionamento e dias fechados da loja.</p>
            </div>

            {/* ===== HORÁRIO DE FUNCIONAMENTO ===== */}
            <div className="bg-gradient-to-br from-[#FF4D00]/5 to-transparent border border-[#FF4D00]/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/10 rounded-full blur-3xl pointer-events-none" />

                <h3 className="text-lg font-medium text-white mb-5 flex items-center gap-2 relative z-10">
                    <Sun className="w-5 h-5 text-[#FF4D00]" /> Horário de Funcionamento
                </h3>

                <div className="space-y-3 relative z-10">
                    {WEEK_DAYS.map(day => {
                        const dayData = hours[day.key]
                        return (
                            <div key={day.key} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${dayData.enabled ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-60'}`}>
                                {/* Toggle */}
                                <button
                                    onClick={() => toggleDay(day.key)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${dayData.enabled ? 'bg-[#FF4D00]' : 'bg-white/20'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dayData.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>

                                {/* Day Name */}
                                <span className="text-sm font-medium text-white w-32">{day.label}</span>

                                {/* Time Inputs */}
                                {dayData.enabled ? (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <input
                                            type="time"
                                            value={dayData.open}
                                            onChange={e => changeTime(day.key, 'open', e.target.value)}
                                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50 w-28"
                                        />
                                        <span className="text-white/40 text-xs">até</span>
                                        <input
                                            type="time"
                                            value={dayData.close}
                                            onChange={e => changeTime(day.key, 'close', e.target.value)}
                                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50 w-28"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs text-white/30 ml-auto">Fechado</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ===== FERIADOS / DIAS FECHADOS ===== */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <CalendarOff className="w-5 h-5 text-red-400" /> Feriados e Dias Fechados
                    </h3>
                    <button
                        onClick={() => setShowNewHoliday(!showNewHoliday)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all"
                    >
                        <Plus className="w-4 h-4" /> Adicionar
                    </button>
                </div>

                {/* Form to add new holiday */}
                {showNewHoliday && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Nome</label>
                                <input
                                    type="text"
                                    value={newHolidayName}
                                    onChange={e => setNewHolidayName(e.target.value)}
                                    placeholder="Ex: Dia do Mecânico"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Data</label>
                                <input
                                    type="date"
                                    value={newHolidayDate}
                                    onChange={e => setNewHolidayDate(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newHolidayRecurring}
                                onChange={e => setNewHolidayRecurring(e.target.checked)}
                                className="w-4 h-4 rounded accent-[#FF4D00]"
                            />
                            <span className="text-sm text-white/70">Repete todo ano</span>
                        </label>

                        <div className="flex gap-3">
                            <button onClick={() => setShowNewHoliday(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white font-medium transition-all">
                                Cancelar
                            </button>
                            <button onClick={addHoliday} className="flex-1 py-2.5 bg-[#FF4D00] hover:bg-[#FF4D00]/90 rounded-xl text-sm text-white font-bold transition-all">
                                Salvar Feriado
                            </button>
                        </div>
                    </div>
                )}

                {/* List of holidays */}
                <div className="space-y-2">
                    {holidays.length === 0 ? (
                        <div className="text-center py-8 text-white/30 text-sm">
                            <Moon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            Nenhum feriado cadastrado.
                        </div>
                    ) : (
                        holidays.map(h => (
                            <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                                        <CalendarOff className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{h.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-white/40">{new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                            {h.recurring && <span className="text-[10px] bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-md text-white/50">Anual</span>}
                                            {h.source === 'google' && <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md text-blue-400">Google</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeHoliday(h.id)}
                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remover feriado"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
