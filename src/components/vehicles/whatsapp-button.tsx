'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
    phone?: string
    vehicleName: string
    className?: string
}

export function WhatsAppButton({ phone = '5511999990000', vehicleName, className = '' }: WhatsAppButtonProps) {
    const message = encodeURIComponent(
        `Olá! Tenho interesse no veículo *${vehicleName}* que vi no site AutoCar. Gostaria de mais informações.`
    )
    const url = `https://wa.me/${phone}?text=${message}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-[var(--radius-lg)] bg-[#25D366] text-white font-bold text-base hover:bg-[#1DA851] transition-colors shadow-lg hover:shadow-xl ${className}`}
        >
            <MessageCircle size={20} />
            Falar no WhatsApp
        </a>
    )
}
