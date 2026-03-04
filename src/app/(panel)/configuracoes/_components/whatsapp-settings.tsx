"use client"

import { useState, useEffect, useCallback } from "react"
import { Smartphone, QrCode, RefreshCcw, Signal, CheckCircle2, Loader2, WifiOff, AlertTriangle } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export function WhatsappSettings() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { settings, updateSetting } = useSettingsStore()
    const instanceName = settings.whatsapp_instance_name ?? 'autocar'

    const handleInstanceNameChange = (val: string) => {
        updateSetting("whatsapp_instance_name", val)
    }

    // Helper de chamada à API interna
    const callEvolution = useCallback(async (action: string) => {
        const res = await fetch('/api/evolution/instance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, instanceName }),
        })
        return res.json()
    }, [instanceName])

    // Buscar status atual da conexão
    const fetchStatus = useCallback(async () => {
        try {
            const result = await callEvolution('status')
            const state = result.data?.instance?.state || result.data?.state

            if (state === 'open' || state === 'connected') {
                setConnectionState('connected')
                setQrCode(null)
                // Tentar extrair phone number do jid
                const jid = result.data?.instance?.owner || result.data?.instance?.jid
                if (jid) setPhoneNumber(jid.split('@')[0].replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4'))
            } else if (state === 'connecting') {
                setConnectionState('connecting')
            } else {
                setConnectionState('disconnected')
            }
        } catch {
            setConnectionState('disconnected')
        }
    }, [callEvolution])

    // Iniciar conexão (criar instância + gerar QR)
    const handleConnect = async () => {
        setLoading(true)
        setError(null)
        try {
            // 0. Verificar status atual da instância primeiro
            const statusResult = await callEvolution('status')
            const state = statusResult.data?.instance?.state || statusResult.data?.state

            if (state === 'open' || state === 'connected') {
                setConnectionState('connected')
                setQrCode(null)
                const jid = statusResult.data?.instance?.owner || statusResult.data?.instance?.jid
                if (jid) setPhoneNumber(jid.split('@')[0].replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4'))
                return // Já está conectado, finaliza aqui
            }

            // 1. Criar instância se não existir
            await callEvolution('create')

            // 2. Pegar QR Code
            const qrResult = await callEvolution('qrcode')
            const qrBase64 = qrResult.data?.base64 || qrResult.data?.qrcode?.base64
            const qrPairingCode = qrResult.data?.pairingCode || qrResult.data?.code

            if (qrBase64) {
                setQrCode(qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`)
                setConnectionState('connecting')
            } else if (qrPairingCode) {
                setQrCode(null)
                setConnectionState('connecting')
            } else if (qrResult.data?.instance?.state === 'open') {
                setConnectionState('connected')
            } else {
                setError('Não foi possível obter o QR Code. Verifique a URL e API Key da Evolution API no .env')
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar')
        } finally {
            setLoading(false)
        }
    }

    // Atualizar QR Code
    const handleRefreshQR = async () => {
        setLoading(true)
        try {
            const result = await callEvolution('qrcode')
            const qrBase64 = result.data?.base64 || result.data?.qrcode?.base64
            if (qrBase64) {
                setQrCode(qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`)
            }
        } catch {
            setError('Erro ao atualizar QR Code')
        } finally {
            setLoading(false)
        }
    }

    // Desconectar
    const handleDisconnect = async () => {
        setLoading(true)
        try {
            await callEvolution('logout')
            setConnectionState('disconnected')
            setQrCode(null)
            setPhoneNumber(null)
        } catch {
            setError('Erro ao desconectar')
        } finally {
            setLoading(false)
        }
    }

    // Polling de status enquanto está conectando e check on typing
    useEffect(() => {
        // Check status on mount or when instanceName changes (with debounce)
        const timeoutId = setTimeout(() => {
            if (instanceName.trim()) {
                fetchStatus()
            }
        }, 800)

        if (connectionState === 'connecting') {
            const interval = setInterval(fetchStatus, 5000)
            return () => {
                clearTimeout(timeoutId)
                clearInterval(interval)
            }
        }

        return () => clearTimeout(timeoutId)
    }, [connectionState, fetchStatus, instanceName])

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-[#25D366]" /> Conexão WhatsApp
                </h2>
                <p className="text-white/60 text-sm mt-1">Conecte o número da loja via Evolution API para auto-atendimento da IA.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-300 font-medium">Erro de Conexão</p>
                        <p className="text-xs text-red-300/70 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Lado Esquerdo - Status */}
                <div className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition-all ${connectionState === 'connected'
                    ? 'bg-[#25D366]/5 border-[#25D366]/20'
                    : connectionState === 'connecting'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}>
                    {/* Ícone de Status */}
                    <div className="relative flex items-center justify-center w-20 h-20">
                        {connectionState === 'connected' && (
                            <>
                                <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping" />
                                <div className="w-16 h-16 bg-gradient-to-br from-[#25D366] to-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.4)] z-10">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                            </>
                        )}
                        {connectionState === 'connecting' && (
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-full flex items-center justify-center border-2 border-amber-500/50 z-10">
                                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                            </div>
                        )}
                        {connectionState === 'disconnected' && (
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 z-10">
                                <WifiOff className="w-8 h-8 text-white/30" />
                            </div>
                        )}
                        {connectionState === 'error' && (
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30 z-10">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {connectionState === 'connected' && 'Conectado'}
                            {connectionState === 'connecting' && 'Aguardando Pareamento...'}
                            {connectionState === 'disconnected' && 'Desconectado'}
                            {connectionState === 'error' && 'Erro na Conexão'}
                        </h3>
                        {connectionState === 'connected' && (
                            <p className="text-[#25D366] font-medium mt-1 flex items-center justify-center gap-2">
                                <Signal className="w-4 h-4" /> Sinal: Excelente
                            </p>
                        )}
                        {connectionState === 'connecting' && (
                            <p className="text-amber-400 font-medium mt-1 text-sm">Escaneie o QR Code no WhatsApp</p>
                        )}
                        {connectionState === 'disconnected' && (
                            <p className="text-white/40 font-medium mt-1 text-sm">Clique em &quot;Conectar&quot; para iniciar</p>
                        )}
                    </div>

                    {connectionState === 'connected' && (
                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 mt-2">
                            {phoneNumber && (
                                <>
                                    <p className="text-sm text-white/60">Número Conectado</p>
                                    <p className="text-lg font-mono text-white font-medium mt-1 mb-4">{phoneNumber}</p>
                                </>
                            )}

                            <div className="pt-2 border-t border-white/10">
                                <label className="text-sm text-white/60 mb-2 font-medium flex justify-between items-center">
                                    Nome da Instância API
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">Editável</span>
                                </label>
                                <input
                                    type="text"
                                    value={instanceName}
                                    onChange={(e) => handleInstanceNameChange(e.target.value)}
                                    placeholder="ex: autocar2"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#25D366]/50 transition-colors font-mono text-sm"
                                    title="Altere o nome para inspecionar outra instância conectada ou para mudar a instância ativa na loja."
                                />
                            </div>
                        </div>
                    )}

                    {connectionState === 'disconnected' && (
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full">
                                <label className="text-sm text-white/60 block mb-2 font-medium">Nome da Instância na API</label>
                                <input
                                    type="text"
                                    value={instanceName}
                                    onChange={(e) => handleInstanceNameChange(e.target.value)}
                                    placeholder="ex: autocar"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366]/50 transition-colors font-mono"
                                />
                                <p className="text-xs text-white/40 mt-2 text-left">
                                    Identificador único da conexão na Evolution API. Altere para configurar múltiplas lojas ou contornos.
                                </p>
                            </div>

                            <button
                                onClick={handleConnect}
                                disabled={loading || !instanceName.trim()}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                                Conectar WhatsApp
                            </button>
                        </div>
                    )}
                </div>

                {/* Lado Direito - QR Code e Ações */}
                <div className="border border-white/10 bg-black/20 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-2 mb-6">
                        <h4 className="text-white font-medium flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-white/60" /> Emparelhar Dispositivo
                        </h4>
                        <p className="text-sm text-white/50">Abra o WhatsApp no seu celular, vá em &quot;Aparelhos Conectados&quot; e aponte a câmera para parear o sistema.</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 py-8 gap-4">
                        {qrCode ? (
                            <img
                                src={qrCode}
                                alt="QR Code WhatsApp"
                                className="w-52 h-52 rounded-lg bg-white p-2"
                            />
                        ) : (
                            <div className="w-40 h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                                <QrCode className="w-12 h-12 text-white/15" />
                            </div>
                        )}

                        {connectionState === 'connecting' && (
                            <button
                                onClick={handleRefreshQR}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 mt-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm text-white transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                Gerar Novamente
                            </button>
                        )}
                    </div>

                    {connectionState === 'connected' && (
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={handleDisconnect}
                                disabled={loading}
                                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-medium rounded-xl transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                Desconectar Sessão
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
