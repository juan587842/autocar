import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[var(--color-text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={[
                            'w-full px-3 py-2 text-sm rounded-[var(--radius-sm)]',
                            'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
                            'border border-[var(--color-border)]',
                            'placeholder:text-[var(--color-text-muted)]',
                            'transition-colors duration-[var(--duration-fast)]',
                            'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : '',
                            icon ? 'pl-10' : '',
                            className,
                        ].join(' ')}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-xs text-[var(--color-danger)]">{error}</span>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input, type InputProps }
