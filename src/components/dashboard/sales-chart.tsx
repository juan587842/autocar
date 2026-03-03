interface DataPoint {
    label: string
    value: number
}

interface SalesChartProps {
    data: DataPoint[]
    title: string
    subtitle?: string
}

export function SalesChart({ data, title, subtitle }: SalesChartProps) {
    // Achar o maior valor para calcular as proporções (altura máxima das barras)
    const maxValue = Math.max(...data.map(d => d.value))

    return (
        <div className="relative group rounded-[1.5rem] bg-white/[0.03] border border-white/10 p-6 md:p-8 backdrop-blur-2xl flex flex-col h-full overflow-hidden">
            {/* Spotlight sutil no background do gráfico */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D00]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="mb-8 relative z-10">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 relative z-10 mt-auto h-full min-h-[200px]">
                {data.map((item, index) => {
                    // Prevenir divisão por zero e travar um min-height visual
                    const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 group/bar h-full justify-end">
                            {/* Tooltip Hover (Valor) */}
                            <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity mb-2 text-xs font-semibold text-white bg-white/10 px-2 py-1 rounded backdrop-blur-md border border-white/10 whitespace-nowrap">
                                {item.value} vendas
                            </div>

                            {/* Barra com Gradiente Aura */}
                            <div className="w-full max-w-[48px] relative flex justify-end flex-col rounded-t flex-1 bg-white/5 border-l border-r border-t border-white/5 overflow-hidden transition-all duration-500 group-hover/bar:bg-white/10">
                                <div
                                    className="w-full bg-gradient-to-t from-[#FF4D00]/20 to-[#FF4D00] rounded-t transition-all duration-1000 ease-out relative overflow-hidden"
                                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                >
                                    {/* Reflexo de vidro interno na barra */}
                                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                                </div>
                            </div>

                            {/* Label do Mês */}
                            <span className="mt-3 text-xs sm:text-sm font-medium text-white/50 group-hover/bar:text-white transition-colors">
                                {item.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Linha base do gráfico */}
            <div className="absolute bottom-12 sm:bottom-14 left-6 md:left-8 right-6 md:right-8 h-[1px] bg-white/10 pointer-events-none" />
        </div>
    )
}
