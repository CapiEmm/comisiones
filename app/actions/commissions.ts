'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import {
  updateFactor,
  createFactor,
  deleteFactor,
  factorExistsByPorcentaje,
} from '@/repositories/commissionRepository'
import { z } from 'zod'

const factorSchema = z.object({
  factor: z.coerce
    .number({ error: 'El factor debe ser un número' })
    .min(0, 'El factor no puede ser negativo')
    .max(100, 'El factor no puede superar 100%'),
})

const newFactorSchema = z.object({
  porcentaje: z.coerce
    .number({ error: 'El % debe ser un número' })
    .int('El % debe ser un número entero')
    .min(1, 'El % debe ser mayor a 0')
    .max(100, 'El % no puede superar 100'),
  factor: z.coerce
    .number({ error: 'El factor debe ser un número' })
    .min(0, 'El factor no puede ser negativo')
    .max(100, 'El factor no puede superar 100%'),
})

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user.id
}

function revalidate() {
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/sales')
}

export async function updateFactorAction(id: string, factor: number) {
  const userId = await requireAuth()
  if (!userId) return { error: 'No autorizado' }

  const parsed = factorSchema.safeParse({ factor })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await updateFactor(id, userId, parsed.data.factor)
    revalidate()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar' }
  }
}

export async function createFactorAction(porcentaje: number, factor: number) {
  const userId = await requireAuth()
  if (!userId) return { error: 'No autorizado' }

  const parsed = newFactorSchema.safeParse({ porcentaje, factor })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const exists = await factorExistsByPorcentaje(userId, parsed.data.porcentaje)
  if (exists) return { error: `Ya existe un factor para ${parsed.data.porcentaje}%` }

  try {
    const created = await createFactor(userId, parsed.data.porcentaje, parsed.data.factor)
    revalidate()
    return { success: true, factor: created }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear' }
  }
}

export async function deleteFactorAction(id: string) {
  const userId = await requireAuth()
  if (!userId) return { error: 'No autorizado' }

  try {
    await deleteFactor(id, userId)
    revalidate()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar' }
  }
}
