import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: [
        'bg-[var(--color-accent)] text-white',
        'hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-glow)]',
        'active:scale-[0.98]',
    ].join(' '),
    secondary: [
        'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)]',
        'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
    ].join(' '),
    ghost: [
        'bg-transparent text-[var(--color-text-secondary)]',
        'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
    ].join(' '),
    danger: [
        'bg-[var(--color-danger)] text-white',
        'hover:brightness-110',
    ].join(' '),
    icon: [
        'bg-transparent text-[var(--color-text-secondary)] p-2',
        'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
    ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, className = '', disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={[
                    'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
                    'transition-all duration-[var(--duration-fast)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'cursor-pointer',
                    variantStyles[variant],
                    variant !== 'icon' ? sizeStyles[size] : '',
                    className,
                ].join(' ')}
                {...props}
            >
                {isLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize }
