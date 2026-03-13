'use client'

import { useState } from 'react'
import { SalesTable } from '@/components/table/SalesTable'
import { ImportExcelModal } from '@/components/table/ImportExcelModal'
import type { Sale } from '@/domain/sales/types'

interface Factor { id: string; porcentaje: number; factor: number }

interface Props {
  initialSales: Sale[]
  factors: Factor[]
}

export function SalesPageClient({ initialSales, factors }: Props) {
  const [showImport, setShowImport] = useState(false)
  const [key, setKey] = useState(0)

  const handleImported = () => {
    // Force re-render by incrementing key — Next.js will refetch on navigation
    setKey(k => k + 1)
    // Reload to get fresh data from server
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Registra ventas manualmente o importa desde Excel. Un cliente puede tener múltiples productos.
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          📥 Importar Excel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <SalesTable key={key} initialSales={initialSales} factors={factors} />
      </div>

      {showImport && (
        <ImportExcelModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
    </div>
  )
}
