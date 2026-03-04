"use client"

import { Building2, Mail, MapPin, Phone } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"

export function GeneralSettings() {
    const { settings, updateSetting, isLoading } = useSettingsStore()

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-white/10 rounded col-span-2"></div><div className="h-2 bg-white/10 rounded col-span-1"></div></div><div className="h-2 bg-white/10 rounded"></div></div></div></div>
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold font-heading text-white">Configurações Gerais</h2>
                <p className="text-white/60 text-sm mt-1">Informações principais exibidas no rodapé do site e contatos oficiais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Fantasia */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Nome da Garagem</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={settings.name || ""}
                            onChange={(e) => updateSetting("name", e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* CNPJ */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">CNPJ</label>
                    <input
                        type="text"
                        value={settings.cnpj || ""}
                        onChange={(e) => updateSetting("cnpj", e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                    />
                </div>

                {/* E-mail de Contato */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">E-mail Comercial Oficial</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="email"
                            value={settings.email || ""}
                            onChange={(e) => updateSetting("email", e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* Telefone Principal */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Telefone / WhatsApp da Loja</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={settings.phone || ""}
                            onChange={(e) => updateSetting("phone", e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 font-medium"
                        />
                    </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-white/80">Endereço Completo (Usado em Mapas)</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={settings.address_street || ""}
                            onChange={(e) => updateSetting("address_street", e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white font-medium"
                        />
                    </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-white/80">Descrição Curta (SEO & Sobre)</label>
                    <textarea
                        rows={4}
                        value={settings.description || ""}
                        onChange={(e) => updateSetting("description", e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 resize-none font-medium text-sm"
                    />
                </div>
            </div>

        </div>
    )
}
