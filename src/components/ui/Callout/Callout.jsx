import Icon from '@/components/ui/Icon/Icon'
import './Callout.css'

// tone: success | warning | neutral | plain
export default function Callout({ tone = 'plain', icon, title, action, className = '', children }) {
  if (title) {
    return (
      <aside className={`callout callout--stacked callout--${tone} ${className}`}>
        <div className="callout__title">{icon && <Icon name={icon} size={16} />}<strong>{title}</strong></div>
        <p className="callout__text">{children}</p>
        {action}
      </aside>
    )
  }
  return (
    <aside className={`callout callout--${tone} ${className}`}>
      {icon && <Icon name={icon} size={16} />}
      <span className="callout__text">{children}</span>
      {action}
    </aside>
  )
}
