import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllFactors } from '@/repositories/commissionRepository'
import { FactorsTable } from '@/components/settings/FactorsTable'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const factors = await getAllFactors(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Tabla de factores de comisión y cuenta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Tu cuenta</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="font-medium text-gray-800">{session.user?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{session.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-mono text-xs text-gray-500">{session.user?.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-semibold text-gray-700">Tabla de factores de comisión</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Factor aplicado según el % de utilidad (redondeado hacia abajo)
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Editable
            </span>
          </div>
          <div className="mt-3">
            <FactorsTable initialFactors={factors} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Lógica de cálculo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-700 mb-1">Utilidad</p>
            <code className="text-xs text-blue-600">utilidad = precio_venta - costo</code>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="font-semibold text-green-700 mb-1">% Utilidad</p>
            <code className="text-xs text-green-600">% = (utilidad / precio_venta) × 100</code>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="font-semibold text-purple-700 mb-1">Comisión</p>
            <code className="text-xs text-purple-600">comisión = precio_venta × factor</code>
          </div>
        </div>
      </div>
    </div>
  )
}
