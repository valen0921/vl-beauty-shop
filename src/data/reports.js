export const reportStats = [
  { label: 'Ventas del periodo', value: '$5.780.250', hint: '↑ 16,8 % frente a ayer', tone: 'green', icon: 'trendUp' },
  { label: 'Ventas registradas', value: '24', hint: '22 pagadas · 2 pendientes', tone: 'muted', icon: 'bag' },
  { label: 'Venta media', value: '$240.844', hint: '↑ 4,2 % frente a ayer', tone: 'green', icon: 'receipt' },
  { label: 'Cobrado', value: '$5.308.650', hint: '$471.600 pendientes de cobro', tone: 'pink', icon: 'wallet' },
]

export const hourlySales = [
  { hour: '09 h', amount: 540000 },
  { hour: '10 h', amount: 832500 },
  { hour: '11 h', amount: 1098000 },
  { hour: '12 h', amount: 1489500 },
  { hour: '13 h', amount: 1618650 },
  { hour: '14 h', amount: 201600 },
]

export const categorySales = [
  { name: 'Rostro', amount: 2369250, percent: 41.0, color: '#ff6b9a' },
  { name: 'Labios', amount: 1791000, percent: 31.0, color: '#ffd3e0' },
  { name: 'Ojos', amount: 1170000, percent: 20.2, color: '#a5763a' },
  { name: 'Otras categorías', amount: 450000, percent: 7.8, color: '#3f7d58' },
]

export const topProducts = [
  { rank: '01', id: 'LAB-001', name: 'Labial Velvet Matte', category: 'Labios', units: 8, sales: 896400, stock: 24, low: false },
  { rank: '02', id: 'RUB-002', name: 'Rubor Soft Pinch', category: 'Rostro', units: 7, sales: 626850, stock: 8, low: true },
  { rank: '03', id: 'BAS-003', name: 'Base Skin Silk', category: 'Rostro', units: 6, sales: 607500, stock: 36, low: false },
  { rank: '04', id: 'PAL-005', name: 'Paleta Nude Harmony', category: 'Ojos', units: 3, sales: 432000, stock: 18, low: false },
  { rank: '05', id: 'BRI-006', name: 'Brillo Lip Glow', category: 'Labios', units: 5, sales: 290250, stock: 42, low: false },
]

export const collections = { card: 3792150, cash: 1516500, pending: 471600, pendingInvoices: 2 }

export const reportHistory = [
  { id: 'REP-2026-1042', type: 'Ventas', date: '22 oct 2026 · 14:32', format: 'PDF' },
  { id: 'REP-2026-1041', type: 'Inventario', date: '21 oct 2026 · 18:05', format: 'Excel' },
  { id: 'REP-2026-1040', type: 'Ventas', date: '21 oct 2026 · 09:15', format: 'PDF' },
]

// Cifras de "toda la tienda" de hoy: las ventas nuevas se suman encima de estas bases.
export const todayBase = { total: 5780250, count: 24, paidCount: 22, pendingCount: 2, pending: 471600, card: 3792150, cash: 1516500, transfer: 0 }
// Referencia de ayer para calcular el "% frente a ayer" de hoy.
export const yesterdayRef = { total: 4949000, avg: 231134 }

export const periodToday = 'Hoy · 22 oct 2026'
export const periodYesterday = 'Ayer · 21 oct 2026'
export const periodWeek = 'Últimos 7 días'
export const periodOptions = [periodToday, periodYesterday, periodWeek]

// Datos de ejemplo para periodos pasados (reemplázalos por tu API).
export const pastPeriods = {
  [periodYesterday]: {
    tag: 'Ayer', hourlySubtitle: '21 de octubre · Día completo', vsLabel: 'frente al día anterior', totalPct: 4.1, avgPct: 1.8,
    summary: { total: 4949000, count: 21, paidCount: 19, pendingCount: 2, pending: 436800, card: 3325500, cash: 1186700, transfer: 0 },
    hourly: [
      { hour: '09 h', amount: 610000 }, { hour: '10 h', amount: 745000 }, { hour: '11 h', amount: 892000 },
      { hour: '12 h', amount: 1180000 }, { hour: '13 h', amount: 1032000 }, { hour: '14 h', amount: 490000 },
    ],
    categories: { Rostro: 2030000, Labios: 1560000, Ojos: 990000, 'Otras categorías': 369000 },
    top: [
      { id: 'LAB-001', units: 7, sales: 784350 }, { id: 'BAS-003', units: 6, sales: 607500 }, { id: 'RUB-002', units: 5, sales: 447750 },
      { id: 'PAL-005', units: 3, sales: 432000 }, { id: 'BRI-006', units: 6, sales: 348300 },
    ],
  },
  [periodWeek]: {
    tag: '7 días', hourlySubtitle: '16–22 de octubre · Total por franja horaria', vsLabel: 'frente a la semana anterior', totalPct: 9.3, avgPct: 2.6,
    summary: { total: 31420500, count: 148, paidCount: 139, pendingCount: 9, pending: 2184300, card: 20455200, cash: 8781000, transfer: 0 },
    hourly: [
      { hour: '09 h', amount: 3150000 }, { hour: '10 h', amount: 4620500 }, { hour: '11 h', amount: 6010000 },
      { hour: '12 h', amount: 7430000 }, { hour: '13 h', amount: 6260000 }, { hour: '14 h', amount: 3950000 },
    ],
    categories: { Rostro: 12880000, Labios: 9690000, Ojos: 6420000, 'Otras categorías': 2430500 },
    top: [
      { id: 'LAB-001', units: 41, sales: 4594050 }, { id: 'RUB-002', units: 36, sales: 3223800 }, { id: 'BAS-003', units: 33, sales: 3341250 },
      { id: 'PAL-005', units: 18, sales: 2592000 }, { id: 'BRI-006', units: 29, sales: 1683450 },
    ],
  },
}
