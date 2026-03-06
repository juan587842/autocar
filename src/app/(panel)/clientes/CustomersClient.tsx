'use client'

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Filter, MoreHorizontal, MessageCircle, Mail, User, Edit3, Trash2, Phone, X, ChevronDown, LayoutGrid, List as ListIcon } from "lucide-react"

export default function CustomersClient({ initialCustomers = [] }: { initialCustomers: any[] }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filterSource, setFilterSource] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const displayCustomers = initialCustomers

    const mapCustomer = (c: any) => {
        const isDB = c.id && c.id.includes && c.id.includes('-')

        let mappedTags: any[] = []
        if (isDB && c.customer_tag_links) {
            mappedTags = c.customer_tag_links.map((link: any) => ({
                label: link.customer_tags?.name || 'Tag',
                color: 'bg-white/10 text-white border-white/20'
            }))
        } else if (c.tags) {
            mappedTags = c.tags
        }

        return {
            id: c.id,
            name: c.full_name || c.name || "Cliente sem Nome",
            email: c.email || "Sem e-mail",
            phone: c.phone || "Sem telefone",
            seller: isDB ? "Vendedor Loja" : c.seller,
            status: c.is_active === false ? "Inativo" : "Ativo",
            tags: mappedTags,
            lastSource: c.source || c.lastSource || "Manual",
            lastContact: isDB && c.updated_at ? c.updated_at.split('T')[0].split('-').reverse().join('/') : c.lastContact
        }
    }

    const filteredCustomers = displayCustomers.map(mapCustomer).filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
        const matchesSource = !filterSource || c.lastSource.toLowerCase() === filterSource.toLowerCase()
        const matchesStatus = !filterStatus || c.status === filterStatus
        return matchesSearch && matchesSource && matchesStatus
    })

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            const supabase = createClient()
            // Assume soft delete is implemented via update, or hard delete
            const { error } = await supabase.from('customers').update({ is_active: false }).eq('id', deleteTarget.id)
            if (error) throw error
            router.refresh()
            setDeleteTarget(null)
        } catch (e) {
            console.error("Erro ao excluir cliente", e)
            alert("Erro ao excluir cliente. Verifique as dependências.")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
                        CRM de Clientes
                        {initialCustomers.length > 0 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF4D00]">Server Connected</span>
                        )}
                    </h1>
                    <p className="text-white/60 mt-1">Gerencie leads, históricos e interações</p>
                </div>

                <Link
                    href="/clientes/novo"
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou CPF..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder:text-white/40 transition-all font-medium"
                        />
                    </div>

                    <div className="flex gap-3">
                        {/* View toggle (Hidden on Mobile, as Mobile is always Card) */}
                        <div className="hidden md:flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 bg-black/20 hover:bg-white/10 border rounded-xl transition-all whitespace-nowrap ${showFilters ? 'border-[#FF4D00]/50 text-[#FF4D00]' : 'border-white/10 text-white/80 hover:text-white'}`}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filtros Avançados</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Origem</label>
                            <select
                                value={filterSource}
                                onChange={e => setFilterSource(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                            >
                                <option value="" className="bg-[#111]">Todas as origens</option>
                                <option value="whatsapp" className="bg-[#111]">WhatsApp</option>
                                <option value="website" className="bg-[#111]">Website</option>
                                <option value="manual" className="bg-[#111]">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                            >
                                <option value="" className="bg-[#111]">Todos</option>
                                <option value="Ativo" className="bg-[#111]">Ativo</option>
                                <option value="Inativo" className="bg-[#111]">Inativo</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Card View (Sempre visível no Mobile, ou se selecionado no Desktop) ===== */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === 'card' ? 'block' : 'block md:hidden'}`}>
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all hover:shadow-2xl hover:shadow-black/50 relative">
                        {/* Ações Rápidas Absolute no Card */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Link href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/40 rounded-full transition-colors z-10" title="WhatsApp">
                                <MessageCircle className="w-4 h-4" />
                            </Link>
                            <button onClick={(e) => { e.preventDefault(); setDeleteTarget(customer) }} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-full transition-colors z-10" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <Link href={`/clientes/${customer.id}`} className="block">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-400/50 flex items-center justify-center text-red-400 font-bold shrink-0">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate group-hover:text-red-400 transition-colors">{customer.name}</h3>
                                    <p className="text-xs text-white/50">Último ctto: {customer.lastContact}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-white/70">
                                    <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                    <span className="truncate">{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/50">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {customer.tags.map((tag: any, i: number) => (
                                    <span key={i} className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${tag.color}`}>
                                        {tag.label}
                                    </span>
                                ))}
                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-white/50">
                                    {customer.lastSource}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* ===== Table View (Desktop Only) ===== */}
            <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${viewMode === 'table' ? 'hidden md:block' : 'hidden'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20">
                                <th className="px-6 py-4 font-semibold text-white/80 font-heading">Cliente</th>
                                <th className="px-6 py-4 font-semibold text-white/80 font-heading hidden md:table-cell">Contato</th>
                                <th className="px-6 py-4 font-semibold text-white/80 font-heading hidden lg:table-cell">Vendedor Associado</th>
                                <th className="px-6 py-4 font-semibold text-white/80 font-heading">Tags</th>
                                <th className="px-6 py-4 font-semibold text-white/80 font-heading text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link href={`/clientes/${customer.id}`} className="block">
                                            <div className="font-semibold text-white group-hover:text-red-400 transition-colors">
                                                {customer.name}
                                            </div>
                                            <div className="text-sm text-white/50 mt-0.5">
                                                Último ctto: {customer.lastContact}
                                            </div>
                                        </Link>
                                    </td>

                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            <MessageCircle className="w-4 h-4 text-green-400" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                                            <Mail className="w-4 h-4" />
                                            {customer.email}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs">
                                                {customer.seller.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-white/80">{customer.seller}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {customer.tags.map((tag: any, i: number) => (
                                                <span key={i} className={`px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${tag.color}`}>
                                                    {tag.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl transition-all"
                                                title="WhatsApp"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/clientes/${customer.id}`}
                                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                                                title="Editar/Perfil"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget(customer)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                                                title="Excluir (Soft Delete)"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                                        Nenhum cliente encontrado com estes dados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-white/10 bg-black/20 px-6 py-4 flex items-center justify-between text-sm text-white/60">
                    <div>
                        Mostrando <span className="text-white font-medium">{filteredCustomers.length}</span> clientes
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">Anterior</button>
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">Próxima</button>
                    </div>
                </div>
            </div>

            {/* ===== MODAL EXCLUIR ===== */}
            {
                deleteTarget && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
                        <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Excluir Cliente</h2>
                            <p className="text-white/60 text-sm mb-6">
                                Tem certeza que deseja excluir <strong className="text-white">{deleteTarget.name}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-all">
                                    Cancelar
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-all disabled:opacity-50">
                                    {isDeleting ? 'Processando...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}
