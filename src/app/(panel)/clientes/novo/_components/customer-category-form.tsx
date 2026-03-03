"use client"

import { Tag, MessageSquare, StickyNote } from "lucide-react"

// Mocks simulando tags disponíveis configuráveis pela loja
const mockTags = [
    "Lead Quente", "Lead Frio", "SUV", "Sedan", "Hatch",
    "Financiamento", "Troca", "Investidor", "Família"
]

export function CustomerCategoryForm() {
    return (
        <div className="space-y-8">

            {/* Origem do Cliente */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Qual a origem de contato?
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {["WhatsApp", "Instagram", "Formulário Site", "Visita na Loja"].map((source) => (
                        <label key={source} className="cursor-pointer group">
                            <input type="radio" name="origin" className="peer sr-only" />
                            <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 text-sm font-medium transition-all group-hover:bg-white/10 peer-checked:bg-red-500/20 peer-checked:border-red-500/50 peer-checked:text-white text-center">
                                {source}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Interesses e Tags */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Selecione as Tags de Perfil
                </label>
                <div className="flex flex-wrap gap-2">
                    {mockTags.map((tag) => (
                        <label key={tag} className="cursor-pointer">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm transition-all hover:bg-white/10 hover:text-white peer-checked:bg-white peer-checked:text-black font-medium">
                                {tag}
                            </div>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-white/40 mt-2">
                    Tags ajudam a filtrar e encontrar clientes para campanhas de marketing futuras.
                </p>
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Observações Ocultas (Internas) */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Observações Iniciais Gerais (Opcional)
                </label>
                <textarea
                    rows={4}
                    placeholder="Ex: Cliente tem interesse somente em carros automáticos de até 80k e disse que o filho também vai aprender a dirigir. Necessita avaliação do Fox 2018 dele para dar de entrada..."
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 resize-none font-medium leading-relaxed"
                />
                <p className="text-xs focus:ring-red-500/50 text-white/30 text-right">0 / 500</p>
            </div>

        </div>
    )
}
