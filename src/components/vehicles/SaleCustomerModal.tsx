'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search, UserPlus, Check } from 'lucide-react'

interface Customer {
    id: string
    full_name: string
    phone: string
}

interface SaleCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (buyerId: string | null) => void
    carModel: string
}

export function SaleCustomerModal({ isOpen, onClose, onConfirm, carModel }: SaleCustomerModalProps) {
    const supabase = createClient()
    const [mode, setMode] = useState<'search' | 'new'>('search')
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Form inputs for new customer
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('')
            setCustomers([])
            setNewName('')
            setNewPhone('')
            setMode('search')
        } else {
            // Load recently active customers
            fetchRecentCustomers()
        }
    }, [isOpen])

    useEffect(() => {
        if (mode === 'search' && searchQuery.length > 2) {
            const timer = setTimeout(searchCustomers, 500)
            return () => clearTimeout(timer)
        } else if (mode === 'search' && searchQuery.length === 0) {
            fetchRecentCustomers()
        }
    }, [searchQuery, mode])

    async function fetchRecentCustomers() {
        setIsLoading(true)
        const { data } = await supabase
            .from('customers')
            .select('id, full_name, phone')
            .order('created_at', { ascending: false })
            .limit(5)
        setCustomers(data || [])
        setIsLoading(false)
    }

    async function searchCustomers() {
        setIsLoading(true)
        const { data } = await supabase
            .from('customers')
            .select('id, full_name, phone')
            .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
            .limit(10)
        setCustomers(data || [])
        setIsLoading(false)
    }

    async function handleSelectExisting(customerId: string) {
        onConfirm(customerId)
    }

    async function handleCreateNew() {
        if (!newName.trim() || !newPhone.trim()) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from('customers')
            .insert({ full_name: newName, phone: newPhone, status: 'new' })
            .select('id')
            .single()

        setIsLoading(false)
        if (data) {
            onConfirm(data.id)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-fade-in relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Venda do Veículo</h2>
                        <p className="text-sm text-white/50 mt-1">Vincular comprador para o {carModel}</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setMode('search')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'search' ? 'text-[#FF4D00] border-b-2 border-[#FF4D00] bg-[#FF4D00]/5' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        Buscar Cliente
                    </button>
                    <button
                        onClick={() => setMode('new')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'new' ? 'text-[#FF4D00] border-b-2 border-[#FF4D00] bg-[#FF4D00]/5' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        Novo Cliente
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {mode === 'search' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou telefone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {isLoading ? (
                                    <p className="text-center text-white/40 text-sm py-4">Buscando...</p>
                                ) : customers.length > 0 ? (
                                    customers.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelectExisting(c.id)}
                                            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-[#FF4D00]/50 transition-all text-left group"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{c.full_name}</p>
                                                <p className="text-white/50 text-xs mt-0.5">{c.phone}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-[#FF4D00]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Check className="w-4 h-4 text-[#FF4D00]" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-white/40 text-sm py-4">Nenhum cliente encontrado.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ex: João da Silva"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Telefone (WhatsApp)</label>
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder="Ex: 5511999999999"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <button
                                onClick={handleCreateNew}
                                disabled={!newName.trim() || !newPhone.trim() || isLoading}
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FF4D00] text-white py-3 rounded-xl font-medium hover:bg-[#FF4D00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <UserPlus className="w-4 h-4" />
                                Cadastrar e Vincular
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                    <button
                        onClick={() => onConfirm(null)}
                        className="w-full py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                        Vender sem vincular cliente agora
                    </button>
                </div>
            </div>
        </div>
    )
}
