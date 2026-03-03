'use client'

import React from 'react'

export function VehicleBasicForm() {
    return (
        <form className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Placa / VIN */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Placa</label>
                    <input
                        type="text"
                        placeholder="ABC-1234"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 uppercase"
                    />
                </div>

                {/* Marca */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Marca</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 appearance-none">
                        <option value="" disabled selected>Selecione a marca...</option>
                        <option value="chevrolet" className="bg-[#0A0A0A]">Chevrolet</option>
                        <option value="fiat" className="bg-[#0A0A0A]">Fiat</option>
                        <option value="honda" className="bg-[#0A0A0A]">Honda</option>
                        <option value="toyota" className="bg-[#0A0A0A]">Toyota</option>
                        <option value="volkswagen" className="bg-[#0A0A0A]">Volkswagen</option>
                    </select>
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Modelo da Versão</label>
                    <input
                        type="text"
                        placeholder="Ex: Tracker Premier 1.2 Turbo"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                    />
                </div>

                {/* Ano Fab/Mod */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Ano Fab / Ano Mod</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="2022" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50" />
                        <span className="text-white/40 flex items-center">/</span>
                        <input type="number" placeholder="2023" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50" />
                    </div>
                </div>

                {/* Preço */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Preço de Venda (R$)</label>
                    <input
                        type="text"
                        placeholder="0,00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                    />
                </div>

                {/* Quilometragem */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Quilometragem (KM)</label>
                    <input
                        type="number"
                        placeholder="Ex: 45000"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                    />
                </div>

                {/* Câmbio */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Câmbio</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 appearance-none">
                        <option value="automático" className="bg-[#0A0A0A]">Automático</option>
                        <option value="manual" className="bg-[#0A0A0A]">Manual</option>
                    </select>
                </div>

                {/* Combustível */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Combustível</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 appearance-none">
                        <option value="flex" className="bg-[#0A0A0A]">Flex</option>
                        <option value="gasolina" className="bg-[#0A0A0A]">Gasolina</option>
                        <option value="etanol" className="bg-[#0A0A0A]">Etanol</option>
                        <option value="diesel" className="bg-[#0A0A0A]">Diesel</option>
                        <option value="hibrido" className="bg-[#0A0A0A]">Híbrido / Elétrico</option>
                    </select>
                </div>

                {/* Cor */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Cor Predominante</label>
                    <input
                        type="text"
                        placeholder="Ex: Branco Pérola"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <button type="button" className="bg-[#FF4D00] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#FF4D00]/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#FF4D00]/20">
                    Avançar para Fotos
                </button>
            </div>
        </form>
    )
}
