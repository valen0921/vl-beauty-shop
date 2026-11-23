import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/ui/Icon/Icon'
import './Modal.css'

export default function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  const panel = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = panel.current?.querySelector('input, select, textarea, [data-autofocus]')
    ;(focusable || panel.current)?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return createPortal(
    <div className="modal__backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={panel} className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <header className="modal__header">
          <div>
            <h3 className="modal__title">{title}</h3>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onClose}><Icon name="close" size={18} /></button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
