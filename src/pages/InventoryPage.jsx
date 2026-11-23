import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'
import StatCard from '@/components/ui/StatCard/StatCard'
import Callout from '@/components/ui/Callout/Callout'
import StockTable from '@/components/inventory/StockTable/StockTable'
import AutoSyncCard from '@/components/inventory/AutoSyncCard/AutoSyncCard'
import LastSaleCard from '@/components/inventory/LastSaleCard/LastSaleCard'
import MovementsLog from '@/components/inventory/MovementsLog/MovementsLog'
import PurchaseForm from '@/components/inventory/PurchaseForm/PurchaseForm'
import SuppliersPanel from '@/components/inventory/SuppliersPanel/SuppliersPanel'
import AdjustmentForm from '@/components/inventory/AdjustmentForm/AdjustmentForm'
import { useStore } from '@/store/StoreProvider'
import { categoryOptions } from '@/store/logic'
import { inventoryNumbers, inventoryStats } from '@/store/selectors'
import { adjustmentReasons } from '@/data/inventory'

export default function InventoryPage() {
  const { state } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [adjust, setAdjust] = useState({ id: null, nonce: 0 })
  const [entry, setEntry] = useState({ id: null, nonce: 0 })
  const adjustRef = useRef(null)
  const purchaseRef = useRef(null)
  const movementsRef = useRef(null)

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)

  // Viene de "Ver historial" en Stock automático.
  useEffect(() => {
    if (location.state?.scrollTo === 'movimientos') scrollTo(movementsRef)
  }, [location.state])

  const goAdjust = (id) => { setAdjust((a) => ({ id: id ?? a.id, nonce: id ? a.nonce + 1 : a.nonce })); scrollTo(adjustRef) }
  const goEntry = (id) => { setEntry((e) => ({ id: id ?? e.id, nonce: id ? e.nonce + 1 : e.nonce })); scrollTo(purchaseRef) }

  const { products, lastSync, movements } = state
  const refs = inventoryNumbers(state).refs

  return (
    <div className="page-stack">
      <PageHeader
        title="Todo en su lugar"
        subtitle="Consulta existencias y sigue cada movimiento de tu tienda."
        actions={
          <>
            <Button icon="sliders" onClick={() => goAdjust()}>Ajustar stock</Button>
            <Button variant="primary" icon="plus" onClick={() => goEntry()}>Registrar entrada</Button>
          </>
        }
      />
      <div className="stat-grid">
        {inventoryStats(state).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <Callout tone="success" icon="checkCircle" action={<span className="muted small" style={{ marginLeft: 'auto' }}>Última actualización · {movements[0]?.time ?? '14:32'}</span>}>
        <strong>Inventario actualizado automáticamente</strong>&nbsp;&nbsp;Cada venta confirmada descuenta las unidades al instante.
      </Callout>

      <div className="layout-main-side" style={{ '--side': '258px' }}>
        <StockTable
          products={products}
          categories={categoryOptions(products)}
          totalRefs={refs}
          onAdjust={goAdjust}
          onEntry={goEntry}
          onView={(id) => navigate('/productos', { state: { select: id } })}
        />
        <div className="stack">
          <AutoSyncCard />
          <LastSaleCard invoice={lastSync.invoice} when={lastSync.when} lines={lastSync.lines} units={lastSync.units} />
        </div>
      </div>

      <div ref={movementsRef}><MovementsLog movements={movements} /></div>

      <PageHeader
        level={2}
        title="Compras, proveedores y ajustes"
        subtitle="Registra entradas, consulta proveedores y ajusta stock desde una sola vista operativa."
      />
      <div ref={purchaseRef}>
        <PurchaseForm products={products} suppliers={state.suppliers} presetId={entry.id} presetNonce={entry.nonce} />
      </div>
      <SuppliersPanel suppliers={state.suppliers} />
      <div ref={adjustRef}>
        <AdjustmentForm products={products} reasons={adjustmentReasons} presetId={adjust.id} presetNonce={adjust.nonce} />
      </div>
    </div>
  )
}
