import { z } from 'zod'

export const saleSchema = z.object({
  fecha: z.coerce.date(),
  cliente: z.string().min(1, 'Cliente requerido').max(100),
  producto: z.string().min(1, 'Producto requerido').max(100),
  costo: z.coerce.number().positive('El costo debe ser mayor a 0'),
  precioVenta: z.coerce.number().positive('El precio de venta debe ser mayor a 0'),
}).refine((data) => data.precioVenta > data.costo, {
  message: 'El precio de venta debe ser mayor al costo',
  path: ['precioVenta'],
})

export type SaleFormData = z.infer<typeof saleSchema>

export const saleFiltersSchema = z.object({
  mes: z.coerce.number().min(1).max(12).optional(),
  anio: z.coerce.number().min(2000).max(2100).optional(),
  cliente: z.string().optional(),
  producto: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
