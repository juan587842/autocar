import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AutoCar Premium',
        short_name: 'AutoCar',
        description: 'Gestão e Venda de Veículos Premium',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#FF4D00',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
