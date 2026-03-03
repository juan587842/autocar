import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FilterSidebar, VehicleGrid } from '@/components/catalogo'

export const dynamic = 'force-dynamic' // Force dynamic rendering because of searchParams

async function getAggregations(supabase: any) {
    // Obter categorias ativas com count (usando uma query ou buscando as contagens manuais por enquanto)
    const { data: categories } = await supabase
        .from('vehicle_categories')
        .select('id, slug, name')
        .eq('is_active', true)
        .order('display_order')

    // Simulando agregação de counts - em um caso real usaríamos uma edge function, rpc ou view
    // Para simplificar, vamos pegar todos os carros disponíveis/reservados
    const { data: allCars } = await supabase
        .from('vehicles')
        .select('brand, category_id')
        .is('deleted_at', null)
        .in('status', ['available', 'reserved'])

    const categoryCounts: Record<string, number> = {}
    const brandCounts: Record<string, number> = {}

    allCars?.forEach((car: any) => {
        // Brand count
        brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1
        // Category count
        categoryCounts[car.category_id] = (categoryCounts[car.category_id] || 0) + 1
    })

    const formattedCategories = categories?.map((c: any) => ({
        ...c,
        count: categoryCounts[c.id] || 0
    })).sort((a: any, b: any) => b.count - a.count) || []

    const formattedBrands = Object.entries(brandCounts)
        .map(([brand, count]) => ({ brand, count: count as number }))
        .sort((a, b) => b.count - a.count)

    return { categories: formattedCategories, brands: formattedBrands }
}

async function getVehicles(supabase: any, searchParams: { [key: string]: string | undefined }) {
    const page = Number(searchParams.page) || 1
    const limit = 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('vehicles')
        .select('*, vehicle_photos(url, is_cover), vehicle_categories(name, slug)', { count: 'exact' })
        .is('deleted_at', null)
        .in('status', ['available', 'reserved'])

    // Apply filters
    if (searchParams.q) {
        query = query.or(`brand.ilike.%${searchParams.q}%,model.ilike.%${searchParams.q}%`)
    }
    if (searchParams.categoria) {
        // Look up category ID by slug first
        const { data: cat } = await supabase
            .from('vehicle_categories')
            .select('id')
            .eq('slug', searchParams.categoria)
            .single()
        if (cat) {
            query = query.eq('category_id', cat.id)
        }
    }
    if (searchParams.marca) {
        query = query.eq('brand', searchParams.marca)
    }
    if (searchParams.min_preco) {
        query = query.gte('price', searchParams.min_preco)
    }
    if (searchParams.max_preco) {
        query = query.lte('price', searchParams.max_preco)
    }
    if (searchParams.min_ano) {
        query = query.gte('year_model', searchParams.min_ano)
    }
    if (searchParams.max_ano) {
        query = query.lte('year_model', searchParams.max_ano)
    }
    if (searchParams.transmissao) {
        query = query.eq('transmission', searchParams.transmissao)
    }
    if (searchParams.combustivel) {
        query = query.eq('fuel', searchParams.combustivel)
    }

    // Ordenação (default: mais recentes)
    query = query.order('created_at', { ascending: false })

    // Pagination
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
        console.error('Error fetching vehicles:', error)
        return { vehicles: [], totalPages: 0 }
    }

    return {
        vehicles: data || [],
        totalPages: count ? Math.ceil(count / limit) : 0
    }
}

export default async function CatalogoPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const supabase = await createClient()
    const params = await searchParams

    const [{ categories, brands }, { vehicles, totalPages }] = await Promise.all([
        getAggregations(supabase),
        getVehicles(supabase, params)
    ])

    return (
        <>
            <Header />
            <main className="pt-24 pb-16 min-h-screen bg-[var(--color-bg-primary)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            Catálogo de Veículos
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Encontre o veículo perfeito para você entre nossas opções.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <FilterSidebar categories={categories} brands={brands} />
                        <VehicleGrid vehicles={vehicles} totalPages={totalPages} />
                    </div>

                </div>
            </main>
            <Footer />
        </>
    )
}
