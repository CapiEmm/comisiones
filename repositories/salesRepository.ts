import { prisma } from '@/lib/db'
import type { SaleFilters } from '@/domain/sales/types'
import { toNumber } from '@/lib/utils'

export async function findSalesByUser(userId: string, filters: SaleFilters = {}) {
  const { mes, anio, cliente, producto, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = { userId }

  if (mes || anio) {
    const year = anio ?? new Date().getFullYear()
    const month = mes ?? undefined

    if (month) {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 1)
      where.fecha = { gte: start, lt: end }
    } else {
      const start = new Date(year, 0, 1)
      const end = new Date(year + 1, 0, 1)
      where.fecha = { gte: start, lt: end }
    }
  }

  if (cliente) where.cliente = { contains: cliente, mode: 'insensitive' }
  if (producto) where.producto = { contains: producto, mode: 'insensitive' }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { fecha: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ])

  return {
    sales: sales.map(mapSale),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function findSaleById(id: string, userId: string) {
  const sale = await prisma.sale.findFirst({ where: { id, userId } })
  return sale ? mapSale(sale) : null
}

export async function createSale(userId: string, data: {
  fecha: Date
  cliente: string
  producto: string
  costo: number
  precioVenta: number
  utilidad: number
  porcentajeUtilidad: number
  factor: number
  comision: number
}) {
  const sale = await prisma.sale.create({
    data: { userId, ...data },
  })
  return mapSale(sale)
}

export async function updateSale(id: string, userId: string, data: {
  fecha?: Date
  cliente?: string
  producto?: string
  costo?: number
  precioVenta?: number
  utilidad?: number
  porcentajeUtilidad?: number
  factor?: number
  comision?: number
}) {
  const sale = await prisma.sale.update({
    where: { id },
    data: { ...data },
  })
  return mapSale(sale)
}

export async function deleteSale(id: string, userId: string) {
  await prisma.sale.deleteMany({ where: { id, userId } })
}

export async function getSaleSummary(userId: string, mes?: number, anio?: number) {
  const year = anio ?? new Date().getFullYear()
  const start = mes != null ? new Date(year, mes - 1, 1) : new Date(year, 0, 1)
  const end = mes != null ? new Date(year, mes, 1) : new Date(year + 1, 0, 1)

  const result = await prisma.sale.aggregate({
    where: { userId, fecha: { gte: start, lt: end } },
    _sum: { precioVenta: true, utilidad: true, comision: true },
    _count: { id: true },
  })

  return {
    totalVentas: toNumber(result._sum.precioVenta),
    totalUtilidad: toNumber(result._sum.utilidad),
    totalComisiones: toNumber(result._sum.comision),
    numeroVentas: result._count.id,
  }
}

export async function getMonthlyData(userId: string, anio?: number) {
  const year = anio ?? new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)

  const sales = await prisma.sale.findMany({
    where: { userId, fecha: { gte: start, lt: end } },
    select: { fecha: true, precioVenta: true, utilidad: true, comision: true },
  })

  const monthly: Record<number, { ventas: number; utilidad: number; comisiones: number }> = {}
  for (let i = 1; i <= 12; i++) {
    monthly[i] = { ventas: 0, utilidad: 0, comisiones: 0 }
  }

  for (const sale of sales) {
    const m = new Date(sale.fecha).getMonth() + 1
    monthly[m].ventas += toNumber(sale.precioVenta)
    monthly[m].utilidad += toNumber(sale.utilidad)
    monthly[m].comisiones += toNumber(sale.comision)
  }

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return Object.entries(monthly).map(([m, data]) => ({
    mes: MONTHS[parseInt(m) - 1],
    ...data,
  }))
}

export async function getUniqueClients(userId: string): Promise<string[]> {
  const result = await prisma.sale.findMany({
    where: { userId },
    select: { cliente: true },
    distinct: ['cliente'],
    orderBy: { cliente: 'asc' },
  })
  return result.map((r) => r.cliente)
}

export async function getUniqueProducts(userId: string): Promise<string[]> {
  const result = await prisma.sale.findMany({
    where: { userId },
    select: { producto: true },
    distinct: ['producto'],
    orderBy: { producto: 'asc' },
  })
  return result.map((r) => r.producto)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSale(sale: any) {
  return {
    id: sale.id as string,
    userId: sale.userId as string,
    fecha: sale.fecha as Date,
    cliente: sale.cliente as string,
    producto: sale.producto as string,
    costo: toNumber(sale.costo),
    precioVenta: toNumber(sale.precioVenta),
    utilidad: toNumber(sale.utilidad),
    porcentajeUtilidad: toNumber(sale.porcentajeUtilidad),
    factor: toNumber(sale.factor),
    comision: toNumber(sale.comision),
    createdAt: sale.createdAt as Date,
    updatedAt: sale.updatedAt as Date,
  }
}
