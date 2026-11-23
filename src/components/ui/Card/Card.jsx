import './Card.css'

export default function Card({ title, subtitle, action, variant = 'default', serif = false, flush = false, className = '', children, ...rest }) {
  return (
    <section className={`card card--${variant} ${flush ? 'card--flush' : ''} ${className}`} {...rest}>
      {(title || action) && (
        <header className="card__header">
          <div>
            {title && <h3 className={`card__title ${serif ? 'card__title--serif' : ''}`}>{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      {children && <div className={`card__body ${flush ? 'card__body--flush' : ''}`}>{children}</div>}
    </section>
  )
}
