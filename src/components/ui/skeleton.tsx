interface SkeletonProps {
    className?: string
    variant?: 'text' | 'card' | 'avatar' | 'image'
}

const variantStyles = {
    text: 'h-4 w-full rounded',
    card: 'h-48 w-full rounded-[var(--radius-lg)]',
    avatar: 'h-10 w-10 rounded-full',
    image: 'h-64 w-full rounded-[var(--radius-md)]',
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${variantStyles[variant]} ${className}`}
            aria-hidden="true"
        />
    )
}

export type { SkeletonProps }
