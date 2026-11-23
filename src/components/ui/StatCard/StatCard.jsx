import Icon from '@/components/ui/Icon/Icon'
import './StatCard.css'

export default function StatCard({ label, value, hint, tone = 'muted', icon }) {
  return (
    <article className="stat">
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {icon && <Icon name={icon} size={18} className="stat__icon" />}
      </div>
      <strong className="stat__value">{value}</strong>
      {hint && <span className={`stat__hint stat__hint--${tone}`}>{hint}</span>}
    </article>
  )
}
