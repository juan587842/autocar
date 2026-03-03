"use client"

import Link from "next/link"
import { ArrowLeft, Save, User, Tag } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"

// Import dos sub-formulários
import { CustomerBasicForm } from "./_components/customer-basic-form"
import { CustomerCategoryForm } from "./_components/customer-category-form"

// Definição das Abas
const tabs = [
    {
        id: "basic",
        label: "Dados Básicos",
        icon: <User className="w-4 h-4" />,
        content: <CustomerBasicForm />
    },
    {
        id: "category",
        label: "Perfil & Tags",
        icon: <Tag className="w-4 h-4" />,
        content: <CustomerCategoryForm />
    }
]

export default function NewCustomerPage() {
    return (
        <div className="space-y-6 animate-fade-in relative pb-24">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/clientes"
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:-translate-x-1"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Adicionar Cliente
                    </h1>
                    <p className="text-white/60 mt-1">Preencha os dados e gerencie as tags do lead</p>
                </div>
            </div>

            {/* Tabs Container */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <Tabs tabs={tabs} defaultTabId="basic" />
            </div>

            {/* Footer Colado na Tela */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 z-10 flex justify-end gap-4 px-6 md:px-12">
                <Link
                    href="/clientes"
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium text-white transition-all"
                >
                    Cancelar
                </Link>
                <button className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 rounded-full font-medium text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                    <Save className="w-5 h-5" />
                    Salvar Cliente
                </button>
            </div>

        </div>
    )
}
