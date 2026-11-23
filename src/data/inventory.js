export const inventoryStats = [
  { label: 'Unidades disponibles', value: '1.842', hint: '128 referencias en inventario', tone: 'pink', icon: 'boxes' },
  { label: 'Valor del inventario', value: '$111.060.000', hint: 'Valorado a precio de coste', tone: 'muted', icon: 'wallet' },
  { label: 'Productos con stock bajo', value: '8', hint: 'Por debajo del mínimo definido', tone: 'amber', icon: 'alert' },
  { label: 'Productos agotados', value: '3', hint: 'Necesitan reposición', tone: 'amber', icon: 'packageX' },
]

export const movements = [
  { id: 'm1', kind: 'venta', time: '14:32', product: 'Labial Velvet Matte', reason: 'Venta · F-2026-1048', units: -1, before: 25, after: 24, by: 'Automático' },
  { id: 'm2', kind: 'venta', time: '14:32', product: 'Rubor Soft Pinch', reason: 'Venta · F-2026-1048', units: -1, before: 9, after: 8, by: 'Automático' },
  { id: 'm3', kind: 'entrada', time: '12:10', product: 'Base Skin Silk', reason: 'Entrada · OC-0261', units: 24, before: 12, after: 36, by: 'Valentina López' },
  { id: 'm4', kind: 'ajuste', time: '11:45', product: 'Máscara Lash Sensational', reason: 'Ajuste · Producto dañado', units: -2, before: 2, after: 0, by: 'Valentina López' },
]

export const purchaseLines = [
  { id: 'LAB-001', qty: 12, cost: 18500 },
  { id: 'RUB-002', qty: 8, cost: 14200 },
  { id: 'BAS-003', qty: 24, cost: 21800 },
]

export const suppliers = [
  {
    id: 'PROV-001', name: 'Cosmética Norte S.A.S.', place: 'Bogotá · Categoría premium', phone: '+57 601 555 0188', email: 'compras@cosmeticanorte.com', lastPurchase: '22 oct 2026',
    history: [
      { id: 'h1', date: '22 oct 2026', purchase: 'OC-0261', invoice: 'FP-2026-1041', amount: 523200 },
      { id: 'h2', date: '18 oct 2026', purchase: 'C-2026-015', invoice: 'FP-2026-1038', amount: 412000 },
      { id: 'h3', date: '12 oct 2026', purchase: 'C-2026-012', invoice: 'FP-2026-1024', amount: 1240000 },
    ],
  },
  {
    id: 'PROV-002', name: 'Belleza & Cía.', place: 'Medellín · Categoría estándar', phone: '+57 604 444 0199', email: 'ventas@bellezaycia.com', lastPurchase: '18 oct 2026',
    history: [
      { id: 'h1', date: '18 oct 2026', purchase: 'C-2026-014', invoice: 'FP-2026-1031', amount: 286400 },
      { id: 'h2', date: '04 oct 2026', purchase: 'C-2026-009', invoice: 'FP-2026-1012', amount: 198900 },
    ],
  },
  {
    id: 'PROV-003', name: 'Distribuidora Elite', place: 'Cali · Categoría especial', phone: '+57 602 555 0123', email: 'soporte@elitebeauty.co', lastPurchase: '15 oct 2026',
    history: [
      { id: 'h1', date: '15 oct 2026', purchase: 'C-2026-013', invoice: 'FP-2026-1027', amount: 640000 },
      { id: 'h2', date: '29 sep 2026', purchase: 'C-2026-007', invoice: 'FP-2026-0998', amount: 355500 },
    ],
  },
]

export const adjustmentReasons = [
  { value: '-1', label: '−1 · Diferencia en conteo físico', delta: -1 },
  { value: '-2', label: '−2 · Producto dañado', delta: -2 },
  { value: '1', label: '+1 · Corrección de conteo', delta: 1 },
  { value: '-3', label: '−3 · Pérdida o muestra de cortesía', delta: -3 },
  { value: '5', label: '+5 · Reposición manual', delta: 5 },
]
