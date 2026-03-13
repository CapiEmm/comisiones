import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/utils'

const DEFAULT_FACTORS = [
  { porcentaje: 10, factor: 1.3 },
  { porcentaje: 11, factor: 1.43 },
  { porcentaje: 12, factor: 1.56 },
  { porcentaje: 13, factor: 1.69 },
  { porcentaje: 14, factor: 1.82 },
  { porcentaje: 15, factor: 1.95 },
  { porcentaje: 16, factor: 2.08 },
  { porcentaje: 17, factor: 2.21 },
  { porcentaje: 18, factor: 2.34 },
  { porcentaje: 19, factor: 2.47 },
  { porcentaje: 20, factor: 2.6 },
  { porcentaje: 21, factor: 2.73 },
  { porcentaje: 22, factor: 2.86 },
  { porcentaje: 23, factor: 2.99 },
  { porcentaje: 24, factor: 3.12 },
  { porcentaje: 25, factor: 3.25 },
  { porcentaje: 26, factor: 3.38 },
  { porcentaje: 27, factor: 3.51 },
  { porcentaje: 28, factor: 3.64 },
  { porcentaje: 29, factor: 3.77 },
  { porcentaje: 30, factor: 3.9 },
]

function mapFactor(f: { id: string; porcentaje: number; factor: unknown }) {
  return { id: f.id, porcentaje: f.porcentaje, factor: toNumber(f.factor) }
}

/** Obtiene los factores del usuario. Si no tiene ninguno, crea los defaults. */
export async function getAllFactors(userId: string) {
  const existing = await prisma.commissionFactor.findMany({
    where: { userId },
    orderBy: { porcentaje: 'asc' },
  })

  if (existing.length === 0) {
    await seedDefaultFactors(userId)
    const seeded = await prisma.commissionFactor.findMany({
      where: { userId },
      orderBy: { porcentaje: 'asc' },
    })
    return seeded.map(mapFactor)
  }

  return existing.map(mapFactor)
}

export async function seedDefaultFactors(userId: string) {
  await prisma.commissionFactor.createMany({
    data: DEFAULT_FACTORS.map((f) => ({ userId, ...f })),
    skipDuplicates: true,
  })
}

export async function updateFactor(id: string, userId: string, factor: number) {
  return prisma.commissionFactor.update({
    where: { id, userId },
    data: { factor },
  })
}

export async function createFactor(userId: string, porcentaje: number, factor: number) {
  return prisma.commissionFactor.create({
    data: { userId, porcentaje, factor },
  })
}

export async function deleteFactor(id: string, userId: string) {
  return prisma.commissionFactor.delete({ where: { id, userId } })
}

export async function factorExistsByPorcentaje(userId: string, porcentaje: number) {
  const count = await prisma.commissionFactor.count({ where: { userId, porcentaje } })
  return count > 0
}
