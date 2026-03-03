'use client'

interface ToggleProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    disabled?: boolean
    size?: 'sm' | 'md'
}

export function Toggle({ checked, onChange, label, disabled = false, size = 'md' }: ToggleProps) {
    const trackSize = size === 'sm' ? 'w-8 h-4.5' : 'w-11 h-6'
    const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
    const thumbTranslate = size === 'sm' ? 'translate-x-3.5' : 'translate-x-5'

    return (
        <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <button
                role="switch"
                type="button"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={[
                    `relative inline-flex shrink-0 ${trackSize} rounded-full`,
                    'transition-colors duration-[var(--duration-normal)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
                    checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
                ].join(' ')}
            >
                <span
                    className={[
                        `inline-block ${thumbSize} rounded-full bg-white shadow-sm`,
                        'transform transition-transform duration-[var(--duration-normal)]',
                        checked ? thumbTranslate : 'translate-x-0.5',
                        'mt-0.5',
                    ].join(' ')}
                />
            </button>
            {label && (
                <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
            )}
        </label>
    )
}

export type { ToggleProps }
