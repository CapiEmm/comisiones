import { calculateAll, getCommissionFactor, buildFactorTable } from '@/domain/commissions/calculations'
import { getAllFactors } from '@/repositories/commissionRepository'

export async function getFactorTableService(userId: string) {
  return getAllFactors(userId)
}

export async function previewCalculation(userId: string, precioVenta: number, costo: number) {
  const factors = await getAllFactors(userId)
  const table = buildFactorTable(factors)
  return calculateAll(precioVenta, costo, table)
}

export async function getFactorForPercentage(userId: string, pct: number) {
  const factors = await getAllFactors(userId)
  const table = buildFactorTable(factors)
  return getCommissionFactor(pct, table)
}
