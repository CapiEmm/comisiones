import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSalesService } from '@/services/salesService'
import { getSaleSummary } from '@/repositories/salesRepository'
import { ReportsClient } from './ReportsClient'
import type { SaleFilters } from '@/domain/sales/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ mes?: string; anio?: string; cliente?: string; producto?: string; page?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const params = await searchParams
  const filters: SaleFilters = {
    mes: params.mes ? parseInt(params.mes) : undefined,
    anio: params.anio ? parseInt(params.anio) : undefined,
    cliente: params.cliente || undefined,
    producto: params.producto || undefined,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 20,
  }

  const [result, summary] = await Promise.all([
    getSalesService(session.user.id, filters),
    getSaleSummary(
      session.user.id,
      filters.mes,
      filters.anio
    ),
  ])

  return (
    <ReportsClient
      initialSales={result.sales}
      totalPages={result.totalPages}
      total={result.total}
      initialPage={filters.page ?? 1}
      initialFilters={filters}
      summary={summary}
    />
  )
}
