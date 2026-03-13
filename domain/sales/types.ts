export interface SaleInput {
  fecha: Date
  cliente: string
  producto: string
  costo: number
  precioVenta: number
}

export interface SaleCalculated extends SaleInput {
  utilidad: number
  porcentajeUtilidad: number
  factor: number
  comision: number
}

export interface Sale extends SaleCalculated {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface SaleFilters {
  mes?: number
  anio?: number
  cliente?: string
  producto?: string
  page?: number
  pageSize?: number
}

export interface SaleSummary {
  totalVentas: number
  totalUtilidad: number
  totalComisiones: number
  numeroVentas: number
}

export interface MonthlyData {
  mes: string
  ventas: number
  utilidad: number
  comisiones: number
}
