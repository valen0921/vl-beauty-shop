import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'
import StatCard from '@/components/ui/StatCard/StatCard'
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle'
import Callout from '@/components/ui/Callout/Callout'
import SyncBanner from '@/components/stock/SyncBanner/SyncBanner'
import RuleCard from '@/components/stock/RuleCard/RuleCard'
import RulesModal from '@/components/stock/RulesModal'
import RecentOperations, { DAY_OPTIONS } from '@/components/stock/RecentOperations/RecentOperations'
import OperationDetail from '@/components/stock/OperationDetail/OperationDetail'
import IncidentsPanel from '@/components/stock/IncidentsPanel/IncidentsPanel'
import { useStore } from '@/store/StoreProvider'
import { inventoryNumbers, stockAlertText, stockStats, plural } from '@/store/selectors'
import { rules } from '@/data/stock'
import { STORE_NAME } from '@/config'

export default function AutoStockPage() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [day, setDay] = useState(DAY_OPTIONS[0])
  const [picked, setPicked] = useState(null)
  const [rulesOpen, setRulesOpen] = useState(false)

  const operations = state.operations.filter((o) => (day === DAY_OPTIONS[0] ? o.day === 'hoy' : o.day === 'ayer'))
  const selected = operations.find((o) => o.id === picked) ?? operations[0] ?? null

  const activeRules = rules.filter((r) => state.settings.rules[r.id]).length
  const waiting = state.pending.length
  const n = inventoryNumbers(state)
  const lastChange = state.operations[0]?.time ?? '14:32'

  return (
    <div className="page-stack">
      <PageHeader
        title="Todo cambia. Nada se pierde."
        subtitle="Cada operación conectada con el inventario, sin pasos de más."
        actions={
          <>
            <Button icon="history" onClick={() => navigate('/inventario', { state: { scrollTo: 'movimientos' } })}>Ver historial</Button>
            <Button variant="primary" icon="sliders" onClick={() => setRulesOpen(true)}>Revisar reglas</Button>
          </>
        }
      />
      <SyncBanner
        title="Tu inventario, siempre en sintonía."
        subtitle={`${state.settings.autoSync ? 'Sincronización activa' : 'Sincronización pausada'} · ${STORE_NAME} · Último cambio hoy, ${lastChange}`}
        status={waiting ? 'Operaciones en espera' : 'Sistema al día'}
        meta={`${waiting} ${plural(waiting, 'operación pendiente', 'operaciones pendientes')} · Sin errores`}
      />
      <div className="stat-grid">
        {stockStats(state).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <section>
        <SectionTitle title="Así se actualiza tu stock" aside={`${activeRules} ${plural(activeRules, 'regla activa', 'reglas activas')} · Aplicación inmediata`} />
        <div className="rules-grid">
          {rules.map((r) => <RuleCard key={r.id} {...r} active={state.settings.rules[r.id]} />)}
        </div>
      </section>

      <div className="layout-main-side" style={{ '--side': '318px' }}>
        <div className="stack">
          <RecentOperations operations={operations} selectedId={selected?.id} onSelect={setPicked} day={day} onDayChange={(d) => { setDay(d); setPicked(null) }} />
          <OperationDetail operation={selected} />
        </div>
        <div className="stack">
          <IncidentsPanel />
          <Callout
            tone="warning"
            icon="alert"
            title="Atención al stock mínimo"
            action={<Link to="/inventario" className="link-pink" style={{ fontSize: 12.5 }}>Revisar {n.low + n.out} {plural(n.low + n.out, 'alerta', 'alertas')} en inventario →</Link>}
          >
            {stockAlertText(state)}
          </Callout>
        </div>
      </div>
      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  )
}
