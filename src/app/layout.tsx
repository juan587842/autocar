import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/layout/custom-cursor'
import { BottomBar } from '@/components/layout/bottom-bar'
import { PwaRegistrar } from '@/components/pwa-registrar'
import { ComparatorDrawer } from '@/components/catalogo/comparator-drawer'
import { Toaster } from 'react-hot-toast'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AutoCar — Encontre o carro dos seus sonhos',
    template: '%s | AutoCar',
  },
  description:
    'Compre, venda e agende visitas. Atendimento 24h com inteligência artificial pelo WhatsApp.',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'AutoCar',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <PwaRegistrar />
        <NextTopLoader color="#FF4D00" showSpinner={false} height={3} />
        <CustomCursor />
        {children}
        <BottomBar />
        <ComparatorDrawer />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

