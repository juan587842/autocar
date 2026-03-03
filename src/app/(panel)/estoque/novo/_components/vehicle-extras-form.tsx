'use client'

import React, { useState } from 'react'
import { Car, ShieldCheck, Zap, Plus, Trash2, Settings2 } from 'lucide-react'

// --- MOCKS DE OPCIONAIS ---
const optionalItems = [
    { id: 'ar_condicionado', label: 'Ar Condicionado' },
    { id: 'direcao_hidraulica', label: 'Direção Hidráulica' },
    { id: 'teto_solar', label: 'Teto Solar' },
    { id: 'bancos_couro', label: 'Bancos de Couro' },
    { id: 'vidros_eletricos', label: 'Vidros Elétricos' },
    { id: 'alarme', label: 'Alarme' },
    { id: 'multimidia', label: 'Central Multimídia' },
    { id: 'camera_re', label: 'Câmera de Ré' },
    { id: 'sensor_estacionamento', label: 'Sensor de Estacionamento' },
    { id: 'rodas_liga_leve', label: 'Rodas de Liga Leve' },
    { id: 'airbags', label: 'Airbags Duplo / Lateral' },
    { id: 'freios_abs', label: 'Freios ABS' },
]
// --- FIM MOCKS ---

export function VehicleExtrasForm() {
    const [customFields, setCustomFields] = useState<{ id: string; label: string; value: string }[]>([])

    const addCustomField = () => {
        setCustomFields([...customFields, { id: Math.random().toString(36).substring(7), label: '', value: '' }])
    }

    const removeCustomField = (id: string) => {
        setCustomFields(customFields.filter(f => f.id !== id))
    }

    const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
        setCustomFields(customFields.map(f => (f.id === id ? { ...f, [key]: val } : f)))
    }

    return (
        <form className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Opcionais Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Car className="h-5 w-5 text-[#FF4D00]" />
                    <h3 className="text-lg font-medium text-white">Equipamentos e Opcionais</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {optionalItems.map((item) => (
                        <label
                            key={item.id}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 cursor-pointer transition-all group"
                        >
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-5 h-5 border border-white/20 rounded-md bg-transparent checked:bg-[#FF4D00] checked:border-[#FF4D00] transition-colors cursor-pointer"
                                />
                                <svg
                                    className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors select-none">
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Campos Customizados */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Campos Customizados</h3>
                    </div>
                    <button
                        type="button"
                        onClick={addCustomField}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Campo
                    </button>
                </div>

                <div className="space-y-3">
                    {customFields.map((field) => (
                        <div key={field.id} className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Nome. Ex: Potência"
                                value={field.label}
                                onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                            />
                            <input
                                type="text"
                                placeholder="Valor. Ex: 150cv"
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                            />
                            <button
                                type="button"
                                onClick={() => removeCustomField(field.id)}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {customFields.length === 0 && (
                        <p className="text-white/40 text-sm italic">Nenhum campo customizado adicionado.</p>
                    )}
                </div>
            </div>

            {/* Tags e Destaques */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-lg font-medium text-white">Destaques e Condições</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">IPVA Pago?</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 appearance-none">
                            <option value="sim" className="bg-[#0A0A0A]">Sim, 2026 pago</option>
                            <option value="nao" className="bg-[#0A0A0A]">Não pago</option>
                            <option value="isento" className="bg-[#0A0A0A]">Isento</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Observações Privadas (Oculto no site)</label>
                        <textarea
                            rows={3}
                            placeholder="Veículo entrou em negociação de troca, precisa trocar óleo..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/10">
                <button type="button" className="text-white/60 hover:text-white px-6 py-3 font-medium transition-colors">
                    Voltar
                </button>
                <button type="button" className="bg-green-500 text-white px-10 py-3 rounded-2xl font-bold hover:bg-green-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Cadastrar Veículo Final
                </button>
            </div>
        </form>
    )
}
