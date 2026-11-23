import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'
import Icon from '@/components/ui/Icon/Icon'
import StatCard from '@/components/ui/StatCard/StatCard'
import ReportFilters from '@/components/reports/ReportFilters/ReportFilters'
import ReportGenerator from '@/components/reports/ReportGenerator/ReportGenerator'
import HourlySalesChart from '@/components/reports/HourlySalesChart/HourlySalesChart'
import CategoryBreakdown from '@/components/reports/CategoryBreakdown/CategoryBreakdown'
import TopProducts from '@/components/reports/TopProducts/TopProducts'
import CollectionsCard from '@/components/reports/CollectionsCard/CollectionsCard'
import InventorySnapshot from '@/components/reports/InventorySnapshot/InventorySnapshot'
import ReportHistory from '@/components/reports/ReportHistory/ReportHistory'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { inventoryNumbers, reportView } from '@/store/selectors'
import { buildReportDoc, exportReport, exportTable } from '@/utils/documents'
import { periodToday } from '@/data/reports'

const ALL = 'Todas las categorías'

export default function ReportsPage() {
  const { state, addReport } = useStore()
  const { toast } = useUI()
  const [period, setPeriod] = useState(periodToday)
  const [category, setCategory] = useState(ALL)
  const [compare, setCompare] = useState(true)
  const [type, setType] = useState('Ventas')
  const [format, setFormat] = useState('PDF')
  const [genPeriod, setGenPeriod] = useState(periodToday)

  const view = reportView(state, { period, compare, category })

  // Genera el archivo (y lo registra en el historial salvo que sea una descarga repetida).
  const generate = ({ type: t, format: f, period: p, existingId }) => {
    const v = p === period ? view : reportView(state, { period: p, compare, category })
    const doc = buildReportDoc({ type: t, period: p, state, view: v })
    let id = existingId
    if (!id) id = addReport({ type: t, format: f, period: p }).report.id
    exportReport({ doc, format: f, id, type: t, period: p })
    toast(f === 'PDF'
      ? `Reporte ${id} listo: en el diálogo de impresión elige «Guardar como PDF».`
      : `Reporte ${id} descargado (CSV compatible con Excel).`)
  }

  const exportTop = () => {
    if (!view.top.length) { toast('No hay productos para exportar con este filtro.', 'warning'); return }
    exportTable('productos-mas-vendidos.csv', ['#', 'Código', 'Producto', 'Categoría', 'Unidades', 'Ventas', 'Stock'], view.top.map((t) => [t.rank, t.id, t.name, t.category, t.units, t.sales, t.stock]))
    toast('Productos más vendidos descargados.')
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Los números también inspiran"
        subtitle="Una mirada clara al rendimiento de tu boutique."
        actions={
          <>
            <Button icon="layers" onClick={() => generate({ type: 'Ventas', format: 'Excel', period })}>Exportar Excel</Button>
            <Button variant="primary" icon="download" onClick={() => generate({ type: 'Ventas', format: 'PDF', period })}>Descargar PDF</Button>
          </>
        }
      />
      <ReportFilters period={period} onPeriod={setPeriod} category={category} onCategory={setCategory} compare={compare} onCompare={setCompare} />
      <ReportGenerator
        type={type} onType={setType} format={format} onFormat={setFormat} period={genPeriod} onPeriod={setGenPeriod}
        onGenerate={() => generate({ type, format, period: type === 'Inventario' ? periodToday : genPeriod })}
      />
      <div className="stat-grid">
        {view.stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="layout-main-side" style={{ '--side': '408px' }}>
        <HourlySalesChart data={view.hourly} tag={view.tag} subtitle={view.hourlySubtitle} />
        <CategoryBreakdown categories={view.categories} />
      </div>

      <div className="layout-main-side" style={{ '--side': '338px' }}>
        <TopProducts products={view.top} onExport={exportTop} />
        <div className="stack">
          <CollectionsCard data={view.collections} />
          <InventorySnapshot numbers={inventoryNumbers(state)} onExport={() => generate({ type: 'Inventario', format: 'Excel', period: periodToday })} />
        </div>
      </div>

      <ReportHistory
        reports={state.reports}
        onDownload={(r) => generate({ type: r.type, format: r.format, period: r.period || periodToday, existingId: r.id })}
      />

      <div className="toolbar" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon name="checkCircle" size={15} style={{ color: 'var(--green)' }} />
          Datos actualizados al 22 oct 2026, 14:32 · Responsable: Valentina López
        </span>
        <span>Vista previa del reporte diario</span>
      </div>
    </div>
  )
}
