'use client'

import type { Sale } from '@/domain/sales/types'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'

interface Props {
  sales: Sale[]
  title?: string
}

export function ExportButtons({ sales, title = 'Reporte de Comisiones' }: Props) {
  const exportToExcel = async () => {
    const XLSX = await import('xlsx')
    const data = sales.map((s) => ({
      Fecha: formatDate(s.fecha),
      Cliente: s.cliente,
      Producto: s.producto,
      Costo: s.costo,
      'Precio Venta': s.precioVenta,
      Utilidad: s.utilidad,
      '% Utilidad': s.porcentajeUtilidad,
      Factor: s.factor,
      Comisión: s.comision,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`)
  }

  const exportToPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text(title, 14, 16)
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 24)

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Cliente', 'Producto', 'Costo', 'Precio Venta', 'Utilidad', '% Util', 'Factor', 'Comisión']],
      body: sales.map((s) => [
        formatDate(s.fecha),
        s.cliente,
        s.producto,
        formatCurrency(s.costo),
        formatCurrency(s.precioVenta),
        formatCurrency(s.utilidad),
        formatPercent(s.porcentajeUtilidad),
        formatPercent(s.factor),
        formatCurrency(s.comision),
      ]),
      foot: [[
        `Total (${sales.length})`, '', '',
        formatCurrency(sales.reduce((s, r) => s + r.costo, 0)),
        formatCurrency(sales.reduce((s, r) => s + r.precioVenta, 0)),
        formatCurrency(sales.reduce((s, r) => s + r.utilidad, 0)),
        '', '',
        formatCurrency(sales.reduce((s, r) => s + r.comision, 0)),
      ]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
    })

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
      >
        📥 Exportar Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
      >
        📄 Exportar PDF
      </button>
    </div>
  )
}
