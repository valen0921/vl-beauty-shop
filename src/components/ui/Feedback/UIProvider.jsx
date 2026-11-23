import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Icon from '@/components/ui/Icon/Icon'
import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button/Button'
import './UIProvider.css'

const UIContext = createContext(null)
let counter = 0

// Avisos (toast) y cuadros de confirmación para toda la app.
export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback((message, tone = 'success') => {
    const id = ++counter
    setToasts((t) => [...t.slice(-3), { id, message, tone }])
    setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 4200)
  }, [dismiss])

  // confirm({ title, message, confirmLabel, danger }) → Promise<boolean>
  const confirm = useCallback((options) => new Promise((resolve) => setDialog({ ...options, resolve })), [])
  const answer = (value) => { dialog.resolve(value); setDialog(null) }

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <Icon name={t.tone === 'error' ? 'alertCircle' : t.tone === 'warning' ? 'alert' : 'checkCircle'} size={17} />
            <span>{t.message}</span>
            <button type="button" aria-label="Cerrar aviso" onClick={() => dismiss(t.id)}><Icon name="close" size={14} /></button>
          </div>
        ))}
      </div>
      {dialog && (
        <Modal
          size="sm"
          title={dialog.title}
          onClose={() => answer(false)}
          footer={
            <>
              <Button onClick={() => answer(false)}>{dialog.cancelLabel || 'Cancelar'}</Button>
              <Button variant={dialog.danger ? 'danger' : 'primary'} onClick={() => answer(true)} data-autofocus>{dialog.confirmLabel || 'Confirmar'}</Button>
            </>
          }
        >
          <p>{dialog.message}</p>
        </Modal>
      )}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return ctx
}
