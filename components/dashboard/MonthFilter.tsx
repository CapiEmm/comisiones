'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const MONTHS = [
  { label: 'Ene', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Abr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Ago', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dic', value: 12 },
]

interface MonthFilterProps {
  selectedMes?: number
  selectedAnio: number
}

export function MonthFilter({ selectedMes, selectedAnio }: MonthFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate(mes?: number, anio?: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (mes != null) {
      params.set('mes', String(mes))
    } else {
      params.delete('mes')
    }
    if (anio != null) params.set('anio', String(anio))
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1].filter(
    (y) => y <= currentYear
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Year selector */}
      <select
        value={selectedAnio}
        onChange={(e) => navigate(selectedMes, Number(e.target.value))}
        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* "Todo el año" pill */}
      <button
        onClick={() => navigate(undefined, selectedAnio)}
        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
          selectedMes == null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todo el año
      </button>

      {/* Month pills */}
      {MONTHS.map((m) => (
        <button
          key={m.value}
          onClick={() => navigate(m.value, selectedAnio)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            selectedMes === m.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
