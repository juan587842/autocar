"use client"

import { useState, useEffect } from "react"
import { DollarSign, Percent, Wallet } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"

export function CommissionSettings() {
    const { settings, updateSetting, isLoading } = useSettingsStore()

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-white/10 rounded col-span-2"></div><div className="h-2 bg-white/10 rounded col-span-1"></div></div><div className="h-2 bg-white/10 rounded"></div></div></div></div>
    }

    const config = {
        commission_enabled: settings.commission_enabled || false,
        commission_type: settings.commission_type || 'percentage',
        commission_value: settings.commission_value || 0
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-heading text-white">Comissões de Corretores</h2>
                    <p className="text-white/60 text-sm mt-1">Configure o valor base de pagamento de comissão que aparecerá nos relatórios de venda.</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden backdrop-blur-xl">
                {/* Spotlight background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D00]/5 blur-[80px] rounded-full pointer-events-none" />

                {/* Ativação Principal */}
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${config.commission_enabled ? 'bg-[#FF4D00]/20 text-[#FF4D00]' : 'bg-white/5 text-white/40'}`}>
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Gestão Módulo Comissões</h3>
                            <p className="text-white/50 text-sm">Habilite para registrar e calcular as comissões a pagar a cada vendedor (deal fechado).</p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.commission_enabled}
                            onChange={(e) => updateSetting("commission_enabled", e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#FF4D00]"></div>
                    </label>
                </div>

                <div className={`transition-all duration-300 ${config.commission_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-white/10 relative z-10">

                        {/* Tipo de Comissão */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/80">Modelo de Comissão</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => updateSetting("commission_type", 'percentage')}
                                    className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${config.commission_type === 'percentage'
                                        ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]'
                                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <Percent className="w-6 h-6" />
                                    <span className="text-sm font-medium">Porcentagem (%)</span>
                                </button>
                                <button
                                    onClick={() => updateSetting("commission_type", 'fixed')}
                                    className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${config.commission_type === 'fixed'
                                        ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]'
                                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <DollarSign className="w-6 h-6" />
                                    <span className="text-sm font-medium">Valor Fixo (R$)</span>
                                </button>
                            </div>
                        </div>

                        {/* Valor base */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/80">
                                {config.commission_type === 'percentage' ? 'Porcentagem Padrão (%) sobre a venda' : 'Valor Fixo Padrão (R$) por venda'}
                            </label>
                            <div className="relative">
                                {config.commission_type === 'percentage' ? (
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                ) : (
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-white/40">R$</span>
                                )}

                                <input
                                    type="number"
                                    min="0"
                                    step={config.commission_type === 'percentage' ? '0.1' : '100'}
                                    value={config.commission_value || 0}
                                    onChange={(e) => updateSetting("commission_value", parseFloat(e.target.value) || 0)}
                                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 text-white font-medium text-lg"
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-2">Você poderá alterar esse valor individualmente na página de cada Vendedor depois.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
