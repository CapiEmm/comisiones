'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { MonthlyData } from '@/domain/sales/types'

interface SalesChartProps {
  data: MonthlyData[]
  type?: 'ventas' | 'utilidad' | 'comisiones' | 'all'
}

const formatter = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value)

export function SalesChart({ data, type = 'all' }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatter} tick={{ fontSize: 11 }} width={60} />
        <Tooltip
          formatter={(v, name) => [formatter(Number(v)), name as string]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {(type === 'all' || type === 'ventas') && (
          <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        )}
        {(type === 'all' || type === 'utilidad') && (
          <Bar dataKey="utilidad" name="Utilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
        )}
        {(type === 'all' || type === 'comisiones') && (
          <Bar dataKey="comisiones" name="Comisiones" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
