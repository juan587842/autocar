'use client'

import { useState } from 'react'

const fallbackImg = 'https://images.unsplash.com/photo-1590362891991-f20bc081e537?q=80&w=2670&auto=format&fit=crop'

export default function VehicleImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [imgSrc, setImgSrc] = useState(src || fallbackImg)

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setImgSrc(fallbackImg)}
        />
    )
}
