'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/sales', label: 'Ventas', icon: '💰' },
  { href: '/dashboard/reports', label: 'Reportes', icon: '📋' },
  { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
]

interface Props {
  userName?: string | null
  userEmail?: string | null
}

export function Sidebar({ userName, userEmail }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Image src="/icono.png" alt="Comisiones" width={32} height={32} className="rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-white">Comisiones</h1>
            <p className="text-xs text-gray-400">Sistema de comisiones</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3">
          <p className="text-sm font-medium text-white truncate">{userName ?? 'Usuario'}</p>
          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cerrar sesión →
          </button>
        </form>
      </div>
    </aside>
  )
}
