import Icon from '@/components/ui/Icon/Icon'
import './Pagination.css'

function buildPages(page, count) {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1)
  const set = new Set([1, count, page - 1, page, page + 1].filter((n) => n >= 1 && n <= count))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
}

// Controlada: la página la maneja quien la usa (page, pageCount, onChange).
export default function Pagination({ page, pageCount, onChange }) {
  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" className="pagination__btn" aria-label="Página anterior" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevronLeft" size={14} />
      </button>
      {buildPages(page, pageCount).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="pagination__gap">…</span>
        ) : (
          <button key={p} type="button" aria-current={page === p ? 'page' : undefined} className={`pagination__btn ${page === p ? 'is-active' : ''}`} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" className="pagination__btn" aria-label="Página siguiente" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        <Icon name="chevronRight" size={14} />
      </button>
    </nav>
  )
}
