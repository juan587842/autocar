'use client'

import React, { useState } from 'react'

export interface TabType {
    id: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
}

interface TabsProps {
    tabs: TabType[]
    defaultTabId?: string
}

export function Tabs({ tabs, defaultTabId }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id)

    return (
        <div className="w-full">
            {/* Header/Nav */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-white/10 mb-6 pb-px">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2 relative ${isActive
                                    ? 'text-white border-[#FF4D00]'
                                    : 'text-white/40 border-transparent hover:text-white/80 hover:border-white/20'
                                }`}
                        >
                            {/* Inner Glow quando ativo */}
                            {isActive && (
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FF4D00]/20 to-transparent pointer-events-none" />
                            )}

                            {tab.icon && (
                                <span className={`${isActive ? 'text-[#FF4D00]' : ''}`}>
                                    {tab.icon}
                                </span>
                            )}
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="relative min-h-[300px]">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-100 block' : 'opacity-0 hidden'
                            }`}
                        role="tabpanel"
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    )
}
