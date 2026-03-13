'use client'

import { useState, useRef } from 'react'
import { parseExcelFile, type ParsedSale } from '@/lib/excel-parser'
import { bulkCreateSalesAction } from '@/app/actions/sales'
import { formatCurrency } from '@/lib/utils'

interface Props {
  onClose: () => void
  onImported: () => void
}

export function ImportExcelModal({ onClose, onImported }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [sales, setSales] = useState<ParsedSale[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [meta, setMeta] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [importError, setImportError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setErrors([])
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

      const result = parseExcelFile(rows as unknown[][])
      setSales(result.sales)
      setSelected(new Set(result.sales.map((_, i) => i)))
      setMeta(result.meta as Record<string, string> ?? {})
      setErrors(result.errors)
      setStep('preview')
    } catch {
      setErrors(['No se pudo leer el archivo. Asegúrate de que sea un .xlsx o .xlsm válido.'])
    }
  }

  const toggleRow = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev => prev.size === sales.length ? new Set() : new Set(sales.map((_, i) => i)))
  }

  const handleImport = async () => {
    const toImport = sales.filter((_, i) => selected.has(i))
    if (toImport.length === 0) return

    setLoading(true)
    setImportError('')
    const result = await bulkCreateSalesAction(toImport)
    setLoading(false)

    if (result.error) {
      setImportError(result.error)
    } else {
      setStep('done')
      setTimeout(() => { onImported(); onClose() }, 1200)
    }
  }

  const selectedSales = sales.filter((_, i) => selected.has(i))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Importar desde Excel</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Soporta cotizaciones GECTECH y Excel genérico (fecha, cliente, producto, costo, precio_venta)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-auto flex-1 px-6 py-4">

          {/* Step: upload */}
          {step === 'upload' && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            >
              <div className="text-4xl mb-3">📂</div>
              <p className="font-semibold text-gray-700">Arrastra tu archivo o haz clic para seleccionar</p>
              <p className="text-sm text-gray-400 mt-1">.xlsx, .xlsm, .xls</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xlsm,.xls"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Step: preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Meta */}
              {Object.keys(meta).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {meta.folio && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-400">Folio</p><p className="font-mono font-semibold text-sm">{meta.folio}</p></div>}
                  {meta.cliente && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-400">Cliente</p><p className="font-semibold text-sm">{meta.cliente}</p></div>}
                  {meta.contacto && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-400">Contacto</p><p className="font-semibold text-sm text-xs">{meta.contacto}</p></div>}
                  {meta.fecha && <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-400">Fecha</p><p className="font-semibold text-sm">{meta.fecha}</p></div>}
                </div>
              )}

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                  {errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              {sales.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No se detectaron ventas válidas en este archivo.</p>
                  <button onClick={() => setStep('upload')} className="mt-3 text-blue-600 text-sm underline">Intentar con otro archivo</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{selected.size}</span> de {sales.length} filas seleccionadas para importar
                    </p>
                    <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline">
                      {selected.size === sales.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                  </div>

                  <div className="overflow-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-2 py-2 w-8">
                            <input type="checkbox" checked={selected.size === sales.length} onChange={toggleAll} className="rounded" />
                          </th>
                          <th className="px-3 py-2 text-left text-gray-600">Cliente</th>
                          <th className="px-3 py-2 text-left text-gray-600">Producto</th>
                          <th className="px-3 py-2 text-left text-gray-600">Fecha</th>
                          <th className="px-3 py-2 text-right text-gray-600">Costo</th>
                          <th className="px-3 py-2 text-right text-gray-600">Precio Venta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((s, i) => (
                          <tr
                            key={i}
                            onClick={() => toggleRow(i)}
                            className={`border-b cursor-pointer transition-colors ${selected.has(i) ? 'bg-white' : 'bg-gray-50 opacity-50'}`}
                          >
                            <td className="px-2 py-1.5 text-center">
                              <input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)} onClick={e => e.stopPropagation()} className="rounded" />
                            </td>
                            <td className="px-3 py-1.5 font-medium text-gray-800">{s.cliente}</td>
                            <td className="px-3 py-1.5 text-gray-600 max-w-[200px] truncate" title={s.producto}>{s.producto}</td>
                            <td className="px-3 py-1.5 text-gray-500">{s.fecha}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(s.costo)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-blue-700">{formatCurrency(s.precioVenta)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step: done */}
          {step === 'done' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-lg font-semibold text-green-700">¡Importación exitosa!</p>
              <p className="text-sm text-gray-500 mt-1">Las ventas se agregaron correctamente</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && sales.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
            <div>
              {importError && <p className="text-xs text-red-600">{importError}</p>}
              {selected.size > 0 && (
                <p className="text-xs text-gray-500">
                  Total: {formatCurrency(selectedSales.reduce((s, r) => s + r.precioVenta, 0))}
                  {' · '}Costo: {formatCurrency(selectedSales.reduce((s, r) => s + r.costo, 0))}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                ← Otro archivo
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0 || loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Importando...' : `Importar ${selected.size} venta${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
