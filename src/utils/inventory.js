export function stockStatus(product) {
  if (product.stock === 0) return { label: 'Agotado', tone: 'danger' }
  if (product.stock < product.min) return { label: 'Stock bajo', tone: 'warning' }
  return { label: 'Disponible', tone: 'success' }
}
