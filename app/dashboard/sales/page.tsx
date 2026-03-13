import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSalesService } from '@/services/salesService'
import { getAllFactors } from '@/repositories/commissionRepository'
import { SalesPageClient } from './SalesPageClient'

export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [{ sales }, factors] = await Promise.all([
    getSalesService(session.user.id, { pageSize: 200 }),
    getAllFactors(session.user.id),
  ])

  return <SalesPageClient initialSales={sales} factors={factors} />
}
