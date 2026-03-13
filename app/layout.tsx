import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Comisiones — Sistema de Cálculo de Comisiones',
  description: 'Calcula automáticamente comisiones de ventas basadas en porcentaje de utilidad',
  icons: {
    icon: '/icono.png',
    apple: '/icono.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
