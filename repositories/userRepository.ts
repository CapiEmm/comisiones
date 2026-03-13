import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: { name: string; email: string; password: string }) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: { name: data.name, email: data.email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}
