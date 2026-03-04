"use client"

import { useEffect, useState } from "react"
import { Plug, Key, CalendarClock, CloudLightning, Check, Loader2, AlertCircle, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getEvolutionCredentials, testEvolutionConnection } from "../actions"
import { toast } from "react-hot-toast"

export function IntegrationsSettings() {
    const supabase = createClient()
    const [gcalStatus, setGcalStatus] = useState<'checking' | 'linked' | 'unlinked'>('checking')
    const [isImportingHolidays, setIsImportingHolidays] = useState(false)
    const [holidayMessage, setHolidayMessage] = useState('')
    const [evoCreds, setEvoCreds] = useState({ url: '', key: '', instanceName: '', appUrl: '' })
    const [loadingEvo, setLoadingEvo] = useState(true)
    const [isTestingEvo, setIsTestingEvo] = useState(false)

    useEffect(() => {
        async function checkGCalStatus() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('user_integrations')
                .select('id, is_active')
                .eq('user_id', user.id)
                .eq('provider', 'google_calendar')
                .single()

            setGcalStatus(data?.is_active ? 'linked' : 'unlinked')
        }

        async function fetchEvo() {
            try {
                const creds = await getEvolutionCredentials()
                setEvoCreds(creds)
            } catch (err) {
                console.error("Failed to fetch Evo credentials", err)
            } finally {
                setLoadingEvo(false)
            }
        }

        checkGCalStatus()
        fetchEvo()
    }, [supabase])

    const handleGoogleAuth = () => {
        window.location.href = '/api/calendar/auth'
    }

    const handleDisconnectGoogle = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('user_integrations')
            .update({ is_active: false, access_token: null, refresh_token: null })
            .eq('user_id', user.id)
            .eq('provider', 'google_calendar')

        setGcalStatus('unlinked')
    }

    const handleImportHolidays = async () => {
        setIsImportingHolidays(true)
        setHolidayMessage('')
        try {
            const res = await fetch('/api/holidays', { method: 'POST' })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setHolidayMessage(errData.error || `Erro HTTP ${res.status}`);
            } else {
                const data = await res.json()
                setHolidayMessage(data.message || data.error || 'Concluído')
            }
        } catch {
            setHolidayMessage('Erro de rede ao importar feriados.')
        }
        setIsImportingHolidays(false)
    }

    const handleTestEvolution = async () => {
        if (!evoCreds.url || !evoCreds.instanceName) {
            toast.error('Credenciais Evolution ausentes. Verifique o .env')
            return
        }
        setIsTestingEvo(true)
        const toastId = toast.loading('Testando conexão com Evolution API...')
        try {
            const result = await testEvolutionConnection()
            if (result.success) {
                toast.success(`Conexão OK! Status: ${result.state}`, { id: toastId })
            } else {
                toast.error(result.error || 'Falha ao conectar.', { id: toastId })
            }
        } catch (error) {
            toast.error('Erro de rede ao conectar com a API.', { id: toastId })
        } finally {
            setIsTestingEvo(false)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Plug className="w-6 h-6 text-blue-400" /> Integrações e APIs
                </h2>
                <p className="text-white/60 text-sm mt-1">Conecte o AutoCar aos seus serviços externos através de chaves e Webhooks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Evolution API */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#25D366]/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CloudLightning className="w-32 h-32 text-[#25D366]" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 relative z-10">Evolution API (WhatsApp)</h3>
                    <p className="text-sm text-white/50 mb-6 relative z-10">Gateway primário que conecta a loja ao WhatsApp. Necessita URI da API e Global API Key.</p>

                    <div className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Server URL</label>
                            <div className="relative">
                                {loadingEvo && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />}
                                <input type="url" value={evoCreds.url || ''} readOnly placeholder="URL da Evolution API" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#25D366]/50 outline-none opacity-70 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Global API Key</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                {loadingEvo && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />}
                                <input type="password" value={evoCreds.key || ''} readOnly placeholder="Sua Global API Key" className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-[#25D366]/50 outline-none font-mono opacity-70 cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Webhook de Retorno (Fallback)</label>
                            <div className="relative">
                                {loadingEvo && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />}
                                <input type="url" value={evoCreds.appUrl ? `${evoCreds.appUrl.replace(/\/$/, '')}/api/webhook/evolution` : ''} readOnly placeholder="URL de Webhook" className="w-full bg-black/40 border border-[#25D366]/30 rounded-lg px-3 py-2 text-[#25D366] text-sm focus:border-[#25D366]/50 outline-none font-mono opacity-80 cursor-not-allowed" />
                            </div>
                        </div>

                        <button
                            onClick={handleTestEvolution}
                            disabled={isTestingEvo || loadingEvo}
                            className="w-full mt-2 py-2 bg-white/5 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/50 text-white hover:text-[#25D366] rounded-xl font-medium transition-all text-sm disabled:opacity-50 flex justify-center items-center gap-2">
                            {isTestingEvo && <Loader2 className="w-4 h-4 animate-spin" />}
                            Testar Conexão
                        </button>
                    </div>
                </div>

                {/* Google Calendar */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-400/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarClock className="w-32 h-32 text-blue-400" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 relative z-10">Google Calendar</h3>
                    <p className="text-sm text-white/50 mb-6 relative z-10">Sincroniza agendas dos vendedores para reuniões com os Leads. Utiliza OAuth 2.0.</p>

                    <div className="space-y-4 relative z-10 flex flex-col h-[calc(100%-100px)] justify-end">

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between mb-2">
                            <div>
                                <p className="text-white text-sm font-medium">Status Conta Google</p>
                                {gcalStatus === 'checking' ? (
                                    <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando...
                                    </p>
                                ) : gcalStatus === 'linked' ? (
                                    <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Conectada
                                    </p>
                                ) : (
                                    <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Não Lincada
                                    </p>
                                )}
                            </div>
                            <div className={`w-3 h-3 rounded-full ${gcalStatus === 'linked' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        </div>

                        {gcalStatus === 'linked' ? (
                            <button
                                onClick={handleDisconnectGoogle}
                                className="w-full mt-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium transition-all text-sm"
                            >
                                Desconectar Google
                            </button>
                        ) : (
                            <button
                                onClick={handleGoogleAuth}
                                className="w-full mt-2 py-2 bg-blue-500 hover:bg-blue-600 border border-blue-400/50 text-white rounded-xl font-medium transition-all text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            >
                                Autenticar via Google
                            </button>
                        )}
                    </div>
                </div>

                {/* Feriados Nacionais */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400/40 transition-colors md:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                        <Download className="w-5 h-5 text-amber-400" /> Importar Feriados Nacionais
                    </h3>
                    <p className="text-sm text-white/50 mb-4 relative z-10">
                        Importa automaticamente os feriados brasileiros para o ano atual e próximo. Eles serão exibidos na Agenda e bloquearão agendamentos automáticos.
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleImportHolidays}
                            disabled={isImportingHolidays}
                            className="py-2 px-6 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-medium transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isImportingHolidays ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isImportingHolidays ? 'Importando...' : 'Importar Feriados'}
                        </button>
                        {holidayMessage && (
                            <span className="text-sm text-white/60">{holidayMessage}</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
