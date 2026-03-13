'use client'

import { useState } from 'react'
import { updateFactorAction, createFactorAction, deleteFactorAction } from '@/app/actions/commissions'

interface Factor {
  id: string
  porcentaje: number
  factor: number
}

interface NewRow {
  porcentaje: string
  factor: string
}

export function FactorsTable({ initialFactors }: { initialFactors: Factor[] }) {
  const [factors, setFactors] = useState(
    [...initialFactors].sort((a, b) => a.porcentaje - b.porcentaje)
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  // New row state
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<NewRow>({ porcentaje: '', factor: '' })

  const usedPorcentajes = new Set(factors.map((f) => f.porcentaje))

  const flash = (id: string) => {
    setSavedId(id)
    setTimeout(() => setSavedId(null), 1500)
  }

  // ── Edit existing ──────────────────────────────────────────────────────────
  const startEdit = (f: Factor) => {
    setEditingId(f.id)
    setEditValue(f.factor.toString())
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setError(null)
  }

  const saveEdit = async (id: string) => {
    const value = parseFloat(editValue)
    if (isNaN(value)) { setError('Ingresa un número válido'); return }

    setLoading(id)
    setError(null)
    const result = await updateFactorAction(id, value)

    if (result.error) {
      setError(result.error)
    } else {
      setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, factor: value } : f)))
      setEditingId(null)
      flash(id)
    }
    setLoading(null)
  }

  const handleEditKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveEdit(id)
    if (e.key === 'Escape') cancelEdit()
  }

  // ── Add new ────────────────────────────────────────────────────────────────
  const startAdding = () => {
    setAdding(true)
    setNewRow({ porcentaje: '', factor: '' })
    setError(null)
    setEditingId(null)
  }

  const cancelAdd = () => {
    setAdding(false)
    setNewRow({ porcentaje: '', factor: '' })
    setError(null)
  }

  const saveNew = async () => {
    const pct = parseInt(newRow.porcentaje)
    const fct = parseFloat(newRow.factor)

    if (isNaN(pct) || pct < 1) { setError('Ingresa un % entero válido (mín. 1)'); return }
    if (isNaN(fct) || fct < 0) { setError('Ingresa un factor válido'); return }

    // Client-side duplicate check for instant feedback
    if (usedPorcentajes.has(pct)) {
      setError(`Ya existe un factor para ${pct}% — edita el existente`)
      return
    }

    setLoading('new')
    setError(null)
    const result = await createFactorAction(pct, fct)

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.factor) {
      const created: Factor = {
        id: (result.factor as { id: string }).id,
        porcentaje: pct,
        factor: fct,
      }
      setFactors((prev) =>
        [...prev, created].sort((a, b) => a.porcentaje - b.porcentaje)
      )
      setAdding(false)
      setNewRow({ porcentaje: '', factor: '' })
      flash(created.id)
    }
    setLoading(null)
  }

  const handleNewKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveNew()
    if (e.key === 'Escape') cancelAdd()
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const remove = async (id: string, porcentaje: number) => {
    if (!confirm(`¿Eliminar el factor para ${porcentaje}%?`)) return
    setLoading(id)
    const result = await deleteFactorAction(id)
    if (result.error) {
      setError(result.error)
    } else {
      setFactors((prev) => prev.filter((f) => f.id !== id))
    }
    setLoading(null)
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
          {error}
        </p>
      )}

      <div className="overflow-auto max-h-[440px] rounded-lg border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left font-semibold text-gray-600 w-32">% Utilidad</th>
              <th className="px-4 py-2.5 text-right font-semibold text-gray-600">Factor</th>
              <th className="px-4 py-2.5 text-center font-semibold text-gray-600 w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f) => {
              const isEditing = editingId === f.id
              const isSaved = savedId === f.id
              const isLoading = loading === f.id

              return (
                <tr
                  key={f.id}
                  className={`border-b border-gray-100 transition-colors ${
                    isEditing ? 'bg-yellow-50' : isSaved ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-2 font-mono font-medium text-gray-700">
                    {f.porcentaje}%
                  </td>

                  <td className="px-2 py-1 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleEditKey(e, f.id)}
                          step="0.01"
                          min="0"
                          max="100"
                          className="w-24 px-2 py-1 text-right border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                        />
                        <span className="text-gray-400 text-xs">%</span>
                      </div>
                    ) : (
                      <span
                        className={`font-mono cursor-pointer select-none px-2 py-0.5 rounded ${
                          isSaved ? 'text-green-700 font-semibold' : 'text-blue-700 hover:bg-blue-50'
                        }`}
                        onDoubleClick={() => !adding && startEdit(f)}
                        title="Doble clic para editar"
                      >
                        {f.factor}%
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-1 text-center">
                    {isEditing ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => saveEdit(f.id)}
                          disabled={isLoading}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {isLoading ? '...' : '✓'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : isSaved ? (
                      <span className="text-xs text-green-600 font-medium">✓ Guardado</span>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => startEdit(f)}
                          disabled={adding || !!editingId}
                          title="Editar factor"
                          className="px-2 py-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => remove(f.id, f.porcentaje)}
                          disabled={isLoading || adding || !!editingId}
                          title="Eliminar fila"
                          className="px-2 py-1 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}

            {/* New row inline */}
            {adding && (
              <tr className="border-b border-blue-200 bg-blue-50">
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      type="number"
                      value={newRow.porcentaje}
                      onChange={(e) => setNewRow((p) => ({ ...p, porcentaje: e.target.value }))}
                      onKeyDown={handleNewKey}
                      placeholder="31"
                      min="1"
                      max="100"
                      step="1"
                      className={`w-16 px-2 py-1 text-right border rounded focus:outline-none focus:ring-1 font-mono text-sm ${
                        newRow.porcentaje && usedPorcentajes.has(parseInt(newRow.porcentaje))
                          ? 'border-red-400 focus:ring-red-400 bg-red-50'
                          : 'border-blue-400 focus:ring-blue-500'
                      }`}
                    />
                    <span className="text-gray-500 text-xs">%</span>
                    {newRow.porcentaje && usedPorcentajes.has(parseInt(newRow.porcentaje)) && (
                      <span className="text-red-500 text-xs">ya existe</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      value={newRow.factor}
                      onChange={(e) => setNewRow((p) => ({ ...p, factor: e.target.value }))}
                      onKeyDown={handleNewKey}
                      placeholder="4.03"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-24 px-2 py-1 text-right border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                    />
                    <span className="text-gray-400 text-xs">%</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={saveNew}
                      disabled={loading === 'new'}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading === 'new' ? '...' : '✓'}
                    </button>
                    <button
                      onClick={cancelAdd}
                      className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Doble clic en el factor para editar · Enter para guardar · Esc para cancelar
        </p>
        {!adding && !editingId && (
          <button
            onClick={startAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Agregar fila
          </button>
        )}
      </div>
    </div>
  )
}
