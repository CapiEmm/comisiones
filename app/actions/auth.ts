'use server'

import { signIn, signOut } from '@/lib/auth'
import { registerSchema } from '@/domain/sales/validations'
import { createUser, findUserByEmail } from '@/repositories/userRepository'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos' }
    }
    throw e
  }
}

export async function registerAction(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData)
    const parsed = registerSchema.safeParse(raw)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const exists = await findUserByEmail(parsed.data.email)
    if (exists) return { error: 'El email ya está registrado' }

    await createUser(parsed.data)
    redirect('/login?registered=true')
  } catch (e) {
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e
    return { error: 'Error al registrar usuario' }
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
