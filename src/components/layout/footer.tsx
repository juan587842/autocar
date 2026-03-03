import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="space-y-4">
                        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            <span className="text-[var(--color-text-primary)]">Auto</span>
                            <span className="text-[var(--color-accent)]">Car</span>
                        </span>
                        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
                            Sua concessionária de confiança. Carros novos e seminovos com as melhores condições.
                        </p>
                    </div>

                    {/* Links rápidos */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Navegação</h4>
                        <ul className="space-y-2">
                            {[
                                { label: 'Catálogo', href: '/catalogo' },
                                { label: 'Sobre', href: '/sobre' },
                                { label: 'Venda seu Veículo', href: '/venda-seu-veiculo' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contato */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Contato</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <MapPin size={14} className="text-[var(--color-accent)] shrink-0" />
                                São Paulo, SP
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Phone size={14} className="text-[var(--color-accent)] shrink-0" />
                                (11) 99999-0000
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Mail size={14} className="text-[var(--color-accent)] shrink-0" />
                                contato@autocar.com.br
                            </li>
                        </ul>
                    </div>

                    {/* Horários */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Horários</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Clock size={14} className="text-[var(--color-accent)] shrink-0" />
                                Seg-Sex: 08h-18h
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Clock size={14} className="text-[var(--color-accent)] shrink-0" />
                                Sáb: 09h-14h
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                <Clock size={14} className="text-[var(--color-text-muted)] shrink-0" />
                                Dom: Fechado
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--color-text-muted)]">
                        © {new Date().getFullYear()} AutoCar. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Atendimento 24h via WhatsApp com IA
                    </p>
                </div>
            </div>
        </footer>
    )
}
