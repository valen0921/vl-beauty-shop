const tienda = 'Boutique principal'

export const invoices = [
  {
    id: 'F-2026-1048', hour: '14:32', client: 'Lucía Fernández', nif: '48271635M', email: 'lucia.fernandez@email.es',
    method: 'Tarjeta', status: 'Pagada', total: 201600, base: 166590, payNote: 'Pagado con tarjeta · Visa terminada en 4821',
    items: [{ id: 'LAB-001', qty: 1 }, { id: 'RUB-002', qty: 1 }], store: tienda,
  },
  {
    id: 'F-2026-1047', hour: '14:18', client: 'María García', nif: '50329174K', email: 'maria.garcia@email.es',
    method: 'Efectivo', status: 'Pagada', total: 260100, payNote: 'Pagado en efectivo',
    items: [{ id: 'PAL-005', qty: 1 }, { id: 'BRI-006', qty: 2 }],
  },
  {
    id: 'F-2026-1046', hour: '13:54', client: 'Cliente de mostrador',
    method: 'Tarjeta', status: 'Pagada', total: 144000, payNote: 'Pagado con tarjeta',
    items: [{ id: 'PAL-005', qty: 1 }],
  },
  {
    id: 'F-2026-1045', hour: '13:26', client: 'Ana Martínez', nif: '47120583Z', email: 'ana.martinez@email.es',
    method: 'Transferencia', status: 'Pendiente', total: 302850, payNote: 'Pendiente de transferencia',
    items: [{ id: 'LAB-001', qty: 1 }, { id: 'BAS-003', qty: 1 }, { id: 'RUB-002', qty: 1 }],
  },
  {
    id: 'F-2026-1044', hour: '12:48', client: 'Sofía Ruiz', nif: '39874521H', email: 'sofia.ruiz@email.es',
    method: 'Tarjeta', status: 'Pagada', total: 224100, payNote: 'Pagado con tarjeta',
    items: [{ id: 'LAB-001', qty: 2 }],
  },
  {
    id: 'F-2026-1043', hour: '12:15', client: 'Elena Torres', nif: '51763482L', email: 'elena.torres@email.es',
    method: 'Efectivo', status: 'Anulada', total: 89550, payNote: 'Factura anulada',
    items: [{ id: 'RUB-002', qty: 1 }],
  },
]

export const salesTabs = [
  { id: 'all', label: 'Todas las ventas' },
  { id: 'Pagada', label: 'Pagadas' },
  { id: 'Pendiente', label: 'Pendientes', count: 2 },
  { id: 'Anulada', label: 'Anuladas' },
]

export const salesStats = [
  { label: 'Ventas de hoy', value: '$5.780.250', hint: '↑ 16,8 % frente a ayer', tone: 'green', icon: 'trendUp' },
  { label: 'Ventas registradas', value: '24', hint: '22 pagadas · 2 pendientes', tone: 'muted', icon: 'bag' },
  { label: 'Venta media', value: '$240.844', hint: '↑ 4,2 % frente a ayer', tone: 'green', icon: 'receipt' },
  { label: 'Pendiente de cobro', value: '$471.600', hint: '2 facturas por cobrar', tone: 'amber', icon: 'clock' },
]

export const initialCart = [
  { id: 'LAB-001', qty: 1 },
  { id: 'RUB-002', qty: 1 },
]
