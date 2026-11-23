import Popover from '@/components/ui/Popover/Popover'
import Icon from '@/components/ui/Icon/Icon'
import './ActionMenu.css'

// Menú "⋯" de una fila. items: [{ label, icon?, onClick, danger?, disabled?, hidden? } | 'separator']
export default function ActionMenu({ items, label = 'Más acciones', className = 'icon-btn' }) {
  const visible = items.filter((i) => i === 'separator' || !i.hidden)
  return (
    <Popover
      trigger={({ ref, open, toggle }) => (
        <button
          ref={ref}
          type="button"
          className={className}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); toggle() }}
        >
          <Icon name="more" size={18} />
        </button>
      )}
    >
      {({ close }) => (
        <div role="menu" className="action-menu" onClick={(e) => e.stopPropagation()}>
          {visible.map((item, i) =>
            item === 'separator' ? (
              <hr key={`sep-${i}`} />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={item.danger ? 'is-danger' : ''}
                onClick={() => { close(); item.onClick() }}
              >
                {item.icon && <Icon name={item.icon} size={15} />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </Popover>
  )
}
