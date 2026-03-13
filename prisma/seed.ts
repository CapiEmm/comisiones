import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const COMMISSION_FACTORS = [
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

async function seedFactorsForUser(userId: string) {
  await prisma.commissionFactor.createMany({
    data: COMMISSION_FACTORS.map((f) => ({ userId, ...f })),
    skipDuplicates: true,
  })
}

async function main() {
  console.log('Seeding demo user...')
  const hashedPassword = await bcrypt.hash('demo1234', 10)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@comisiones.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@comisiones.com',
      password: hashedPassword,
    },
  })

  console.log('Seeding commission factors for demo user...')
  await seedFactorsForUser(demo.id)

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
