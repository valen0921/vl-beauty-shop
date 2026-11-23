import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button/Button'
import Toggle from '@/components/ui/Toggle/Toggle'
import Callout from '@/components/ui/Callout/Callout'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { rules } from '@/data/stock'

export default function RulesModal({ onClose }) {
  const { state, setRule } = useStore()
  const { toast } = useUI()

  const change = (rule, value) => {
    setRule(rule.id, value)
    toast(value ? `Regla «${rule.title}» activada.` : `Regla «${rule.title}» desactivada: esas operaciones quedarán en espera.`, value ? 'success' : 'warning')
  }

  return (
    <Modal
      title="Reglas de actualización de stock"
      subtitle="Decide qué operaciones modifican el inventario de forma automática."
      onClose={onClose}
      footer={<Button variant="primary" onClick={onClose}>Listo</Button>}
    >
      {!state.settings.autoSync && (
        <Callout tone="warning" icon="alert">La actualización automática está desactivada (se cambia desde Inventario). Mientras tanto ninguna regla se aplica.</Callout>
      )}
      <div className="modal__rows">
        {rules.map((r) => (
          <div key={r.id} className="modal__row">
            <span>
              <strong>{r.title}</strong>
              <small>{r.description}</small>
            </span>
            <Toggle checked={state.settings.rules[r.id]} onChange={(v) => change(r, v)} label={`Regla ${r.title}`} />
          </div>
        ))}
      </div>
      <p className="modal__hint">Si apagas una regla, las operaciones quedan en espera y se aplican solas cuando la vuelvas a activar.</p>
    </Modal>
  )
}
