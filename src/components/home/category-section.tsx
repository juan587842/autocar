'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
    // Foto de um SUV branco (validado)
    { name: 'SUV', slug: 'suv', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&crop=center&w=400&h=300&q=80', count: 12 },
    // Foto de um Sedan (validado - já estava funcionando)
    { name: 'Sedan', slug: 'sedan', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&crop=center&w=400&h=300&q=80', count: 8 },
    // Foto de um Hatch (validado - já estava funcionando)
    { name: 'Hatch', slug: 'hatch', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&crop=center&w=400&h=300&q=80', count: 15 },
    // Foto de uma Picape forte e agressiva (Pexels premium - 100% stable)
    { name: 'Picape', slug: 'picape', image: 'https://images.pexels.com/photos/11194510/pexels-photo-11194510.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', count: 6 },
    // Foto de um Esportivo Porsche (validado)
    { name: 'Esportivo', slug: 'esportivo', image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&crop=center&w=400&h=300&q=80', count: 4 },
]

export function CategorySection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2
                        className="text-2xl sm:text-3xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Explore por categoria
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Encontre o tipo de veículo ideal para você
                    </p>
                </motion.div>

                {/* Mobile: Grid de 2 colunas, Tablet: 3 colunas, Desktop: 5 colunas */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:grid-cols-3">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                        >
                            <Link
                                href={`/catalogo?categoria=${cat.slug}`}
                                className="flex flex-col p-3 sm:p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-[var(--shadow-glow)] transition-all group h-full"
                            >
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[var(--color-bg-tertiary)]">
                                    <img
                                        src={cat.image}
                                        alt={`Categoria ${cat.name}`}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {/* Subtil gradiente escuro por cima da imagem */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">{cat.name}</span>
                                    <span className="text-xs text-[var(--color-text-muted)]">{cat.count} veículos</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
