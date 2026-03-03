"use client"

import { User, Phone, Mail, MapPin, Briefcase } from "lucide-react"

export function CustomerBasicForm() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nome Completo */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Nome Completo *</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Ex: João da Silva"
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* CPF/CNPJ */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">CPF / CNPJ</label>
                    <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Apenas números"
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="email"
                            placeholder="contato@email.com"
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* Telefone Principal */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Telefone / WhatsApp *</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="(11) 99999-9999"
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

            </div>

            <div className="h-px w-full bg-white/10 my-6" />

            {/* Endereço Resumido */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Endereço (Opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">CEP</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="00000-000"
                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white/80">Cidade / Estado</label>
                        <input
                            type="text"
                            placeholder="Ex: São Paulo - SP"
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}
