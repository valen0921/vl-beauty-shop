import './Badge.css'

export default function Badge({ tone = 'neutral', dot = true, className = '', children }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  )
}
