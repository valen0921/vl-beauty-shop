export const stockStats = [
  { label: 'Unidades disponibles', value: '1.842', hint: 'Existencias tras la última operación', tone: 'pink', icon: 'boxes' },
  { label: 'Última venta sincronizada', value: '$201.600', hint: 'F-2026-1048 · 2 unidades descontadas', tone: 'muted', icon: 'receipt' },
  { label: 'Operaciones en espera', value: '0', hint: 'No se requiere intervención', tone: 'green', icon: 'checkCircle' },
  { label: 'Alertas de reposición', value: '11', hint: '8 con stock bajo · 3 agotados', tone: 'amber', icon: 'alert' },
]

export const rules = [
  { id: 'venta', icon: 'bag', title: 'Venta confirmada', description: 'Descuenta las unidades al emitir la factura. Las ventas pendientes no modifican el stock.', effect: '− unidades vendidas' },
  { id: 'devolucion', icon: 'undo', title: 'Devolución validada', description: 'Repone solo artículos aptos para la venta, después de validar su estado.', effect: '+ unidades aceptadas' },
  { id: 'entrada', icon: 'packageCheck', title: 'Entrada recibida', description: 'Suma la cantidad realmente recibida al confirmar el pedido del proveedor.', effect: '+ unidades recibidas' },
]

const ventaFactura = {
  fields: [
    ['Factura', 'F-2026-1048', true],
    ['Cliente', 'Lucía Fernández'],
    ['Método de pago', 'Tarjeta'],
    ['Fecha', '22 oct 2026 · 14:32'],
  ],
  listTitle: 'Productos y cantidades descontadas',
  lines: [
    { name: 'Labial Velvet Matte', meta: 'LAB-001 · Labios · A-01', units: -1, before: 25, after: 24 },
    { name: 'Rubor Soft Pinch', meta: 'RUB-002 · Rostro · A-02', units: -1, before: 9, after: 8 },
  ],
}

export const operations = [
  { id: 'op1', time: '14:32', doc: 'F-2026-1048', origin: 'Venta confirmada', product: 'Labial Velvet Matte', units: -1, before: 25, after: 24, result: 'Aplicado', detail: ventaFactura },
  { id: 'op2', time: '14:32', doc: 'F-2026-1048', origin: 'Venta confirmada', product: 'Rubor Soft Pinch', units: -1, before: 9, after: 8, result: 'Aplicado', detail: ventaFactura },
  {
    id: 'op3', time: '12:10', doc: 'OC-0261', origin: 'Entrada recibida', product: 'Base Skin Silk', units: 24, before: 12, after: 36, result: 'Aplicado',
    detail: {
      fields: [['Identificador de compra', 'OC-0261', true], ['Factura del proveedor', 'FP-2026-1041', true], ['Proveedor', 'Cosmética Norte S.A.S.'], ['Fecha', '22 oct 2026 · 12:10']],
      listTitle: 'Productos y cantidades recibidas',
      lines: [{ name: 'Base Skin Silk', meta: 'BAS-003 · Rostro · B-01', units: 24, before: 12, after: 36 }],
    },
  },
  {
    id: 'op4', time: '10:42', doc: 'DEV-0082', origin: 'Devolución validada', product: 'Paleta Nude Harmony', units: 1, before: 17, after: 18, result: 'Aplicado',
    detail: {
      fields: [['Devolución', 'DEV-0082', true], ['Estado del artículo', 'Apto para la venta'], ['Validada por', 'Valentina López'], ['Fecha', '22 oct 2026 · 10:42']],
      listTitle: 'Productos y cantidades aceptadas',
      lines: [{ name: 'Paleta Nude Harmony', meta: 'PAL-005 · Ojos · C-01', units: 1, before: 17, after: 18 }],
    },
  },
]
