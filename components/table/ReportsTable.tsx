'use client'

import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import type { Sale } from '@/domain/sales/types'

interface Props {
  sales: Sale[]
  totalPages: number
  page: number
  total: number
  onPageChange: (page: number) => void
}

export function ReportsTable({ sales, totalPages, page, total, onPageChange }: Props) {
  const totalVentas = sales.reduce((s, r) => s + r.precioVenta, 0)
  const totalUtilidad = sales.reduce((s, r) => s + r.utilidad, 0)
  const totalComisiones = sales.reduce((s, r) => s + r.comision, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Fecha</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Cliente</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Producto</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600">Costo</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600">Precio Venta</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 bg-blue-50">Utilidad</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 bg-blue-50">% Utilidad</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 bg-blue-50">Factor</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 bg-purple-50">Comisión</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No hay ventas con los filtros seleccionados
                </td>
              </tr>
            )}
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">{formatDate(sale.fecha)}</td>
                <td className="px-3 py-2">{sale.cliente}</td>
                <td className="px-3 py-2">{sale.producto}</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(sale.costo)}</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(sale.precioVenta)}</td>
                <td className="px-3 py-2 text-right font-mono text-blue-700 bg-blue-50/40">
                  {formatCurrency(sale.utilidad)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-blue-700 bg-blue-50/40">
                  {formatPercent(sale.porcentajeUtilidad)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-blue-700 bg-blue-50/40">
                  {formatPercent(sale.factor)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-purple-700 bg-purple-50/40 font-semibold">
                  {formatCurrency(sale.comision)}
                </td>
              </tr>
            ))}
          </tbody>
          {sales.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                <td colSpan={4} className="px-3 py-2 text-gray-600">
                  Total ({total} ventas)
                </td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalVentas)}</td>
                <td className="px-3 py-2 text-right font-mono text-blue-700 bg-blue-100">
                  {formatCurrency(totalUtilidad)}
                </td>
                <td colSpan={2} className="bg-blue-100" />
                <td className="px-3 py-2 text-right font-mono text-purple-700 bg-purple-100">
                  {formatCurrency(totalComisiones)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
