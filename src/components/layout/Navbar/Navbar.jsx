import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon/Icon'
import Popover from '@/components/ui/Popover/Popover'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { useStore } from '@/store/StoreProvider'
import { buildAlerts } from '@/store/selectors'
import { STORE_NAME, TODAY } from '@/config'
import logo from '@/assets/logo.svg'
import { navItems } from '@/data/navigation'
import './Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { state, markAlertsSeen, resetDemo } = useStore()
  const { confirm, toast } = useUI()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = navItems.find((item) => item.to === pathname)

  // Cierra el menú móvil al cambiar de página.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const alerts = buildAlerts(state)
  const alertsKey = alerts.map((a) => a.id).join('|')
  const unseen = alerts.length > 0 && alertsKey !== state.alertsSeen

  const restoreDemo = async (close) => {
    close()
    const yes = await confirm({
      title: 'Restablecer datos de ejemplo',
      message: 'Se borrarán las ventas, compras, ajustes y cambios que hiciste en esta sesión y volverán los datos originales. ¿Continuar?',
      confirmLabel: 'Restablecer',
      danger: true,
    })
    if (yes) {
      resetDemo()
      toast('Datos de ejemplo restablecidos.')
    }
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__top">
          <div className="navbar__crumbs">
            <span>Mi tienda</span>
            <Icon name="chevronRight" size={14} />
            <strong>{current?.crumb ?? 'Inicio'}</strong>
          </div>
          <div className="navbar__tools">
            <Popover
              align="left"
              width={250}
              trigger={({ ref, open, toggle }) => (
                <button ref={ref} type="button" className="navbar__store" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
                  <Icon name="store" size={16} />
                  {STORE_NAME}
                  <Icon name="chevronDown" size={14} />
                </button>
              )}
            >
              {({ close }) => (
                <div className="action-menu">
                  <p className="navbar__pop-label">Sucursal activa</p>
                  <button type="button" onClick={close}><Icon name="check" size={15} />{STORE_NAME}</button>
                  <hr />
                  <button type="button" className="is-danger" onClick={() => restoreDemo(close)}><Icon name="refresh" size={15} />Restablecer datos de ejemplo</button>
                </div>
              )}
            </Popover>
            <span className="navbar__date">{TODAY}</span>
            <Popover
              width={340}
              trigger={({ ref, open, toggle }) => (
                <button ref={ref} type="button" className="navbar__bell" aria-label={unseen ? 'Notificaciones (hay nuevas)' : 'Notificaciones'} aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
                  <Icon name="bell" size={18} />
                  {unseen && <span className="navbar__dot" />}
                </button>
              )}
            >
              {({ close }) => (
                <div className="notif">
                  <div className="notif__head">
                    <strong>Notificaciones</strong>
                    {alerts.length > 0 && (
                      <button type="button" className="link-btn link-pink" disabled={!unseen} onClick={() => markAlertsSeen(alertsKey)}>Marcar como leídas</button>
                    )}
                  </div>
                  {alerts.length === 0 && <p className="notif__empty">Todo en orden. No hay alertas pendientes.</p>}
                  <ul>
                    {alerts.map((a) => (
                      <li key={a.id}>
                        <button type="button" onClick={() => { close(); navigate(a.to) }}>
                          <span className={`notif__tone notif__tone--${a.tone}`} />
                          <span><strong>{a.title}</strong><small>{a.text}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Popover>
          </div>
        </div>

        <nav className="navbar__menu" aria-label="Pantallas de la tienda">
          <Link to="/productos" className="navbar__logo" aria-label="V&L Beauty Shop">
            <img src={logo} alt="V&L Beauty Shop" />
          </Link>
          <button
            type="button"
            className="navbar__burger"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
          <div className={`navbar__links ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}