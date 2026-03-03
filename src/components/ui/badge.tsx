type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
    variant?: BadgeVariant
    children: React.ReactNode
    dot?: boolean
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30',
    warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30',
    danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/30',
    info: 'bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/30',
    neutral: 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
}

const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
    info: 'bg-[var(--color-info)]',
    neutral: 'bg-[var(--color-text-muted)]',
}

export function Badge({ variant = 'neutral', children, dot = false, className = '' }: BadgeProps) {
    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border',
                variantStyles[variant],
                className,
            ].join(' ')}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${variant === 'success' ? 'animate-pulse' : ''}`} />
            )}
            {children}
        </span>
    )
}

export type { BadgeProps, BadgeVariant }
