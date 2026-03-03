'use client'

import Link from 'next/link'
import { Search, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui'

const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Venda seu Veículo', href: '/venda-seu-veiculo' },
]

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1">
                        <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            <span className="text-[var(--color-text-primary)]">Auto</span>
                            <span className="text-[var(--color-accent)]">Car</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/conta"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-all"
                        >
                            <User size={16} />
                            Minha Conta
                        </Link>
                        <Link
                            href="/catalogo"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-glow)] transition-all"
                        >
                            <Search size={16} />
                            Buscar
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
