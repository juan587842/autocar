"use client"

import Link from "next/link"
import { ArrowLeft, Save, Calendar as CalendarIcon, Clock, User, CarFront, AlignLeft } from "lucide-react"

export default function NewAppointmentPage() {
    return (
        <div className="space-y-6 animate-fade-in text-white max-w-3xl mx-auto pb-24">

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Link
                    href="/agenda"
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:-translate-x-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent flex items-center gap-2">
                        Nova Visita
                    </h1>
                    <p className="text-white/60 mt-1 text-sm font-medium">Agende um cliente para conhecer um veículo</p>
                </div>
            </div>

            {/* Formulário Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

                {/* Glow de Fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-8 relative z-10">

                    {/* Seção 1: Quando */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-heading text-white border-b border-white/10 pb-2">1. Dia e Horário</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Data da Visita *</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium color-scheme-dark"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Horário *</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <select className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white font-medium appearance-none">
                                        <option value="" disabled selected>Selecione um horário disponível</option>
                                        <option value="09:00">09:00 - 10:00</option>
                                        <option value="10:00">10:00 - 11:00</option>
                                        <option value="11:00">11:00 - 12:00</option>
                                        <option value="13:00">13:00 - 14:00</option>
                                        <option value="14:00">14:00 - 15:00</option>
                                        <option value="15:00">15:00 - 16:00</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Quem */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-heading text-white border-b border-white/10 pb-2">2. Cliente e Interesse</h3>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Buscar Cliente */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80 flex justify-between">
                                    Cliente CRM *
                                    <Link href="/clientes/novo" className="text-red-400 hover:text-red-300 text-xs">Cadastrar novo</Link>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <select className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white font-medium appearance-none">
                                        <option value="" disabled selected>Busque por nome ou telefone...</option>
                                        <option value="1">Carlos Eduardo da Silva - (11) 98765-4321</option>
                                        <option value="2">Mariana Costa - (21) 99911-2233</option>
                                        <option value="3">Juliana Santos - (11) 96655-4433</option>
                                    </select>
                                </div>
                            </div>

                            {/* Buscar Veículo */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Veículo de Interesse (Opcional)</label>
                                <div className="relative">
                                    <CarFront className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <select className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white font-medium appearance-none">
                                        <option value="" disabled selected>Busque no estoque...</option>
                                        <option value="1">Porsche 911 Carrera S - 2024</option>
                                        <option value="2">Jeep Compass Cinza - 2023</option>
                                        <option value="3">BMW X6 M Competition - 2023</option>
                                        <option value="4">Honda Civic Si - 2020</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Observações */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-heading text-white border-b border-white/10 pb-2">3. Notas</h3>

                        <div className="space-y-2">
                            <div className="relative">
                                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                                <textarea
                                    rows={4}
                                    placeholder="Ex: Vai trazer o Honda Fit da esposa para avaliação na troca..."
                                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 resize-none font-medium leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Fixo */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 z-10 flex justify-end gap-4 px-6 md:px-12">
                <Link
                    href="/agenda"
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium text-white transition-all"
                >
                    Cancelar
                </Link>
                <button className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-full font-medium text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transform hover:-translate-y-0.5">
                    <Save className="w-5 h-5" />
                    Agendar Visita
                </button>
            </div>

            {/* Correção de CSS Local para os ícones e cor base do Date Input Nativo */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .color-scheme-dark { color-scheme: dark; }
      `}} />
        </div>
    )
}
