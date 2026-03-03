'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldAlert, Info, Key, Trash, Settings, LogIn, KeyRound } from 'lucide-react'

type LogEntry = {
    id: string
    action: string
    target_table: string
    target_id: string
    details: any
    created_at: string
    users: { name?: string; email: string; role?: string } | null
}

export default function LogsClient({ initialLogs }: { initialLogs: LogEntry[] }) {
    const [search, setSearch] = useState('')

    const filteredLogs = initialLogs.filter(log => {
        const query = search.toLowerCase()
        return (
            log.action.toLowerCase().includes(query) ||
            log.target_table.toLowerCase().includes(query) ||
            log.users?.name?.toLowerCase().includes(query) ||
            log.users?.email.toLowerCase().includes(query)
        )
    })

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATED': return 'text-green-500 bg-green-500/10'
            case 'UPDATED': return 'text-blue-500 bg-blue-500/10'
            case 'DELETED': return 'text-red-500 bg-red-500/10'
            default: return 'text-white/70 bg-white/10'
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <ShieldAlert className="w-6 h-6 text-[#FF4D00]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Trilha de Auditoria</h1>
                    <p className="text-white/60">Monitoramento e log de atividades críticas do sistema</p>
                </div>
            </div>

            {/* Search */}
            <div className="mt-8 mb-6">
                <input
                    type="text"
                    placeholder="Buscar logs por usuário, entidade ou ação..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF4D00] transition-colors"
                />
            </div>

            {/* Logs List */}
            <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                                <th className="p-4 font-semibold">Data e Hora</th>
                                <th className="p-4 font-semibold">Usuário Responsável</th>
                                <th className="p-4 font-semibold">Ação</th>
                                <th className="p-4 font-semibold">Entidade Alvo</th>
                                <th className="p-4 font-semibold hidden md:table-cell">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/50">
                                        Nenhum log encontrado para a busca atual.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-sm text-white/80">
                                            {format(new Date(log.created_at), "dd 'de' MMM, HH:mm:ss", { locale: ptBR })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">
                                                    {log.users?.name || 'Sistema / Usuário Deletado'}
                                                </span>
                                                <span className="text-xs text-white/50">
                                                    {log.users?.email} • {log.users?.role || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white capitalize">{log.target_table}</span>
                                                <span className="text-xs text-white/30 truncate max-w-[120px]" title={log.target_id}>
                                                    {log.target_id || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-xs text-white/40 max-w-[200px] truncate">
                                            <pre className="inline-block truncate max-w-full">
                                                {JSON.stringify(log.details)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
