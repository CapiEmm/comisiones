import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDashboardSummary, getMonthlyChartData } from '@/services/salesService'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SalesChart } from '@/components/charts/SalesChart'
import { MonthFilter } from '@/components/dashboard/MonthFilter'
import { formatCurrency } from '@/lib/utils'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Props {
  searchParams: Promise<{ mes?: string; anio?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const selectedAnio = params.anio ? Number(params.anio) : now.getFullYear()
  const selectedMes = params.mes ? Number(params.mes) : undefined

  const [summary, chartData] = await Promise.all([
    getDashboardSummary(session.user.id, selectedMes, selectedAnio),
    getMonthlyChartData(session.user.id, selectedAnio),
  ])

  const periodLabel = selectedMes
    ? `${MONTH_NAMES[selectedMes - 1]} ${selectedAnio}`
    : `Año ${selectedAnio}`

  const metricTitle = selectedMes ? 'Ventas del mes' : 'Ventas del año'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">{periodLabel}</p>
        </div>
        <Suspense>
          <MonthFilter selectedMes={selectedMes} selectedAnio={selectedAnio} />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={metricTitle}
          value={formatCurrency(summary.totalVentas)}
          subtitle="Precio de venta total"
          icon="💰"
          color="blue"
        />
        <MetricCard
          title="Utilidad total"
          value={formatCurrency(summary.totalUtilidad)}
          subtitle="Utilidad acumulada"
          icon="📈"
          color="green"
        />
        <MetricCard
          title="Comisiones totales"
          value={formatCurrency(summary.totalComisiones)}
          subtitle="Comisión acumulada"
          icon="🏆"
          color="purple"
        />
        <MetricCard
          title="Número de ventas"
          value={summary.numeroVentas.toString()}
          subtitle="Ventas registradas"
          icon="🧾"
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Resumen anual {selectedAnio}</h2>
        <SalesChart data={chartData} type="all" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Ventas por mes</h2>
          <SalesChart data={chartData} type="ventas" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Utilidad por mes</h2>
          <SalesChart data={chartData} type="utilidad" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Comisiones por mes</h2>
          <SalesChart data={chartData} type="comisiones" />
        </div>
      </div>
    </div>
  )
}
