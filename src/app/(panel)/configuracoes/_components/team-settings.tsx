"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Shield, ShieldCheck, ShieldAlert, MoreHorizontal, Trash2, Mail, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const ROLE_MAP: Record<string, { label: string; color: string; icon: any }> = {
    owner: { label: 'Proprietário', color: 'text-[#FF4D00] bg-[#FF4D00]/10 border-[#FF4D00]/20', icon: ShieldAlert },
    manager: { label: 'Gerente', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: ShieldCheck },
    seller: { label: 'Vendedor', color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: Shield },
}

type TeamMember = {
    id: string
    full_name: string
    phone: string | null
    role: string
    is_active: boolean
    created_at: string
    email?: string
}

export function TeamSettings() {
    const supabase = createClient()
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteName, setInviteName] = useState('')
    const [inviteRole, setInviteRole] = useState('seller')
    const [inviting, setInviting] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    useEffect(() => {
        loadMembers()
    }, [])

    useEffect(() => {
        const handler = () => setActiveDropdown(null)
        if (activeDropdown) document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [activeDropdown])

    const loadMembers = async () => {
        setLoading(true)
        // Get members from public.users and try to get email from auth
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: true })
        if (data) setMembers(data)
        setLoading(false)
    }

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('users').update({ is_active: !current }).eq('id', id)
        setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m))
    }

    const changeRole = async (id: string, newRole: string) => {
        await supabase.from('users').update({ role: newRole }).eq('id', id)
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m))
        setActiveDropdown(null)
    }

    const handleInvite = async () => {
        if (!inviteEmail || !inviteName) return
        setInviting(true)

        // Create user via Supabase Auth (signup with temporary password)
        const { data, error } = await supabase.auth.signUp({
            email: inviteEmail,
            password: 'AutoCar@2026!',
            options: {
                data: { full_name: inviteName }
            }
        })

        if (data?.user) {
            // Update role in public.users table
            await supabase.from('users').update({ role: inviteRole, full_name: inviteName }).eq('id', data.user.id)
            await loadMembers()
        }

        setInviting(false)
        setShowInvite(false)
        setInviteEmail('')
        setInviteName('')
        setInviteRole('seller')
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" /> Gestão de Equipe
                    </h2>
                    <p className="text-white/60 text-sm mt-1">Gerencie os membros, papéis e permissões da sua loja.</p>
                </div>
                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl font-medium text-white transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)] text-sm"
                >
                    <UserPlus className="w-4 h-4" /> Convidar
                </button>
            </div>

            {/* Invite Form */}
            {showInvite && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-4 animate-fade-in">
                    <h3 className="text-white font-medium text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-purple-400" /> Convidar Novo Membro
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Nome Completo</label>
                            <input
                                type="text"
                                value={inviteName}
                                onChange={e => setInviteName(e.target.value)}
                                placeholder="João Silva"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">E-mail</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                placeholder="joao@email.com"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Papel</label>
                            <select
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="seller" className="bg-[#111]">Vendedor</option>
                                <option value="manager" className="bg-[#111]">Gerente</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowInvite(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white font-medium transition-all">
                            Cancelar
                        </button>
                        <button onClick={handleInvite} disabled={inviting} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-bold transition-all disabled:opacity-50">
                            {inviting ? 'Convidando...' : 'Enviar Convite'}
                        </button>
                    </div>
                </div>
            )}

            {/* Roles Legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(ROLE_MAP).map(([key, role]) => {
                    const Icon = role.icon
                    return (
                        <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${role.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {role.label}
                        </div>
                    )
                })}
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-white/30">Carregando equipe...</div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 text-white/30">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        Nenhum membro cadastrado.
                    </div>
                ) : (
                    members.map(member => {
                        const roleInfo = ROLE_MAP[member.role] || ROLE_MAP.seller
                        const RoleIcon = roleInfo.icon
                        return (
                            <div key={member.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${member.is_active ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/20 border-white/5 opacity-60'}`}>
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-[#FF4D00]/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold text-lg shrink-0">
                                        {member.full_name?.charAt(0).toUpperCase() || '?'}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">{member.full_name || 'Sem nome'}</p>
                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${roleInfo.color}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {roleInfo.label}
                                            </span>
                                            {!member.is_active && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                                                    Desativado
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {member.phone && (
                                                <span className="flex items-center gap-1 text-xs text-white/40">
                                                    <Phone className="w-3 h-3" /> {member.phone}
                                                </span>
                                            )}
                                            <span className="text-xs text-white/30">
                                                Desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 relative">
                                    {/* Toggle Active */}
                                    <button
                                        onClick={() => toggleActive(member.id, member.is_active)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${member.is_active ? 'bg-green-500' : 'bg-white/20'}`}
                                        title={member.is_active ? 'Desativar membro' : 'Ativar membro'}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${member.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>

                                    {/* Role Dropdown */}
                                    {member.role !== 'owner' && (
                                        <div className="relative">
                                            <button
                                                onClick={e => { e.stopPropagation(); setActiveDropdown(activeDropdown === member.id ? null : member.id) }}
                                                className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {activeDropdown === member.id && (
                                                <div className="absolute right-0 top-full mt-1 w-44 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 py-1 animate-fade-in" onClick={e => e.stopPropagation()}>
                                                    <p className="px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider font-bold">Alterar papel</p>
                                                    <button
                                                        onClick={() => changeRole(member.id, 'manager')}
                                                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/10 transition-colors ${member.role === 'manager' ? 'text-purple-400' : 'text-white/70'}`}
                                                    >
                                                        <ShieldCheck className="w-4 h-4" /> Gerente
                                                    </button>
                                                    <button
                                                        onClick={() => changeRole(member.id, 'seller')}
                                                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/10 transition-colors ${member.role === 'seller' ? 'text-green-400' : 'text-white/70'}`}
                                                    >
                                                        <Shield className="w-4 h-4" /> Vendedor
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
