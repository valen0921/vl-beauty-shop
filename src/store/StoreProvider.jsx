import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as L from '@/store/logic'

const StoreContext = createContext(null)

// Cada acción recibe el estado más reciente, devuelve { ok, error?, ... } y, si salió bien, actualiza.
const ACTIONS = [
  'registerSale', 'markInvoicePaid', 'annulInvoice', 'registerReturn', 'closeCash', 'reopenCash',
  'confirmPurchase', 'saveDraft', 'adjustStock',
  'saveProduct', 'duplicateProduct', 'setProductsStatus', 'deleteProducts', 'importProducts',
  'saveSupplier', 'setAutoSync', 'setRule', 'processPending', 'addReport', 'checkSync', 'reconcile',
  'markAlertsSeen', 'resetDemo',
]

export function StoreProvider({ children }) {
  const [state, setState] = useState(L.loadState)
  const ref = useRef(state)

  useEffect(() => {
    try { localStorage.setItem(L.STORAGE_KEY, JSON.stringify(state)) } catch { /* sin almacenamiento disponible */ }
  }, [state])

  const actions = useMemo(() => {
    const out = {}
    ACTIONS.forEach((name) => {
      out[name] = (...args) => {
        const result = L[name](ref.current, ...args)
        if (result.ok) {
          ref.current = result.state
          setState(result.state)
        }
        return result
      }
    })
    return out
  }, [])

  const value = useMemo(() => ({ state, ...actions }), [state, actions])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
