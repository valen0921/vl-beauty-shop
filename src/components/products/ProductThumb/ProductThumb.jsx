import { productImages } from '@/assets/products'
import './ProductThumb.css'

// Los productos nuevos no tienen imagen todavía: se muestra su inicial.
export default function ProductThumb({ id, name }) {
  const src = productImages[id]
  if (!src) return <span className="thumb thumb--empty" role="img" aria-label={name}>{(name || '?').trim().charAt(0).toUpperCase()}</span>
  return <img className="thumb" src={src} alt={name} width="42" height="42" />
}
