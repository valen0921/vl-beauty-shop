// Fecha/hora reales del sistema 
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fmt = (d) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
const fmtShort = (d) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`

const now = new Date()
const ayer = new Date(now)
ayer.setDate(now.getDate() - 1)

export const TODAY = fmt(now)
export const TODAY_SHORT = fmtShort(now)
export const YESTERDAY = fmt(ayer)
export const YESTERDAY_SHORT = fmtShort(ayer)

export const SELLER = 'Valentina López'
export const STORE_NAME = 'Boutique principal'
export const CATEGORIES = ['Labios', 'Rostro', 'Ojos']