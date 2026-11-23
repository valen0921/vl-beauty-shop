import Icon from '@/components/ui/Icon/Icon'
import Badge from '@/components/ui/Badge/Badge'
import './SyncBanner.css'

export default function SyncBanner({ title, subtitle, status, meta }) {
  return (
    <section className="sync-banner">
      <div className="sync-banner__icon"><Icon name="refresh" size={24} /></div>
      <div className="sync-banner__text">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="sync-banner__aside">
        <Badge tone="light">{status}</Badge>
        <span>{meta}</span>
      </div>
    </section>
  )
}
