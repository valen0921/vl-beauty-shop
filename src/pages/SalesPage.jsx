import { useRef, useState } from 'react'
import PageHeader from '@/components/layout/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'
import StatCard from '@/components/ui/StatCard/StatCard'
import SalesList from '@/components/sales/SalesList/SalesList'
import CashCloseCard from '@/components/sales/CashCloseCard/CashCloseCard'
import CashCloseModal from '@/components/sales/CashCloseModal'
import ReturnModal from '@/components/sales/ReturnModal'
import InvoiceDetail from '@/components/sales/InvoiceDetail/InvoiceDetail'
import NewSaleForm from '@/components/sales/NewSaleForm/NewSaleForm'
import SaleCart from '@/components/sales/SaleCart/SaleCart'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { salesStats, salesSummary } from '@/store/selectors'
import { salesTabs, initialCart } from '@/data/sales'
import { TODAY } from '@/config'

const emptyForm = { customer: '', day: TODAY, method: '', note: '' }

export default function SalesPage() {
  const { state, registerSale, markInvoicePaid, annulInvoice } = useStore()
  const { toast, confirm } = useUI()
  const [selectedId, setSelectedId] = useState('F-2026-1048')
  const [cart, setCart] = useState(initialCart)
  const [form, setForm] = useState(emptyForm)
  const [cashOpen, setCashOpen] = useState(false)
  const [returnFor, setReturnFor] = useState(null)
  const formRef = useRef(null)

  const summary = salesSummary(state)
  const invoice = state.invoices.find((i) => i.id === selectedId) ?? state.invoices[0]
  const sellable = state.products.filter((p) => p.status === 'Activo')
  const cartLines = cart
    .map((c) => {
      const p = state.products.find((x) => x.id === c.id)
      return p && { ...c, name: p.name, variant: p.variant, unit: p.price }
    })
    .filter(Boolean)

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const addProduct = (id) => {
    const p = state.products.find((x) => x.id === id)
    if (p.stock === 0) { toast(`${p.name} está agotado.`, 'warning'); return }
    setCart((prev) => {
      const line = prev.find((l) => l.id === id)
      if (line && line.qty >= p.stock) { toast(`Solo hay ${p.stock} ud. de ${p.name}.`, 'warning'); return prev }
      return line ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...prev, { id, qty: 1 }]
    })
  }
  const changeQty = (id, delta) => {
    const p = state.products.find((x) => x.id === id)
    setCart((prev) => prev.map((l) => {
      if (l.id !== id) return l
      const next = Math.max(1, l.qty + delta)
      if (delta > 0 && next > p.stock) { toast(`Solo hay ${p.stock} ud. de ${p.name}.`, 'warning'); return l }
      return { ...l, qty: next }
    }))
  }
  const removeProduct = (id) => setCart((prev) => prev.filter((l) => l.id !== id))
  const resetSale = () => { setCart([]); setForm(emptyForm) }

  const register = () => {
    const r = registerSale({ ...form, lines: cart.map(({ id, qty }) => ({ id, qty })) })
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(
      r.queued ? `Venta ${r.invoice.id} registrada. El stock quedó en espera (actualización automática desactivada).`
        : r.invoice.status === 'Pendiente' ? `Venta ${r.invoice.id} registrada como pendiente de cobro.`
          : `Venta ${r.invoice.id} registrada y stock actualizado.`,
      r.queued ? 'warning' : 'success',
    )
    resetSale()
    setSelectedId(r.invoice.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const markPaid = (inv) => {
    const r = markInvoicePaid(inv.id)
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(r.queued ? `${inv.id} cobrada. El stock quedó en espera.` : `${inv.id} marcada como pagada y stock descontado.`, r.queued ? 'warning' : 'success')
  }
  const annul = async (inv) => {
    const restock = inv.status === 'Pagada' && inv.stockSynced
    const yes = await confirm({
      title: `Anular ${inv.id}`,
      message: restock ? 'La factura dejará de contar en las ventas y las unidades volverán al inventario. Esta acción no se puede deshacer.' : 'La factura dejará de contar en las ventas y los cobros. Esta acción no se puede deshacer.',
      confirmLabel: 'Anular factura',
      danger: true,
    })
    if (!yes) return
    const r = annulInvoice(inv.id)
    if (!r.ok) toast(r.error, 'error')
    else toast(r.restocked ? `${inv.id} anulada y unidades devueltas al stock.` : `${inv.id} anulada.`)
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Cada venta, una historia"
        subtitle="Registra ventas, emite facturas y mantén tus cobros en orden."
        actions={
          <>
            <Button icon="wallet" onClick={() => setCashOpen(true)}>Cierre de caja</Button>
            <Button variant="primary" icon="plus" onClick={scrollToForm}>Registrar venta</Button>
          </>
        }
      />
      <div className="stat-grid">
        {salesStats(summary).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="layout-main-side" style={{ '--side': '372px' }}>
        <div className="stack">
          <SalesList invoices={state.invoices} tabs={salesTabs} summary={summary} selectedId={invoice.id} onSelect={setSelectedId} />
          <CashCloseCard summary={summary} closedAt={state.cashClose?.time} onClick={() => setCashOpen(true)} />
        </div>
        <InvoiceDetail invoice={invoice} onMarkPaid={markPaid} onAnnul={annul} onReturn={setReturnFor} />
      </div>

      <div ref={formRef}>
        <PageHeader
          level={2}
          title="Registrar nueva venta"
          subtitle="Selecciona productos, ajusta cantidades y revisa el carrito antes de registrar la venta."
          actions={<Button onClick={() => { resetSale(); toast('Venta cancelada.', 'warning') }}>Cancelar</Button>}
        />
      </div>
      <div className="layout-two" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        <NewSaleForm products={sellable} itemCount={cartLines.length} form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} onAddProduct={addProduct} />
        <SaleCart lines={cartLines} onChangeQty={changeQty} onRemove={removeProduct} onRegister={register} onFocusAdd={scrollToForm} />
      </div>
      {cashOpen && <CashCloseModal summary={summary} onClose={() => setCashOpen(false)} />}
      {returnFor && <ReturnModal invoice={state.invoices.find((i) => i.id === returnFor.id)} onClose={() => setReturnFor(null)} />}
    </div>
  )
}
