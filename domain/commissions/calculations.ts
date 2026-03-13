export type FactorTable = Record<number, number>

export function buildFactorTable(factors: { porcentaje: number; factor: number }[]): FactorTable {
  return Object.fromEntries(factors.map((f) => [f.porcentaje, f.factor]))
}

export function calculateProfit(precioVenta: number, costo: number): number {
  return precioVenta - costo
}

export function calculateProfitPercentage(utilidad: number, precioVenta: number): number {
  if (precioVenta === 0) return 0
  return (utilidad / precioVenta) * 100
}

export function getCommissionFactor(porcentajeUtilidad: number, table: FactorTable): number {
  const rounded = Math.floor(porcentajeUtilidad)
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b)
  if (keys.length === 0) return 0
  if (rounded < keys[0]) return 0
  if (rounded > keys[keys.length - 1]) return table[keys[keys.length - 1]]
  return table[rounded] ?? 0
}

export function calculateCommission(precioVenta: number, factor: number): number {
  return precioVenta * (factor / 100)
}

export function calculateAll(precioVenta: number, costo: number, table: FactorTable) {
  const utilidad = calculateProfit(precioVenta, costo)
  const porcentajeUtilidad = calculateProfitPercentage(utilidad, precioVenta)
  const factor = getCommissionFactor(porcentajeUtilidad, table)
  const comision = calculateCommission(precioVenta, factor)
  return { utilidad, porcentajeUtilidad, factor, comision }
}
