import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as L from '@/store/logic'

const StoreContext = createContext(null)

// URL del backend local (server/index.js). Si lo corres en otro puerto, cámbiala aquí.
const API_URL = 'http://localhost:4000/api/estado'

// Cada acción recibe el estado más reciente, devuelve { ok, error?, ... } y, si salió bien, actualiza.
const ACTIONS = [
  'registerSale', 'markInvoicePaid', 'annulInvoice', 'registerReturn', 'closeCash', 'reopenCash',
  'confirmPurchase', 'saveDraft', 'adjustStock',
  'saveProduct', 'duplicateProduct', 'setProductsStatus', 'deleteProducts', 'importProducts',
  'saveSupplier', 'setAutoSync', 'setRule', 'processPending', 'addReport', 'checkSync', 'reconcile',
  'markAlertsSeen', 'resetDemo',
]

export function StoreProvider({ children }) {
  const [state, setState] = useState(L.createInitialState)
  const [ready, setReady] = useState(false)
  const ref = useRef(state)

  // Al montar: traemos el estado real desde PostgreSQL (vía el backend).
  // Si la base está vacía (primera vez) o el backend no responde, seguimos con los datos de ejemplo.
  useEffect(() => {
    let active = true
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          ref.current = data
          setState(data)
        }
      })
      .catch(() => { /* backend no disponible: seguimos trabajando solo en memoria */ })
      .finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [])

  // Cada vez que cambia el estado (después de la carga inicial), lo guardamos en PostgreSQL.
  useEffect(() => {
    if (!ready) return
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => { /* backend no disponible: los cambios quedan solo en memoria de esta sesión */ })
  }, [state, ready])

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