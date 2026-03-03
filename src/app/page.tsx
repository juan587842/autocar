import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { CategorySection } from '@/components/home/category-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { CtaSection } from '@/components/home/cta-section'
import { HeroBackground } from '@/components/layout/hero-background'

export const revalidate = 300 // ISR: 5 min

async function getFeaturedVehicles() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('vehicles')
      .select('*, vehicle_photos(url, is_cover), vehicle_categories(name)')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .in('status', ['available', 'reserved'])
      .order('created_at', { ascending: false })
      .limit(6)

    return data || []
  } catch {
    return []
  }
}

export default async function Home() {
  const vehicles = await getFeaturedVehicles()

  return (
    <>
      <Header />
      <main className="pt-16 relative overflow-hidden">
        <HeroBackground />
        <HeroSection />
        <CategorySection />
        <FeaturedSection vehicles={vehicles} />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
