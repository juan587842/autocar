import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VehicleOfferForm } from '@/components/forms/vehicle-offer-form'
import { Car, DollarSign, Clock } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Venda seu Veículo — AutoCar',
    description: 'Avaliação rápida, justa e segura do seu veículo. Preencha o formulário e receba nossa proposta.',
}

export default function VendaSeuVeiculoPage() {
    return (
        <>
            <Header />
            <main className="pt-20 pb-16 min-h-screen bg-[var(--color-bg-primary)]">
                {/* Banner */}
                <div className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center space-y-3 sm:space-y-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Vendendo o seu carro? Nós avaliamos.
                        </h1>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            Preencha os dados abaixo e nossa equipe entrará em contato com uma proposta justa, baseada no mercado e na condição do seu veículo.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Steps / Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Como funciona?</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] flex items-center justify-center font-bold text-lg">1</div>
                                        <div>
                                            <h4 className="font-medium text-lg mb-1">Preencha o formulário</h4>
                                            <p className="text-sm text-[var(--color-text-muted)]">Envie os dados do seu veículo e fotos pelo nosso ambiente seguro.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] flex items-center justify-center font-bold text-lg">2</div>
                                        <div>
                                            <h4 className="font-medium text-lg mb-1">Avaliação preliminar</h4>
                                            <p className="text-sm text-[var(--color-text-muted)]">Nossa equipe analisa as informações e entra em contato via WhatsApp rápida.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] flex items-center justify-center font-bold text-lg">3</div>
                                        <div>
                                            <h4 className="font-medium text-lg mb-1">Vistoria e Pagamento</h4>
                                            <p className="text-sm text-[var(--color-text-muted)]">Agendamos uma avaliação física. Estando tudo certo, o pagamento é feito à vista.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--color-accent)] text-white">
                                <h3 className="text-xl font-bold mb-2">Por que vender para nós?</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2"><DollarSign size={18} /> Pagamento à vista e seguro</li>
                                    <li className="flex items-center gap-2"><Clock size={18} /> Avaliação rápida e sem burocracia</li>
                                    <li className="flex items-center gap-2"><Car size={18} /> Recebemos veículos com dívida financeira</li>
                                </ul>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <VehicleOfferForm />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
