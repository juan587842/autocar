'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function PushProvider({ children }: { children: React.ReactNode }) {
    const hasAsked = useRef(false)
    const supabase = createClient()

    useEffect(() => {
        if (hasAsked.current) return
        hasAsked.current = true

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey || vapidPublicKey === 'your-vapid-public-key') return

        async function registerPush() {
            try {
                // Verifica suporte
                if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

                // Registra service worker
                const registration = await navigator.serviceWorker.register('/sw.js')
                await navigator.serviceWorker.ready

                // Checa permissão
                const permission = await Notification.requestPermission()
                if (permission !== 'granted') return

                // Inscreve para push
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
                } as any)

                const subJson = subscription.toJSON()
                if (!subJson.keys) return

                // Salver no Supabase
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                await supabase.from('push_subscriptions').upsert(
                    {
                        user_id: user.id,
                        endpoint: subJson.endpoint!,
                        p256dh: subJson.keys.p256dh,
                        auth_key: subJson.keys.auth,
                        device_info: navigator.userAgent.slice(0, 100),
                        is_active: true,
                    },
                    { onConflict: 'endpoint' }
                )

                console.log('[PushProvider] Inscrito com sucesso para push notifications.')
            } catch (error) {
                console.warn('[PushProvider] Erro ao registrar push:', error)
            }
        }

        registerPush()
    }, [supabase])

    return <>{children}</>
}
