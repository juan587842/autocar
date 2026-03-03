'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: { value: string; label: string }[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-[var(--color-text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={[
                            'w-full px-3 py-2 pr-10 text-sm rounded-[var(--radius-sm)] appearance-none',
                            'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
                            'border border-[var(--color-border)]',
                            'transition-colors duration-[var(--duration-fast)]',
                            'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-[var(--color-danger)]' : '',
                            className,
                        ].join(' ')}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                    />
                </div>
                {error && (
                    <span className="text-xs text-[var(--color-danger)]">{error}</span>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select, type SelectProps }
