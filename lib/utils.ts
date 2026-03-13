import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without clsx dependency
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val)
  // Prisma Decimal
  if (val && typeof (val as { toNumber?: () => number }).toNumber === 'function') {
    return (val as { toNumber: () => number }).toNumber()
  }
  return 0
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function getYears(startYear = 2020): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= startYear; y--) years.push(y)
  return years
}
