import Card from '@/components/ui/Card/Card'
import { formatCOP } from '@/utils/format'
import './CollectionsCard.css'

export default function CollectionsCard({ data }) {
  return (
    <Card title="Cobros del periodo" subtitle="Ventas confirmadas · IVA incluido">
      <dl className="collections">
        <div><dt>Tarjeta</dt><dd>{formatCOP(data.card)}</dd></div>
        <div><dt>Efectivo</dt><dd>{formatCOP(data.cash)}</dd></div>
        {data.transfer > 0 && <div><dt>Transferencia</dt><dd>{formatCOP(data.transfer)}</dd></div>}
        <div className="collections__pending"><dt>Por cobrar · {data.pendingInvoices} {data.pendingInvoices === 1 ? 'factura' : 'facturas'}</dt><dd>{formatCOP(data.pending)}</dd></div>
      </dl>
      <p className="collections__note">Las anulaciones no se incluyen en las ventas ni en los cobros.</p>
    </Card>
  )
}
