'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 via-transparent to-transparent" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--color-accent)]/3 rounded-full blur-[100px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6"
                >
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                    <span className="text-sm text-[var(--color-accent)] font-medium">Atendimento 24h com IA</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Encontre o carro
                    <br />
                    <span className="text-[var(--color-accent)]">dos seus sonhos</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10"
                >
                    Compre, venda e agende visitas com facilidade. Fale pelo WhatsApp a qualquer hora.
                </motion.p>

                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="max-w-xl mx-auto mb-10"
                >
                    <Link
                        href="/catalogo"
                        className="flex items-center gap-3 w-full px-5 py-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors group"
                    >
                        <Search size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                        <span className="text-[var(--color-text-muted)] text-sm sm:text-base">Buscar por marca, modelo ou ano...</span>
                        <ChevronRight size={18} className="ml-auto text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all" />
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex items-center justify-center gap-8 sm:gap-12"
                >
                    {[
                        { value: '50+', label: 'Veículos' },
                        { value: '500+', label: 'Clientes satisfeitos' },
                        { value: '24h', label: 'Atendimento IA' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-[var(--color-text-muted)]">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
