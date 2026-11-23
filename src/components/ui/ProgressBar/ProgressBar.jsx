import './ProgressBar.css'

export default function ProgressBar({ value, color = 'var(--pink)' }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress__fill" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}
