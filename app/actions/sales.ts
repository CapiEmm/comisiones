'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { saleSchema, saleFiltersSchema } from '@/domain/sales/validations'
import {
  createSaleService,
  updateSaleService,
  deleteSaleService,
  getSalesService,
  getDashboardSummary,
  getMonthlyChartData,
  getClientsAndProducts,
} from '@/services/salesService'

function parseError(e: unknown): string {
  if (e instanceof Error) return e.message
  return 'Error inesperado'
}

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
  return session.user.id
}

export async function createSaleAction(formData: FormData) {
  try {
    const userId = await getUserId()
    const raw = Object.fromEntries(formData)
    const parsed = saleSchema.safeParse(raw)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const sale = await createSaleService(userId, parsed.data)
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard')
    return { success: true, sale }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function createSaleFromObjectAction(data: {
  fecha: string
  cliente: string
  producto: string
  costo: number
  precioVenta: number
}) {
  try {
    const userId = await getUserId()
    const parsed = saleSchema.safeParse({ ...data, fecha: new Date(data.fecha) })
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const sale = await createSaleService(userId, parsed.data)
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard')
    return { success: true, sale }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function updateSaleAction(id: string, data: {
  fecha?: string
  cliente?: string
  producto?: string
  costo?: number
  precioVenta?: number
}) {
  try {
    const userId = await getUserId()
    const sale = await updateSaleService(id, userId, {
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    })
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard')
    return { success: true, sale }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function deleteSaleAction(id: string) {
  try {
    const userId = await getUserId()
    await deleteSaleService(id, userId)
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function getSalesAction(filters?: Record<string, unknown>) {
  try {
    const userId = await getUserId()
    const parsed = saleFiltersSchema.safeParse(filters ?? {})
    if (!parsed.success) return { error: 'Filtros inválidos' }
    const result = await getSalesService(userId, parsed.data)
    return { success: true, ...result }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function getDashboardAction() {
  try {
    const userId = await getUserId()
    const summary = await getDashboardSummary(userId)
    return { success: true, summary }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function getMonthlyChartAction(anio?: number) {
  try {
    const userId = await getUserId()
    const data = await getMonthlyChartData(userId, anio)
    return { success: true, data }
  } catch (e) {
    return { error: parseError(e) }
  }
}

export async function getClientsAndProductsAction() {
  try {
    const userId = await getUserId()
    return await getClientsAndProducts(userId)
  } catch {
    return { clientes: [], productos: [] }
  }
}

export async function bulkCreateSalesAction(items: Array<{
  fecha: string
  cliente: string
  producto: string
  costo: number
  precioVenta: number
}>) {
  try {
    const userId = await getUserId()
    const results = []
    for (const item of items) {
      const parsed = saleSchema.safeParse({ ...item, fecha: new Date(item.fecha) })
      if (!parsed.success) continue
      const sale = await createSaleService(userId, parsed.data)
      results.push(sale)
    }
    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard')
    return { success: true, count: results.length }
  } catch (e) {
    return { error: parseError(e) }
  }
}
