import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import Icon from '@/components/ui/Icon/Icon'
import Callout from '@/components/ui/Callout/Callout'
import ActionMenu from '@/components/ui/ActionMenu/ActionMenu'
import logo from '@/assets/logo.svg'
import { formatCOP } from '@/utils/format'
import { printInvoice } from '@/utils/documents'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './InvoiceDetail.css'

const STATUS_TONE = { Pagada: 'success', Pendiente: 'warning', Anulada: 'neutral' }

const LONG_DATE = { '22 oct 2026': '22 de octubre de 2026', '21 oct 2026': '21 de octubre de 2026' }

export default function InvoiceDetail({ invoice, onMarkPaid, onAnnul, onReturn }) {
  const { toast } = useUI()
  const lines = invoice.items.map((it) => ({ ...it, unit: it.unit, amount: it.unit * it.qty }))
  const units = lines.reduce((sum, l) => sum + l.qty, 0)
  const base = invoice.base ?? Math.round(invoice.total / 1.21)
  const iva = invoice.total - base

  let stockNote = <Callout tone="success" icon="checkCircle">Stock actualizado · {units} unidades descontadas</Callout>
  if (invoice.status === 'Pagada' && !invoice.stockSynced) stockNote = <Callout tone="warning" icon="clock">Pagada · el stock se descontará cuando se reactive la actualización automática</Callout>
  if (invoice.status === 'Pendiente') stockNote = <Callout tone="warning" icon="clock">Venta pendiente · el stock no cambia hasta confirmarla</Callout>
  if (invoice.status === 'Anulada') stockNote = <Callout tone="neutral" icon="alertCircle">{invoice.restocked ? 'Factura anulada · las unidades volvieron al stock' : 'Factura anulada · no afecta al stock ni a los cobros'}</Callout>

  const copyNumber = async () => {
    try { await navigator.clipboard.writeText(invoice.id); toast(`Número ${invoice.id} copiado.`) }
    catch { toast('No pude copiar al portapapeles.', 'error') }
  }
  const sendMail = () => {
    const subject = encodeURIComponent(`Factura ${invoice.id} · V&L Beauty Shop`)
    const body = encodeURIComponent(`Hola ${invoice.client},\n\nTe compartimos tu factura ${invoice.id} por ${formatCOP(invoice.total)}.\n\nGracias por tu compra.`)
    window.location.href = `mailto:${invoice.email}?subject=${subject}&body=${body}`
  }
  const download = () => {
    printInvoice(invoice)
    toast('En el diálogo de impresión elige «Guardar como PDF».', 'success')
  }

  return (
    <Card variant="band" title="Detalle de factura" action={
        <ActionMenu
          label="Acciones de la factura"
          items={[
            { label: 'Marcar como pagada', icon: 'check', hidden: invoice.status !== 'Pendiente', onClick: () => onMarkPaid(invoice) },
            { label: 'Registrar devolución', icon: 'undo', hidden: invoice.status !== 'Pagada', onClick: () => onReturn(invoice) },
            { label: 'Enviar por correo', icon: 'mail', hidden: !invoice.email, onClick: sendMail },
            { label: 'Copiar número', icon: 'copy', onClick: copyNumber },
            'separator',
            { label: 'Anular factura', icon: 'ban', danger: true, hidden: invoice.status === 'Anulada', onClick: () => onAnnul(invoice) },
          ]}
        />
      }>
      <div className="invoice">
        <div className="invoice__brand">
          <img src={logo} alt="V&L Beauty Shop" />
          <Badge tone={STATUS_TONE[invoice.status]}>{invoice.status}</Badge>
        </div>
        <h4 className="invoice__number">{invoice.id}</h4>
        <p className="invoice__meta">{LONG_DATE[invoice.day] ?? invoice.day} · {invoice.hour}</p>
        <p className="invoice__meta">V&amp;L Beauty Shop · NIF B88542139 Calle de Serrano, 24 · 28001 Madrid</p>

        <hr />
        <div className="invoice__client">
          <div>
            <span className="invoice__label">Facturar a</span>
            <strong>{invoice.client}</strong>
            {invoice.nif && <p>NIF {invoice.nif}</p>}
            {invoice.email && <p>{invoice.email}</p>}
          </div>
          <Icon name="user" size={18} className="muted" />
        </div>

        <hr />
        <div className="invoice__lines-head"><span className="invoice__label">Producto</span><span className="invoice__label">Importe</span></div>
        <ul className="invoice__lines">
          {lines.map((l) => (
            <li key={l.id}>
              <div>
                <strong>{l.name}</strong>
                <small>{l.qty} ud. × {formatCOP(l.unit)} · {l.variant}</small>
              </div>
              <span>{formatCOP(l.amount)}</span>
            </li>
          ))}
        </ul>

        <hr />
        <dl className="invoice__totals">
          <div><dt>Base imponible</dt><dd>{formatCOP(base)}</dd></div>
          <div><dt>IVA (21 %)</dt><dd>{formatCOP(iva)}</dd></div>
          <div className="invoice__total"><dt>Total</dt><dd>{formatCOP(invoice.total)}</dd></div>
        </dl>

        <p className="invoice__pay"><Icon name="creditCard" size={15} /> {invoice.payNote}</p>
        {invoice.note && <p className="invoice__meta">Nota: {invoice.note}</p>}
        {invoice.returns.map((r) => (
          <p key={r.id} className="invoice__meta">{r.id} · {r.items.reduce((s, i) => s + i.qty, 0)} ud. devueltas · {r.fit ? 'aptas para la venta' : 'no aptas (no vuelven al stock)'}</p>
        ))}
        {stockNote}
        <div className="form-actions">
          <Button variant="primary" size="sm" icon="download" onClick={download}>Descargar PDF</Button>
          <Button size="sm" icon="printer" onClick={() => printInvoice(invoice)}>Imprimir</Button>
        </div>
      </div>
    </Card>
  )
}
