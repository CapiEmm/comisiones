'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ReportsTable } from '@/components/table/ReportsTable'
import { ExportButtons } from '@/components/reports/ExportButtons'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { formatCurrency, MONTHS, getYears } from '@/lib/utils'
import type { Sale, SaleSummary, SaleFilters } from '@/domain/sales/types'

interface Props {
  initialSales: Sale[]
  totalPages: number
  total: number
  initialPage: number
  initialFilters: SaleFilters
  summary: SaleSummary
}

export function ReportsClient({ initialSales, totalPages, total, initialPage, initialFilters, summary }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [mes, setMes] = useState(initialFilters.mes?.toString() ?? '')
  const [anio, setAnio] = useState(initialFilters.anio?.toString() ?? '')
  const [cliente, setCliente] = useState(initialFilters.cliente ?? '')
  const [producto, setProducto] = useState(initialFilters.producto ?? '')

  const applyFilters = (page = 1) => {
    const params = new URLSearchParams()
    if (mes) params.set('mes', mes)
    if (anio) params.set('anio', anio)
    if (cliente) params.set('cliente', cliente)
    if (producto) params.set('producto', producto)
    if (page > 1) params.set('page', page.toString())

    startTransition(() => {
      router.push(`/dashboard/reports?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setMes(''); setAnio(''); setCliente(''); setProducto('')
    startTransition(() => router.push('/dashboard/reports'))
  }

  const years = getYears()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Filtra y exporta tus reportes de ventas y comisiones</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total ventas" value={formatCurrency(summary.totalVentas)} icon="💰" color="blue" />
        <MetricCard title="Total utilidad" value={formatCurrency(summary.totalUtilidad)} icon="📈" color="green" />
        <MetricCard title="Total comisiones" value={formatCurrency(summary.totalComisiones)} icon="🏆" color="purple" />
        <MetricCard title="Nº ventas" value={summary.numeroVentas.toString()} icon="🧾" color="orange" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Buscar cliente..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Producto</label>
            <input
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              placeholder="Buscar producto..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            />
          </div>
          <button
            onClick={() => applyFilters(1)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Filtrar
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
          >
            Limpiar
          </button>

          <div className="ml-auto">
            <ExportButtons sales={initialSales} title="Reporte de Comisiones" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <ReportsTable
          sales={initialSales}
          totalPages={totalPages}
          page={initialPage}
          total={total}
          onPageChange={(p) => applyFilters(p)}
        />
      </div>
    </div>
  )
}
