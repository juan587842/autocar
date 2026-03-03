'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Input, Select, Button, Badge } from '@/components/ui'
import { SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterSidebarProps {
    categories: { slug: string; name: string; count: number }[]
    brands: { brand: string; count: number }[]
}

const transmissions = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automático' },
    { value: 'cvt', label: 'CVT' },
    { value: 'automated', label: 'Automatizado' },
]

const fuels = [
    { value: 'flex', label: 'Flex' },
    { value: 'gasoline', label: 'Gasolina' },
    { value: 'ethanol', label: 'Etanol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Elétrico' },
    { value: 'hybrid', label: 'Híbrido' },
]

function FilterContent({ categories, brands, searchParams, handleFilterChange, applyRanges, clearFilters, hasFilters, minPrice, setMinPrice, maxPrice, setMaxPrice, minYear, setMinYear, maxYear, setMaxYear }: any) {
    return (
        <>
            <div className="relative z-10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-glass-text)]" style={{ fontFamily: 'var(--font-display)' }}>Filtros</h2>
                {hasFilters && (
                    <button onClick={clearFilters} className="text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
                        Limpar
                    </button>
                )}
            </div>

            <div className="relative z-10 space-y-6">
                {/* Busca por texto */}
                <div>
                    <Input
                        placeholder="Buscar modelo..."
                        defaultValue={searchParams.get('q') || ''}
                        onChange={(e: any) => {
                            const timeout = setTimeout(() => {
                                handleFilterChange('q', e.target.value)
                            }, 500)
                            return () => clearTimeout(timeout)
                        }}
                    />
                </div>

                {/* Categorias */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">Categoria</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                        {categories.map((c: any) => {
                            const isActive = searchParams.get('categoria') === c.slug
                            return (
                                <button
                                    key={c.slug}
                                    onClick={() => handleFilterChange('categoria', isActive ? '' : c.slug)}
                                    className={`flex items-center justify-between w-full text-sm py-2 px-1 transition-colors cursor-pointer ${isActive ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent)]'
                                        }`}
                                >
                                    <span>{c.name}</span>
                                    <Badge variant={isActive ? 'success' : 'neutral'} className="text-[10px] px-1.5 py-0">{c.count}</Badge>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Marca */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">Marca</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                        {brands.map((b: any) => {
                            const isActive = searchParams.get('marca') === b.brand
                            return (
                                <button
                                    key={b.brand}
                                    onClick={() => handleFilterChange('marca', isActive ? '' : b.brand)}
                                    className={`flex items-center justify-between w-full text-sm py-2 px-1 transition-colors cursor-pointer ${isActive ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent)]'
                                        }`}
                                >
                                    <span>{b.brand}</span>
                                    <Badge variant={isActive ? 'success' : 'neutral'} className="text-[10px] px-1.5 py-0">{b.count}</Badge>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Ano */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">Ano</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="number"
                            placeholder="De"
                            value={minYear}
                            onChange={(e: any) => setMinYear(e.target.value)}
                            onBlur={applyRanges}
                            onKeyDown={(e: any) => e.key === 'Enter' && applyRanges()}
                        />
                        <Input
                            type="number"
                            placeholder="Até"
                            value={maxYear}
                            onChange={(e: any) => setMaxYear(e.target.value)}
                            onBlur={applyRanges}
                            onKeyDown={(e: any) => e.key === 'Enter' && applyRanges()}
                        />
                    </div>
                </div>

                {/* Preço */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">Faixa de Preço</h3>
                    <div className="flex flex-col gap-2 mb-2">
                        <Input
                            type="number"
                            placeholder="Min. (R$)"
                            value={minPrice}
                            onChange={(e: any) => setMinPrice(e.target.value)}
                            onBlur={applyRanges}
                            onKeyDown={(e: any) => e.key === 'Enter' && applyRanges()}
                        />
                        <Input
                            type="number"
                            placeholder="Máx. (R$)"
                            value={maxPrice}
                            onChange={(e: any) => setMaxPrice(e.target.value)}
                            onBlur={applyRanges}
                            onKeyDown={(e: any) => e.key === 'Enter' && applyRanges()}
                        />
                    </div>
                </div>

                {/* Transmissão */}
                <div>
                    <Select
                        label="Câmbio"
                        options={transmissions}
                        placeholder="Qualquer"
                        value={searchParams.get('transmissao') || ''}
                        onChange={(e: any) => handleFilterChange('transmissao', e.target.value)}
                    />
                </div>

                {/* Combustível */}
                <div>
                    <Select
                        label="Combustível"
                        options={fuels}
                        placeholder="Qualquer"
                        value={searchParams.get('combustivel') || ''}
                        onChange={(e: any) => handleFilterChange('combustivel', e.target.value)}
                    />
                </div>
            </div>
        </>
    )
}

export function FilterSidebar({ categories, brands }: FilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [mobileOpen, setMobileOpen] = useState(false)

    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
    const [minYear, setMinYear] = useState(searchParams.get('min_year') || '')
    const [maxYear, setMaxYear] = useState(searchParams.get('max_year') || '')

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            params.set('page', '1')
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string) => {
        router.push(`/catalogo?${createQueryString(key, value)}`)
    }

    const applyRanges = () => {
        let params = new URLSearchParams(searchParams.toString())
        if (minPrice) params.set('min_price', minPrice)
        else params.delete('min_price')
        if (maxPrice) params.set('max_price', maxPrice)
        else params.delete('max_price')
        if (minYear) params.set('min_year', minYear)
        else params.delete('min_year')
        if (maxYear) params.set('max_year', maxYear)
        else params.delete('max_year')
        params.set('page', '1')
        router.push(`/catalogo?${params.toString()}`)
    }

    const clearFilters = () => {
        setMinPrice('')
        setMaxPrice('')
        setMinYear('')
        setMaxYear('')
        router.push('/catalogo')
    }

    const hasFilters = Array.from(searchParams.keys()).some(k => k !== 'page')
    const activeCount = Array.from(searchParams.keys()).filter(k => k !== 'page').length

    const sharedProps = {
        categories, brands, searchParams, handleFilterChange, applyRanges, clearFilters, hasFilters,
        minPrice, setMinPrice, maxPrice, setMaxPrice, minYear, setMinYear, maxYear, setMaxYear,
    }

    return (
        <>
            {/* Mobile: Floating Filter Button */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl bg-[#181a22]/60 backdrop-blur-2xl border border-white/10 text-white font-medium text-sm hover:bg-[#181a22]/80 transition-all cursor-pointer"
                >
                    <SlidersHorizontal size={18} className="text-[var(--color-accent)]" />
                    <span>Filtros</span>
                    {activeCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold">
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile: Slide-up Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-black/60"
                            onClick={() => setMobileOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--color-bg-primary)] backdrop-blur-2xl border-t border-[var(--color-glass-border)] shadow-2xl"
                        >
                            <div className="p-6 space-y-6">
                                {/* Drag Handle */}
                                <div className="flex justify-center -mt-2 mb-2">
                                    <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
                                </div>

                                {/* Close button */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-[var(--color-glass-text)]" style={{ fontFamily: 'var(--font-display)' }}>Filtros</h2>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="p-2 rounded-xl bg-[var(--color-glass-inner)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <FilterContent {...sharedProps} />

                                {/* Apply button */}
                                <div className="pt-4 border-t border-[var(--color-border)]">
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-semibold text-base hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-[var(--shadow-glow)]"
                                    >
                                        Ver resultados
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop: Static Sidebar */}
            <aside className="hidden lg:block relative w-64 shrink-0 space-y-6 overflow-hidden rounded-[1.5rem] bg-[var(--color-glass-bg)] backdrop-blur-2xl border border-[var(--color-glass-border)] p-6 shadow-xl transition-all duration-300 self-start sticky top-28">
                {/* Inner Glows */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--color-glass-glow-orange)] rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-10 -right-20 w-48 h-48 bg-[var(--color-glass-glow-blue)] rounded-full blur-[60px] pointer-events-none" />

                <FilterContent {...sharedProps} />
            </aside>
        </>
    )
}
