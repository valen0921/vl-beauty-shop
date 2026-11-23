import { useState } from 'react'
import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button/Button'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { formatCOP } from '@/utils/format'
import { printCashClose } from '@/utils/documents'
import './CashCloseModal.css'

export default function CashCloseModal({ summary, onClose }) {
  const { state, closeCash, reopenCash } = useStore()
  const { toast } = useUI()
  const closed = state.cashClose
  const [counted, setCounted] = useState(String(closed?.counted ?? summary.cash))
  const value = Number(counted.replace(/\D/g, '')) || 0
  const diff = value - summary.cash

  const close = () => {
    closeCash({ counted: value, totals: summary })
    toast(diff === 0 ? 'Caja cerrada: el efectivo cuadra.' : `Caja cerrada con una diferencia de ${formatCOP(diff)}.`, diff === 0 ? 'success' : 'warning')
  }
  const reopen = () => { reopenCash(); toast('Caja reabierta.') }

  return (
    <Modal
      title="Cierre de caja"
      subtitle="Resumen de cobros de hoy, 22 de octubre"
      onClose={onClose}
      footer={
        <>
          <Button icon="printer" onClick={() => printCashClose({ summary, close: closed })}>Imprimir</Button>
          {closed ? <Button onClick={reopen}>Reabrir caja</Button> : <Button variant="primary" onClick={close}>Cerrar caja</Button>}
        </>
      }
    >
      <div className="modal__rows">
        <div className="modal__row"><span>Tarjeta</span><strong>{formatCOP(summary.card)}</strong></div>
        <div className="modal__row"><span>Efectivo</span><strong>{formatCOP(summary.cash)}</strong></div>
        {summary.transfer > 0 && <div className="modal__row"><span>Transferencia</span><strong>{formatCOP(summary.transfer)}</strong></div>}
        <div className="modal__row modal__row--total"><span>Total cobrado</span><strong>{formatCOP(summary.paid)}</strong></div>
        <div className="modal__row"><span>Por cobrar<small>{summary.pendingCount} facturas pendientes</small></span><strong>{formatCOP(summary.pending)}</strong></div>
      </div>
      <label className="cash-modal__count">
        <span>Efectivo contado en caja</span>
        <input inputMode="numeric" value={counted} onChange={(e) => setCounted(e.target.value)} disabled={Boolean(closed)} />
      </label>
      <div className="modal__row">
        <span>Diferencia con lo esperado</span>
        <strong className={diff === 0 ? '' : diff < 0 ? 'tone-danger' : 'tone-warning'}>{formatCOP(diff)}</strong>
      </div>
      {closed && <p className="modal__hint">Caja cerrada a las {closed.time}. Reábrela si necesitas corregir el arqueo.</p>}
    </Modal>
  )
}
