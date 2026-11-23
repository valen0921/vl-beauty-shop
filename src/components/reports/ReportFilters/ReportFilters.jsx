import Icon from '@/components/ui/Icon/Icon'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import Toggle from '@/components/ui/Toggle/Toggle'
import { periodOptions } from '@/data/reports'
import { STORE_NAME } from '@/config'
import './ReportFilters.css'

export default function ReportFilters({ period, onPeriod, category, onCategory, compare, onCompare }) {
  return (
    <section className="report-filters">
      <div className="report-filters__group">
        <Icon name="calendar" size={18} className="report-filters__icon" />
        <strong>Periodo</strong>
        <FilterSelect options={periodOptions} value={period} onChange={onPeriod} aria-label="Periodo" />
        <FilterSelect options={[STORE_NAME]} aria-label="Sucursal" />
        <FilterSelect options={['Todas las categorías', 'Labios', 'Rostro', 'Ojos']} value={category} onChange={onCategory} aria-label="Categoría" />
      </div>
      <label className="report-filters__compare">
        Comparar con ayer
        <Toggle checked={compare} onChange={onCompare} label="Comparar con ayer" />
      </label>
    </section>
  )
}
