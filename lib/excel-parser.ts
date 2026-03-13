import type { SaleInput } from '@/domain/sales/types'

export interface ParsedSale extends Omit<SaleInput, 'fecha'> {
  fecha: string // ISO string for serialization
  producto: string
  cliente: string
  costo: number
  precioVenta: number
}

export interface ParseResult {
  sales: ParsedSale[]
  errors: string[]
  source: 'cotizacion' | 'generic'
  meta?: { folio?: string; cliente?: string; contacto?: string; fecha?: string }
}

/** Convert Excel serial date to JS Date ISO string */
function excelDateToISO(serial: number): string {
  // Excel epoch: Dec 30 1899
  const utc = (serial - 25569) * 86400 * 1000
  return new Date(utc).toISOString().split('T')[0]
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v) && isFinite(v)
}

/** Parse cotización format (detected by FOLIO/CLIENTE header pattern) */
function parseCotizacion(rows: unknown[][]): ParseResult {
  const errors: string[] = []

  // Extract header metadata
  const folio = String(rows[8]?.[12] ?? '').trim()
  const cliente = String(rows[9]?.[3] ?? '').trim()
  const contacto = String(rows[10]?.[3] ?? '').trim()
  const fechaRaw = rows[12]?.[12]
  const fecha = isNumber(fechaRaw) ? excelDateToISO(fechaRaw) : new Date().toISOString().split('T')[0]

  // Product rows start at index 15 (row 15 in 0-indexed sheet_to_json header:1)
  const sales: ParsedSale[] = []

  for (let i = 14; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(c => c === '' || c === 0 || c === null)) continue

    const qty = Number(row[2] ?? 0)
    const costo = Number(row[7] ?? 0)
    const precioVenta = Number(row[10] ?? 0)

    // Only import rows with QTY > 0 and a real sale price
    if (qty <= 0 || precioVenta <= 0 || costo <= 0) continue

    // Skip rows that look like totals (no description and no part number)
    const descripcion = String(row[3] ?? '').trim()
    const np = String(row[5] ?? '').trim()
    const producto = descripcion || np
    if (!producto) continue

    // Skip if precio <= costo (no margin = likely not a real sale row)
    if (precioVenta <= costo) continue

    sales.push({
      fecha,
      cliente: cliente || 'Sin cliente',
      producto: producto.replace(/\r?\n/g, ' ').slice(0, 200),
      costo: Math.round(costo * 100) / 100,
      precioVenta: Math.round(precioVenta * 100) / 100,
    })
  }

  if (sales.length === 0) {
    errors.push('No se encontraron productos válidos (QTY > 0 con costo y precio)')
  }

  return {
    sales,
    errors,
    source: 'cotizacion',
    meta: { folio, cliente, contacto, fecha },
  }
}

/** Parse generic flat format: fecha, cliente, producto, costo, precioVenta */
function parseGeneric(rows: unknown[][]): ParseResult {
  const errors: string[] = []
  const sales: ParsedSale[] = []

  // Find header row
  let headerIdx = -1
  let colMap: Record<string, number> = {}

  const aliases: Record<string, string[]> = {
    fecha:       ['fecha', 'date', 'fec'],
    cliente:     ['cliente', 'client', 'customer'],
    producto:    ['producto', 'product', 'descripcion', 'description', 'item'],
    costo:       ['costo', 'cost', 'precio_costo', 'p.lista', 'p. lista'],
    precioVenta: ['precio_venta', 'precio venta', 'precioventa', 'precio unitario', 'p.venta', 'price'],
  }

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(c => String(c).toLowerCase().trim())
    const found: Record<string, number> = {}
    for (const [field, alts] of Object.entries(aliases)) {
      const idx = row.findIndex(cell => alts.some(a => cell.includes(a)))
      if (idx >= 0) found[field] = idx
    }
    if (Object.keys(found).length >= 3) {
      headerIdx = i
      colMap = found
      break
    }
  }

  if (headerIdx < 0) {
    errors.push('No se reconoció el formato. Usa columnas: fecha, cliente, producto, costo, precio_venta')
    return { sales, errors, source: 'generic' }
  }

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(c => c === '' || c === null)) continue

    const fechaRaw = row[colMap.fecha ?? -1]
    const cliente = String(row[colMap.cliente ?? -1] ?? '').trim()
    const producto = String(row[colMap.producto ?? -1] ?? '').trim()
    const costo = Number(row[colMap.costo ?? -1] ?? 0)
    const precioVenta = Number(row[colMap.precioVenta ?? -1] ?? 0)

    if (!cliente || !producto || costo <= 0 || precioVenta <= 0) continue

    let fecha = new Date().toISOString().split('T')[0]
    if (isNumber(fechaRaw)) fecha = excelDateToISO(fechaRaw)
    else if (fechaRaw) fecha = new Date(String(fechaRaw)).toISOString().split('T')[0]

    sales.push({ fecha, cliente, producto, costo, precioVenta })
  }

  if (sales.length === 0) errors.push('No se encontraron filas válidas en el archivo')

  return { sales, errors, source: 'generic' }
}

/** Detect format and parse */
export function parseExcelFile(rows: unknown[][]): ParseResult {
  // Detect cotización format: has FOLIO and CLIENTE keywords in rows 8-9
  const hasFolio = String(rows[8]?.[10] ?? '').trim().toUpperCase() === 'FOLIO'
  const hasCliente = String(rows[9]?.[1] ?? '').trim().toUpperCase() === 'CLIENTE'
  if (hasFolio && hasCliente) return parseCotizacion(rows)
  return parseGeneric(rows)
}
