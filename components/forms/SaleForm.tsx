'use client'

import { useState, useEffect } from 'react'
import { calculateAll, buildFactorTable } from '@/domain/commissions/calculations'
import { createSaleFromObjectAction } from '@/app/actions/sales'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Factor { porcentaje: number; factor: number }

export function SaleForm({
  factors,
  onSuccess,
}: {
  factors: Factor[]
  onSuccess?: () => void
}) {
  const table = buildFactorTable(factors)

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    producto: '',
    costo: '',
    precioVenta: '',
  })
  const [preview, setPreview] = useState({ utilidad: 0, porcentajeUtilidad: 0, factor: 0, comision: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const pv = parseFloat(form.precioVenta) || 0
    const c = parseFloat(form.costo) || 0
    if (pv > 0 && c > 0) setPreview(calculateAll(pv, c, table))
    else setPreview({ utilidad: 0, porcentajeUtilidad: 0, factor: 0, comision: 0 })
  }, [form.precioVenta, form.costo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createSaleFromObjectAction({
      ...form,
      costo: parseFloat(form.costo),
      precioVenta: parseFloat(form.precioVenta),
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setForm({ fecha: new Date().toISOString().split('T')[0], cliente: '', producto: '', costo: '', precioVenta: '' })
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <input
            type="text"
            value={form.cliente}
            onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))}
            required
            placeholder="Nombre del cliente"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
          <input
            type="text"
            value={form.producto}
            onChange={(e) => setForm((p) => ({ ...p, producto: e.target.value }))}
            required
            placeholder="Nombre del producto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo *</label>
          <input
            type="number"
            value={form.costo}
            onChange={(e) => setForm((p) => ({ ...p, costo: e.target.value }))}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta *</label>
          <input
            type="number"
            value={form.precioVenta}
            onChange={(e) => setForm((p) => ({ ...p, precioVenta: e.target.value }))}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {(parseFloat(form.precioVenta) > 0 && parseFloat(form.costo) > 0) && (
        <div className="grid grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Utilidad</p>
            <p className="font-semibold text-blue-700 text-sm">{formatCurrency(preview.utilidad)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">% Utilidad</p>
            <p className="font-semibold text-blue-700 text-sm">{formatPercent(preview.porcentajeUtilidad)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Factor</p>
            <p className="font-semibold text-blue-700 text-sm">{formatPercent(preview.factor)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Comisión</p>
            <p className="font-semibold text-purple-700 text-sm font-mono">{formatCurrency(preview.comision)}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Guardando...' : 'Guardar Venta'}
      </button>
    </form>
  )
}
