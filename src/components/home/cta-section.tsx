'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Car, ArrowRight } from 'lucide-react'

export function CtaSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-accent)] to-[#cc3d00] p-8 sm:p-12 lg:p-16"
                >
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 mb-4">
                                <Car size={16} className="text-white" />
                                <span className="text-sm text-white/90 font-medium">Quer vender seu veículo?</span>
                            </div>
                            <h2
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Venda seu veículo com facilidade
                            </h2>
                            <p className="text-white/80 max-w-lg">
                                Envie os dados do seu veículo e nossa equipe faz uma avaliação gratuita.
                                Processo rápido e seguro.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/venda-seu-veiculo"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-lg)] bg-white text-[var(--color-accent)] font-bold text-base hover:bg-white/90 hover:gap-4 transition-all shadow-lg"
                            >
                                Enviar proposta
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
