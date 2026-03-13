import { calculateAll, buildFactorTable } from '@/domain/commissions/calculations'
import {
  createSale,
  deleteSale,
  findSalesByUser,
  findSaleById,
  getSaleSummary,
  getMonthlyData,
  updateSale,
  getUniqueClients,
  getUniqueProducts,
} from '@/repositories/salesRepository'
import { getAllFactors } from '@/repositories/commissionRepository'
import type { SaleFilters, SaleInput } from '@/domain/sales/types'

async function getTable(userId: string) {
  const factors = await getAllFactors(userId)
  return buildFactorTable(factors)
}

export async function createSaleService(userId: string, input: SaleInput) {
  const table = await getTable(userId)
  const { utilidad, porcentajeUtilidad, factor, comision } = calculateAll(
    input.precioVenta,
    input.costo,
    table
  )
  return createSale(userId, { ...input, utilidad, porcentajeUtilidad, factor, comision })
}

export async function updateSaleService(id: string, userId: string, input: Partial<SaleInput>) {
  const [existing, table] = await Promise.all([findSaleById(id, userId), getTable(userId)])
  if (!existing) throw new Error('Venta no encontrada')

  const merged = {
    precioVenta: input.precioVenta ?? existing.precioVenta,
    costo: input.costo ?? existing.costo,
  }

  const { utilidad, porcentajeUtilidad, factor, comision } = calculateAll(
    merged.precioVenta,
    merged.costo,
    table
  )

  return updateSale(id, userId, { ...input, utilidad, porcentajeUtilidad, factor, comision })
}

export async function deleteSaleService(id: string, userId: string) {
  return deleteSale(id, userId)
}

export async function getSalesService(userId: string, filters?: SaleFilters) {
  return findSalesByUser(userId, filters)
}

export async function getDashboardSummary(userId: string, mes?: number, anio?: number) {
  const now = new Date()
  return getSaleSummary(userId, mes, anio ?? now.getFullYear())
}

export async function getMonthlyChartData(userId: string, anio?: number) {
  return getMonthlyData(userId, anio)
}

export async function getClientsAndProducts(userId: string) {
  const [clientes, productos] = await Promise.all([
    getUniqueClients(userId),
    getUniqueProducts(userId),
  ])
  return { clientes, productos }
}
