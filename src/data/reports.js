import { TODAY, YESTERDAY } from '@/config'

// Colores de categoría para el gráfico de reportes (es configuración visual,
// no una cifra de ventas, así que no hace falta sacarlos de aquí).
export const CATEGORY_COLORS = [
  { name: 'Rostro', color: '#ff6b9a' },
  { name: 'Labios', color: '#ef2562' },
  { name: 'Ojos', color: '#a5763a' },
  { name: 'Otras categorías', color: '#3f7d58' },
]

export const periodToday = `Hoy · ${TODAY}`
export const periodYesterday = `Ayer · ${YESTERDAY}`
export const periodWeek = 'Últimos 7 días'
export const periodOptions = [periodToday, periodYesterday, periodWeek]