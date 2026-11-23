import './PageHeader.css'

export default function PageHeader({ title, subtitle, actions, level = 1 }) {
  const Tag = level === 1 ? 'h1' : 'h2'
  return (
    <div className={`page-header page-header--${level}`}>
      <div>
        <Tag className="page-header__title">{title}</Tag>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  )
}
