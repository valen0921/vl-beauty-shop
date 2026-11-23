import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Popover.css'

// Panel flotante anclado a un botón. Se dibuja en <body> para que ninguna tabla o tarjeta lo recorte.
// trigger({ ref, open, toggle }) → botón;  children({ close }) → contenido.
export default function Popover({ trigger, children, align = 'right', width, className = '' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const anchor = useRef(null)
  const panel = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((o) => !o), [])

  const reposition = useCallback(() => {
    if (!anchor.current) return
    const r = anchor.current.getBoundingClientRect()
    if (r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return } // el botón salió de la pantalla
    const below = window.innerHeight - r.bottom
    const up = below < 280 && r.top > below
    const style = { position: 'fixed' }
    if (up) style.bottom = window.innerHeight - r.top + 6
    else style.top = r.bottom + 6
    if (align === 'right') style.right = Math.max(8, window.innerWidth - r.right)
    else style.left = Math.max(8, r.left)
    setPos(style)
  }, [align])

  useLayoutEffect(() => { if (open) reposition() }, [open, reposition])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (panel.current?.contains(e.target) || anchor.current?.contains(e.target)) return
      close()
    }
    const onKey = (e) => { if (e.key === 'Escape') { close(); anchor.current?.focus() } }
    const onScroll = (e) => { if (!panel.current?.contains(e.target)) reposition() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, close, reposition])

  return (
    <>
      {trigger({ ref: anchor, open, toggle })}
      {open && pos && createPortal(
        <div ref={panel} className={`popover ${className}`} style={{ ...pos, width }}>{children({ close })}</div>,
        document.body,
      )}
      {open && !pos && createPortal(<div ref={panel} className="popover" style={{ visibility: 'hidden', position: 'fixed' }} />, document.body)}
    </>
  )
}
