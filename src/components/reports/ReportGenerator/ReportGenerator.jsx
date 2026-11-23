import ChipGroup from '@/components/ui/ChipGroup/ChipGroup'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import Button from '@/components/ui/Button/Button'
import { periodOptions } from '@/data/reports'
import './ReportGenerator.css'

export default function ReportGenerator({ type, onType, format, onFormat, period, onPeriod, onGenerate }) {
  return (
    <section className="report-generator">
      <div className="report-generator__intro">
        <h3>Generar reporte</h3>
        <p>Selecciona tipo, período y formato para exportar.</p>
      </div>
      <div className="report-generator__field">
        <span>Tipo de reporte</span>
        <ChipGroup options={['Ventas', 'Inventario']} value={type} onChange={onType} label="Tipo de reporte" />
      </div>
      <div className="report-generator__field">
        <span>Período</span>
        <FilterSelect options={periodOptions} value={period} onChange={onPeriod} aria-label="Período del reporte" disabled={type === 'Inventario'} />
      </div>
      <div className="report-generator__field">
        <span>Formato de exportación</span>
        <ChipGroup options={['PDF', 'Excel']} value={format} onChange={onFormat} label="Formato de exportación" />
      </div>
      <div className="report-generator__cta">
        <Button variant="primary" block onClick={onGenerate}>Generar reporte</Button>
        <small>El id del reporte se asigna automáticamente al generar el archivo.</small>
      </div>
    </section>
  )
}
