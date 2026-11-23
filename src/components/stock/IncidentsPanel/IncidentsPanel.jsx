import { useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './IncidentsPanel.css'

export default function IncidentsPanel() {
  const { state, checkSync, reconcile, processPending } = useStore()
  const { toast } = useUI()
  const [issues, setIssues] = useState([])
  const waiting = state.pending.length
  const clean = issues.length === 0 && waiting === 0

  const check = () => {
    const r = checkSync()
    setIssues(r.issues)
    if (r.issues.length === 0 && r.pending === 0) toast('Todo en orden: el stock coincide con los documentos confirmados.')
    else toast('Se encontraron diferencias o pendientes. Revisa el panel.', 'warning')
  }
  const fix = () => {
    const r = reconcile()
    setIssues([])
    toast(`${r.count} ${r.count === 1 ? 'diferencia conciliada' : 'diferencias conciliadas'} con un movimiento de ajuste.`)
  }
  const flush = () => {
    const r = processPending()
    if (r.remaining > 0) toast(`${r.processed} aplicadas. Quedan ${r.remaining} en espera: activa la regla o la actualización automática.`, 'warning')
    else toast(`${r.processed} ${r.processed === 1 ? 'operación aplicada' : 'operaciones aplicadas'}.`)
  }

  return (
    <Card title="Control de incidencias" subtitle={`Última comprobación · ${state.lastCheck}`}>
      <div className="incidents">
        {clean
          ? <Badge tone="success">Sin errores de sincronización</Badge>
          : <Badge tone="warning">{issues.length ? `${issues.length} ${issues.length === 1 ? 'diferencia' : 'diferencias'} por conciliar` : 'Operaciones en espera'}</Badge>}
        <p>
          {clean
            ? 'No hay operaciones fallidas ni diferencias por conciliar. Tu stock coincide con los documentos confirmados.'
            : issues.length
              ? issues.map((i) => `${i.name}: esperado ${i.expected}, actual ${i.actual}.`).join(' ')
              : 'Hay ventas o entradas esperando a que se active su regla de actualización.'}
        </p>
        <div className="incidents__row">
          <span>Pendientes / fallidas</span>
          <strong>{waiting} / {issues.length}</strong>
        </div>
        <Button size="sm" icon="refresh" onClick={check}>Comprobar sincronización</Button>
        {issues.length > 0 && <Button size="sm" variant="primary" onClick={fix}>Conciliar diferencias</Button>}
        {waiting > 0 && <Button size="sm" variant="primary" onClick={flush}>Procesar pendientes</Button>}
      </div>
    </Card>
  )
}
