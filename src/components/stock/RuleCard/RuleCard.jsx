import Icon from '@/components/ui/Icon/Icon'
import Badge from '@/components/ui/Badge/Badge'
import './RuleCard.css'

export default function RuleCard({ icon, title, description, effect, active = true }) {
  return (
    <article className={`rule ${active ? '' : 'is-off'}`}>
      <div className="rule__top">
        <Icon name={icon} size={22} className="rule__icon" />
        <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Activa' : 'Inactiva'}</Badge>
      </div>
      <h3 className="rule__title">{title}</h3>
      <p className="rule__text">{description}</p>
      <span className="rule__effect">{effect}</span>
    </article>
  )
}
