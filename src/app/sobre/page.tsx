import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MapPin, Phone, Mail, Clock, ShieldCheck, ThumbsUp, Users, Award } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Sobre a AutoCar — Nossa História',
    description: 'Conheça a AutoCar, sua concessionária de confiança. Há anos entregando os melhores veículos com transparência e garantia.',
}

const values = [
    {
        icon: <ShieldCheck size={32} className="text-[var(--color-accent)] mb-4" />,
        title: 'Transparência',
        description: 'Veículos periciados e com histórico aprovado. Aqui você sabe exatamente o que está comprando.'
    },
    {
        icon: <Award size={32} className="text-[var(--color-accent)] mb-4" />,
        title: 'Garantia',
        description: 'Todos os nossos veículos possuem garantia de motor e câmbio, além do suporte pós-venda.'
    },
    {
        icon: <ThumbsUp size={32} className="text-[var(--color-accent)] mb-4" />,
        title: 'Confiança',
        description: 'Mais de 5.000 clientes satisfeitos em toda a nossa história e com alto índice de recomendação.'
    },
    {
        icon: <Users size={32} className="text-[var(--color-accent)] mb-4" />,
        title: 'Atendimento',
        description: 'Nossa equipe é especializada e pronta para entender e realizar o seu sonho do carro novo.'
    }
]

export default function SobrePage() {
    return (
        <>
            <Header />
            <main className="pt-20 pb-16 min-h-screen bg-[var(--color-bg-primary)]">
                {/* Hero Section */}
                <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border)] overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-secondary)] opacity-80" />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-accent)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-status-info)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Nossa paixão é conectar você ao <span className="text-[var(--color-accent)]">carro perfeito</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            A AutoCar nasceu com um propósito simples: transformar a experiência de compra de veículos.
                            Sem burocracia, com total transparência e foco absoluto no sorriso do cliente.
                        </p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, i) => (
                            <div key={i} className="relative overflow-hidden p-6 rounded-[1.5rem] bg-[var(--color-glass-bg)] backdrop-blur-2xl border border-[var(--color-glass-border)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-glass-border-hover)] hover:shadow-[0_0_30px_var(--color-glass-glow-orange)] group">
                                {/* Inner Glow */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-full blur-[40px] pointer-events-none group-hover:opacity-20 transition-opacity" />

                                <div className="relative z-10">
                                    {v.icon}
                                    <h3 className="text-xl font-bold mb-2 text-[var(--color-glass-text)]" style={{ fontFamily: 'var(--font-display)' }}>{v.title}</h3>
                                    <p className="text-[var(--color-glass-text-muted)] text-sm leading-relaxed">{v.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact/Map Section */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Venha tomar um café conosco</h2>
                                <p className="text-[var(--color-text-muted)]">
                                    Nosso showroom foi projetado para o seu conforto. São mais de 100 veículos em estoque num ambiente sofisticado e climatizado.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-lg">Endereço</h4>
                                        <p className="text-[var(--color-text-muted)]">Av. das Américas, 1000 — Barra da Tijuca<br />Rio de Janeiro, RJ</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-lg">Horário de Funcionamento</h4>
                                        <p className="text-[var(--color-text-muted)]">Segunda a Sexta: 08:00 às 18:00<br />Sábados: 09:00 às 14:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-lg">Contato</h4>
                                        <p className="text-[var(--color-text-muted)]">(21) 99999-0000<br />contato@autocar.com.br</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden relative group">
                            {/* Fake Map UI for aesthetics */}
                            <div className="absolute inset-0 bg-[#e5e5e5] dark:bg-[#1a1a1a]" style={{ backgroundImage: 'radial-gradient(circle at center, #00000010 2px, transparent 2px)', backgroundSize: '24px 24px' }}>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg-primary)] p-3 rounded-full shadow-lg border border-[var(--color-border)] z-10">
                                    <MapPin size={32} className="text-[var(--color-accent)]" />
                                </div>
                                {/* Roads */}
                                <div className="absolute top-1/4 left-0 w-full h-4 bg-[#d5d5d5] dark:bg-[#2a2a2a] rotate-12" />
                                <div className="absolute bottom-1/3 left-0 w-full h-6 bg-[#d5d5d5] dark:bg-[#2a2a2a] -rotate-6" />
                                <div className="absolute top-0 left-1/3 w-8 h-full bg-[#d5d5d5] dark:bg-[#2a2a2a] -rotate-12" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
