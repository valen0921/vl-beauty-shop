import Icon from '@/components/ui/Icon/Icon'
import Toggle from '@/components/ui/Toggle/Toggle'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './AutoSyncCard.css'

export default function AutoSyncCard() {
  const { state, setAutoSync } = useStore()
  const { toast } = useUI()
  const enabled = state.settings.autoSync
  const waiting = state.pending.length

  const change = (value) => {
    const r = setAutoSync(value)
    if (value) toast(r.flushed ? `Actualización automática activada. Se aplicaron ${r.flushed} operaciones en espera.` : 'Actualización automática activada.')
    else toast('Actualización automática desactivada: las ventas y entradas quedarán en espera.', 'warning')
  }

  return (
    <section className="autosync">
      <div className="autosync__top">
        <Icon name="refresh" size={20} />
        <Toggle checked={enabled} onChange={change} onPink label="Actualización automática" />
      </div>
      <h3>Tu stock se cuida solo.</h3>
      <p>
        {enabled
          ? 'Actualización automática activada para ventas, devoluciones y entradas.'
          : 'Actualización automática desactivada. Los movimientos quedan en espera hasta que la vuelvas a activar.'}
      </p>
      {enabled && waiting === 0 && (
        <span className="autosync__ok"><Icon name="checkCircle" size={14} /> Sin movimientos pendientes</span>
      )}
      {waiting > 0 && (
        <span className="autosync__ok"><Icon name="clock" size={14} /> {waiting} {waiting === 1 ? 'operación en espera' : 'operaciones en espera'}</span>
      )}
    </section>
  )
}
