import { Calendar, Gauge, Fuel, Settings, Palette, Car, Hash, FileText } from 'lucide-react'

interface SpecsProps {
    vehicle: {
        brand: string
        model: string
        year_fab: number
        year_model: number
        mileage: number | null
        fuel: string
        transmission: string
        color: string
        plate_end: string | null
        doors: number | null
        engine: string | null
        description: string | null
    }
    customFields: { label: string; value: string }[]
}

const fuelLabels: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    ethanol: 'Etanol',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
}

const transmissionLabels: Record<string, string> = {
    manual: 'Manual',
    automatic: 'Automático',
    cvt: 'CVT',
    automated: 'Automatizado',
}

export function VehicleSpecs({ vehicle, customFields }: SpecsProps) {
    const specs = [
        { icon: Calendar, label: 'Ano', value: `${vehicle.year_fab}/${vehicle.year_model}` },
        { icon: Gauge, label: 'Quilometragem', value: vehicle.mileage != null ? `${new Intl.NumberFormat('pt-BR').format(vehicle.mileage)} km` : '0 km' },
        { icon: Fuel, label: 'Combustível', value: fuelLabels[vehicle.fuel] || vehicle.fuel },
        { icon: Settings, label: 'Câmbio', value: transmissionLabels[vehicle.transmission] || vehicle.transmission },
        { icon: Palette, label: 'Cor', value: vehicle.color || '—' },
        { icon: Hash, label: 'Final da Placa', value: vehicle.plate_end || '—' },
        { icon: Car, label: 'Portas', value: vehicle.doors ? `${vehicle.doors}` : '—' },
        { icon: FileText, label: 'Motor', value: vehicle.engine || '—' },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Ficha Técnica</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {specs.map((spec) => (
                    <div
                        key={spec.label}
                        className="flex flex-col gap-2 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                    >
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                            <spec.icon size={14} />
                            <span className="text-xs">{spec.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{spec.value}</span>
                    </div>
                ))}
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Extras</h3>
                    <div className="flex flex-wrap gap-2">
                        {customFields.map((f) => (
                            <span
                                key={f.label}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium border border-[var(--color-accent)]/20"
                            >
                                ✓ {f.label}: {f.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            {vehicle.description && (
                <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Descrição</h3>
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
                        {vehicle.description}
                    </p>
                </div>
            )}
        </div>
    )
}
