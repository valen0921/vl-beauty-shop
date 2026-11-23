import './SectionTitle.css'

export default function SectionTitle({ title, aside }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {aside && <span>{aside}</span>}
    </div>
  )
}
