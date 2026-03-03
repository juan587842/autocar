"use client"

import { useState } from "react"
import { Building2, Palette, Smartphone, Plug, Bot, Settings, Save, Clock, Users, Image as ImageIcon, Wallet, Grip } from "lucide-react"

import { GeneralSettings } from "./_components/general-settings"
import { VisualSettings } from "./_components/visual-settings"
import { WhatsappSettings } from "./_components/whatsapp-settings"
import { IntegrationsSettings } from "./_components/integrations-settings"
import { AiSettings } from "./_components/ai-settings"
import { AvailabilitySettings } from "./_components/availability-settings"
import { TeamSettings } from "./_components/team-settings"
import { WatermarkSettings } from "./_components/watermark-settings"
import { CommissionSettings } from "./_components/commission-settings"
import { CategorySettings } from "./_components/category-settings"

const sidebarNavItems = [
    {
        title: "Geral",
        icon: <Building2 className="w-5 h-5" />,
        id: "general",
        component: <GeneralSettings />
    },
    {
        title: "Identidade Visual",
        icon: <Palette className="w-5 h-5" />,
        id: "visual",
        component: <VisualSettings />
    },
    {
        title: "Conexão WhatsApp",
        icon: <Smartphone className="w-5 h-5" />,
        id: "whatsapp",
        component: <WhatsappSettings />
    },
    {
        title: "Inteligência Artificial",
        icon: <Bot className="w-5 h-5" />,
        id: "ai",
        component: <AiSettings />
    },
    {
        title: "Integrações e APIs",
        icon: <Plug className="w-5 h-5" />,
        id: "integrations",
        component: <IntegrationsSettings />
    },
    {
        title: "Disponibilidade",
        icon: <Clock className="w-5 h-5" />,
        id: "availability",
        component: <AvailabilitySettings />
    },
    {
        title: "Equipe",
        icon: <Users className="w-5 h-5" />,
        id: "team",
        component: <TeamSettings />
    },
    {
        title: "Marca D'água",
        icon: <ImageIcon className="w-5 h-5" />,
        id: "watermark",
        component: <WatermarkSettings />
    },
    {
        title: "Comissões",
        icon: <Wallet className="w-5 h-5" />,
        id: "commissions",
        component: <CommissionSettings />
    },
    {
        title: "Categorias",
        icon: <Grip className="w-5 h-5" />,
        id: "categories",
        component: <CategorySettings />
    }
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState(sidebarNavItems[0].id)

    const CurrentComponent = sidebarNavItems.find(item => item.id === activeTab)?.component || <GeneralSettings />

    return (
        <div className="space-y-6 animate-fade-in text-white pb-24 lg:pb-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
                        <Settings className="w-8 h-8 text-neutral-400" />
                        Configurações da Loja
                    </h1>
                    <p className="text-white/60 mt-1">Gerencie a identidade, robôs e integrações do AutoCar.</p>
                </div>

                <button className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-full font-medium text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transform hover:-translate-y-0.5 whitespace-nowrap">
                    <Save className="w-5 h-5" />
                    Salvar Tudo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Vertical Tabs */}
                <aside className="lg:col-span-1">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar z-10 relative">
                        {sidebarNavItems.map((item) => {
                            const isActive = activeTab === item.id

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                     flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap text-left border
                     ${isActive
                                            ? "bg-white/10 text-white border-white/20 shadow-[0_4px_30px_rgba(255,255,255,0.05)] backdrop-blur-md"
                                            : "text-white/50 hover:bg-white/5 hover:text-white/80 border-transparent"}
                   `}
                                >
                                    <div className={`${isActive ? 'text-red-400' : 'text-current'} transition-colors`}>{item.icon}</div>
                                    {item.title}
                                </button>
                            )
                        })}
                    </nav>
                </aside>

                {/* Dynamic Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl min-h-[500px] relative overflow-hidden">
                        {/* Subtle background glow base */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl pointer-events-none opacity-50" />

                        {/* Content Component Renderer */}
                        <div className="relative z-10">
                            {CurrentComponent}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
