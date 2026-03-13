'use client'

import { useState, useRef, useCallback } from 'react'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { calculateAll, buildFactorTable } from '@/domain/commissions/calculations'
import { createSaleFromObjectAction, updateSaleAction, deleteSaleAction } from '@/app/actions/sales'
import type { Sale } from '@/domain/sales/types'

interface Factor { porcentaje: number; factor: number }

interface EditableRow {
  id?: string
  fecha: string
  cliente: string
  producto: string
  costo: string
  precioVenta: string
  utilidad: number
  porcentajeUtilidad: number
  factor: number
  comision: number
  isNew?: boolean
}

function toEditableRow(sale: Sale): EditableRow {
  return {
    id: sale.id,
    fecha: new Date(sale.fecha).toISOString().split('T')[0],
    cliente: sale.cliente,
    producto: sale.producto,
    costo: sale.costo.toString(),
    precioVenta: sale.precioVenta.toString(),
    utilidad: sale.utilidad,
    porcentajeUtilidad: sale.porcentajeUtilidad,
    factor: sale.factor,
    comision: sale.comision,
  }
}

function newRow(): EditableRow {
  const today = new Date().toISOString().split('T')[0]
  return {
    fecha: today,
    cliente: '',
    producto: '',
    costo: '',
    precioVenta: '',
    utilidad: 0,
    porcentajeUtilidad: 0,
    factor: 0,
    comision: 0,
    isNew: true,
  }
}

interface Props {
  initialSales: Sale[]
  factors: Factor[]
}

export function SalesTable({ initialSales, factors }: Props) {
  const table = buildFactorTable(factors)
  const [rows, setRows] = useState<EditableRow[]>(initialSales.map(toEditableRow))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const recalcRow = (row: EditableRow): EditableRow => {
    const pv = parseFloat(row.precioVenta) || 0
    const c = parseFloat(row.costo) || 0
    const { utilidad, porcentajeUtilidad, factor, comision } = calculateAll(pv, c, table)
    return { ...row, utilidad, porcentajeUtilidad, factor, comision }
  }

  const updateField = (index: number, field: keyof EditableRow, value: string) => {
    setRows((prev) => {
      const updated = [...prev]
      const row = { ...updated[index], [field]: value }
      updated[index] = recalcRow(row)
      return updated
    })
  }

  const addRow = () => {
    const tempId = `new-${Date.now()}`
    setRows((prev) => [...prev, { ...newRow(), id: tempId }])
    setEditingId(tempId)
  }

  const saveRow = async (index: number) => {
    const row = rows[index]
    if (!row.cliente || !row.producto || !row.costo || !row.precioVenta) {
      setError('Completa todos los campos requeridos')
      return
    }
    setLoading(row.id ?? null)
    setError(null)

    if (row.isNew) {
      const result = await createSaleFromObjectAction({
        fecha: row.fecha,
        cliente: row.cliente,
        producto: row.producto,
        costo: parseFloat(row.costo),
        precioVenta: parseFloat(row.precioVenta),
      })
      if (result.error) {
        setError(result.error)
      } else if (result.sale) {
        setRows((prev) => {
          const updated = [...prev]
          updated[index] = toEditableRow(result.sale!)
          return updated
        })
        setEditingId(null)
      }
    } else if (row.id) {
      const result = await updateSaleAction(row.id, {
        fecha: row.fecha,
        cliente: row.cliente,
        producto: row.producto,
        costo: parseFloat(row.costo),
        precioVenta: parseFloat(row.precioVenta),
      })
      if (result.error) {
        setError(result.error)
      } else {
        setEditingId(null)
      }
    }
    setLoading(null)
  }

  const cancelRow = (index: number) => {
    const row = rows[index]
    if (row.isNew) {
      setRows((prev) => prev.filter((_, i) => i !== index))
    }
    setEditingId(null)
  }

  const deleteRow = async (index: number) => {
    const row = rows[index]
    if (!row.id || row.isNew) {
      setRows((prev) => prev.filter((_, i) => i !== index))
      return
    }
    if (!confirm('¿Eliminar esta venta?')) return
    setLoading(row.id)
    const result = await deleteSaleAction(row.id)
    if (result.error) {
      setError(result.error)
    } else {
      setRows((prev) => prev.filter((_, i) => i !== index))
    }
    setLoading(null)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter') saveRow(index)
      if (e.key === 'Escape') cancelRow(index)
    },
    [rows]
  )

  const isEditing = (row: EditableRow) => editingId === row.id || row.isNew

  const columns = [
    { key: 'fecha', label: 'Fecha', type: 'date', width: 'w-32' },
    { key: 'cliente', label: 'Cliente', type: 'text', width: 'w-40' },
    { key: 'producto', label: 'Producto', type: 'text', width: 'w-40' },
    { key: 'costo', label: 'Costo', type: 'number', width: 'w-28' },
    { key: 'precioVenta', label: 'Precio Venta', type: 'number', width: 'w-32' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-32">Fecha</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-40">Cliente</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-40">Producto</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-28">Costo</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-32">Precio Venta</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-28 bg-blue-50">Utilidad</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-24 bg-blue-50">% Utilidad</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-20 bg-blue-50">Factor</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 w-28 bg-purple-50">Comisión</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                  No hay ventas. Haz clic en &ldquo;+ Nueva fila&rdquo; para comenzar.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isEditing(row) ? 'bg-yellow-50' : ''
                }`}
                onDoubleClick={() => !isEditing(row) && setEditingId(row.id ?? null)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-1.5 py-1">
                    {isEditing(row) ? (
                      <input
                        ref={(el) => { inputRefs.current[`${index}-${col.key}`] = el }}
                        type={col.type}
                        value={row[col.key as keyof EditableRow] as string}
                        onChange={(e) => updateField(index, col.key as keyof EditableRow, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        step={col.type === 'number' ? '0.01' : undefined}
                      />
                    ) : (
                      <span className={`block px-2 py-1 ${col.type === 'number' ? 'text-right font-mono' : ''}`}>
                        {col.type === 'number'
                          ? formatCurrency(parseFloat(row[col.key as keyof EditableRow] as string) || 0)
                          : col.key === 'fecha'
                          ? formatDate(new Date(row.fecha + 'T12:00:00'))
                          : (row[col.key as keyof EditableRow] as string)}
                      </span>
                    )}
                  </td>
                ))}
                {/* Auto-calculated columns */}
                <td className="px-3 py-1.5 text-right font-mono text-sm bg-blue-50/50 text-blue-700">
                  {formatCurrency(row.utilidad)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm bg-blue-50/50 text-blue-700">
                  {formatPercent(row.porcentajeUtilidad)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm bg-blue-50/50 text-blue-700">
                  {formatPercent(row.factor)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm bg-purple-50/50 text-purple-700 font-semibold">
                  {formatCurrency(row.comision)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {isEditing(row) ? (
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => saveRow(index)}
                        disabled={loading === row.id}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading === row.id ? '...' : '✓'}
                      </button>
                      <button
                        onClick={() => cancelRow(index)}
                        className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 hover:opacity-100">
                      <button
                        onClick={() => setEditingId(row.id ?? null)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteRow(index)}
                        disabled={loading === row.id}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-sm border-t-2 border-gray-300">
                <td colSpan={3} className="px-3 py-2 text-gray-600">Totales ({rows.length} ventas)</td>
                <td className="px-3 py-2 text-right font-mono text-gray-700">
                  {formatCurrency(rows.reduce((s, r) => s + (parseFloat(r.costo) || 0), 0))}
                </td>
                <td className="px-3 py-2 text-right font-mono text-gray-700">
                  {formatCurrency(rows.reduce((s, r) => s + (parseFloat(r.precioVenta) || 0), 0))}
                </td>
                <td className="px-3 py-2 text-right font-mono text-blue-700 bg-blue-100">
                  {formatCurrency(rows.reduce((s, r) => s + r.utilidad, 0))}
                </td>
                <td colSpan={2} className="bg-blue-100" />
                <td className="px-3 py-2 text-right font-mono text-purple-700 bg-purple-100">
                  {formatCurrency(rows.reduce((s, r) => s + r.comision, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="flex gap-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nueva fila
        </button>
        <p className="text-xs text-gray-400 self-center">
          Doble clic en una fila para editar · Enter para guardar · Esc para cancelar
        </p>
      </div>
    </div>
  )
}
