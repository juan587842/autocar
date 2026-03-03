type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
    src?: string | null
    alt?: string
    name?: string
    size?: AvatarSize
    status?: 'online' | 'offline' | 'away'
    className?: string
}

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
    sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2.5 h-2.5' },
    md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-3 h-3' },
    lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3.5 h-3.5' },
}

const statusColors = {
    online: 'bg-[var(--color-success)]',
    offline: 'bg-[var(--color-text-muted)]',
    away: 'bg-[var(--color-warning)]',
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
}

export function Avatar({ src, alt, name, size = 'md', status, className = '' }: AvatarProps) {
    const styles = sizeMap[size]

    return (
        <div className={`relative inline-flex shrink-0 ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className={`${styles.container} rounded-full object-cover bg-[var(--color-bg-tertiary)]`}
                />
            ) : (
                <div
                    className={`${styles.container} rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center ${styles.text} font-semibold`}
                >
                    {name ? getInitials(name) : '?'}
                </div>
            )}
            {status && (
                <span
                    className={`absolute bottom-0 right-0 ${styles.status} rounded-full ${statusColors[status]} ring-2 ring-[var(--color-bg-primary)]`}
                />
            )}
        </div>
    )
}

export type { AvatarProps, AvatarSize }
