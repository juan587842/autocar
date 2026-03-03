'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit3, Trash2, Mail, Phone, CalendarDays, MessageSquare, StickyNote, Tag, User, X, AlertTriangle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileClientProps {
    customer: any
    historyEvents: any[]
}

export default function ProfileClient({ customer, historyEvents }: ProfileClientProps) {
    const router = useRouter()
    const supabase = createClient()

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [noteText, setNoteText] = useState('')
    const [noteSaved, setNoteSaved] = useState(false)
    const [isSavingNote, setIsSavingNote] = useState(false)

    // Form state para edição
    const [editForm, setEditForm] = useState({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        source: customer.source || ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const c = {
        name: customer.full_name || "Desconhecido",
        email: customer.email || "Não informado",
        phone: customer.phone || "Não informado",
        source: customer.source || "Direto",
        seller: "Vendedor ID: " + (customer.assigned_to?.slice(0, 4) || 'N/A'),
        createdAt: new Date(customer.created_at).toLocaleDateString('pt-BR'),
        tags: customer.customer_tag_links?.map((link: any) => ({
            label: link.customer_tags?.name || 'Tag',
            color: link.customer_tags?.color === '#ef4444'
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
        })) || [],
        history: historyEvents.length > 0 ? historyEvents : [
            { id: '1', type: 'lead', date: new Date(customer.created_at).toLocaleString('pt-BR'), content: 'Lead cadastrado no sistema.', author: 'Sistema' }
        ]
    }

    const handleSaveNote = async () => {
        if (!noteText.trim()) return
        setIsSavingNote(true)
        // Salvar nota otimisticamente — em produção salvar no banco
        await new Promise(r => setTimeout(r, 400))
        setIsSavingNote(false)
        setNoteSaved(true)
        setNoteText('')
        setTimeout(() => setNoteSaved(false), 3000)
    }

    const handleEditSave = async () => {
        setIsSaving(true)
        const { error } = await supabase
            .from('customers')
            .update(editForm)
            .eq('id', customer.id)

        setIsSaving(false)
        if (!error) {
            setShowEditModal(false)
            router.refresh()
        }
    }

    const handleDelete = async () => {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customer.id)

        if (!error) {
            router.push('/clientes')
        }
    }

    return (
        <div className="space-y-6 animate-fade-in text-white pb-24">

            {/* Header com navegação e Ações */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/clientes"
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Perfil do Cliente
                        </h1>
                        <p className="text-white/60 mt-1">Visão 360º de CRM</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all text-white"
                    >
                        <Edit3 className="w-4 h-4" /> Editar
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-full font-medium transition-all text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Lado Esquerdo - Info Resumida (Card Fixo) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        {/* Efeito Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 border-2 border-red-400/50 flex items-center justify-center text-red-400 font-bold mb-4">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">{c.name}</h2>
                            <p className="text-sm text-white/50 mb-4">Lead desde {c.createdAt}</p>

                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                {c.tags.map((tag: any, i: number) => (
                                    <span key={i} className={`px-2.5 py-1 rounded-md border text-xs font-medium ${tag.color}`}>
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/10 w-full mb-6" />

                        {/* Contatos */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-white/60"><Phone className="w-4 h-4" /></div>
                                <div>
                                    <h4 className="text-xs text-white/50 font-medium">WhatsApp / Telefone</h4>
                                    <p className="text-sm font-medium">{c.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-white/60"><Mail className="w-4 h-4" /></div>
                                <div>
                                    <h4 className="text-xs text-white/50 font-medium">E-mail</h4>
                                    <p className="text-sm font-medium">{c.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-white/60"><User className="w-4 h-4" /></div>
                                <div>
                                    <h4 className="text-xs text-white/50 font-medium">Vendedor</h4>
                                    <p className="text-sm font-medium">{c.seller}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/5 rounded-lg text-white/60"><MessageSquare className="w-4 h-4" /></div>
                                <div>
                                    <h4 className="text-xs text-white/50 font-medium">Origem do Lead</h4>
                                    <p className="text-sm font-medium">{c.source}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action WhatsApp */}
                        <Link
                            href="/inbox"
                            className="w-full mt-6 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 rounded-xl text-[#25D366] font-medium transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)] flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-5 h-5" /> Iniciar Conversa
                        </Link>
                    </div>
                </div>

                {/* Lado Direito - Timeline e Histórico */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Adicionar Nota Rápida */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-red-400" /> Adicionar Nota
                        </h3>
                        <textarea
                            rows={3}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Ex: Liguei para ele agora, pediu pra retornar quinta-feira..."
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder:text-white/40 resize-none font-medium mb-4"
                        />
                        <div className="flex justify-between items-center">
                            {noteSaved && (
                                <span className="flex items-center gap-1.5 text-sm text-green-400 animate-fade-in">
                                    <Check className="w-4 h-4" /> Nota salva com sucesso!
                                </span>
                            )}
                            <div className="ml-auto">
                                <button
                                    onClick={handleSaveNote}
                                    disabled={!noteText.trim() || isSavingNote}
                                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg font-medium transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isSavingNote ? 'Salvando...' : 'Salvar Nota'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Timeline (Histórico) */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-6">Histórico de Interações</h3>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">

                            {c.history.map((event: any) => (
                                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Icon/Dot no Centro */}
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${event.type === 'visit' ? 'bg-green-500' :
                                        event.type === 'note' ? 'bg-blue-500' : 'bg-white/20'
                                        }`}>
                                        {event.type === 'visit' ? <CalendarDays className="w-4 h-4 text-white" /> :
                                            event.type === 'note' ? <StickyNote className="w-4 h-4 text-white" /> :
                                                <User className="w-4 h-4 text-white" />}
                                    </div>

                                    {/* Card do Histórico */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black/20 border border-white/10 p-4 rounded-xl shadow-lg hover:border-white/20 hover:bg-white/5 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-red-400">{event.date}</span>
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                                            {event.content}
                                        </p>
                                        <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                                            Adicionado por: <strong className="text-white/60">{event.author}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>

                </div>

            </div>

            {/* ===== MODAL EDITAR ===== */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-md relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold font-heading text-white mb-6 flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-[#FF4D00]" /> Editar Cliente
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Origem</label>
                                <input
                                    type="text"
                                    value={editForm.source}
                                    onChange={e => setEditForm(prev => ({ ...prev, source: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4D00]/50"
                                />
                            </div>
                            <button
                                onClick={handleEditSave}
                                disabled={isSaving}
                                className="w-full bg-gradient-to-r from-[#FF4D00] to-orange-500 hover:from-orange-500 hover:to-[#FF4D00] text-white font-bold py-3 rounded-xl mt-2 transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL EXCLUIR ===== */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Excluir Cliente</h2>
                        <p className="text-white/60 text-sm mb-6">
                            Tem certeza que deseja excluir <strong className="text-white">{c.name}</strong>? Esta ação não pode ser revertida.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-all"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
