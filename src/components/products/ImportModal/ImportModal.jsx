import { useState } from 'react'
import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button/Button'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { downloadCSV, parseProductsCSV, PRODUCT_CSV_HEADER } from '@/utils/files'

const EXAMPLE = ['SER-007', 'Sérum Glow', 'Rare Beauty', 'Hidratante', 'Rostro', 125000, 20, 8, 'D-01', 'Activo', 'Sérum iluminador de uso diario.']

export default function ImportModal({ onClose }) {
  const { importProducts } = useStore()
  const { toast } = useUI()
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [result, setResult] = useState(null)

  const pick = async (e) => {
    const f = e.target.files?.[0]
    setResult(null)
    if (!f) { setFile(null); setParsed(null); return }
    setFile(f)
    try {
      setParsed(parseProductsCSV(await f.text()))
    } catch {
      setParsed({ error: 'No pude leer el archivo. Verifica que sea un CSV de texto.' })
    }
  }

  const run = () => {
    const r = importProducts(parsed.rows)
    setResult(r)
    if (r.created + r.updated > 0) toast(`Importación lista: ${r.created} nuevos, ${r.updated} actualizados.`)
    else toast('No se importó ningún producto. Revisa los errores.', 'error')
  }

  return (
    <Modal
      title="Importar productos"
      subtitle="Sube un archivo CSV (puedes exportarlo desde Excel con «Guardar como CSV»)."
      onClose={onClose}
      footer={
        result ? (
          <Button variant="primary" onClick={onClose}>Listo</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" disabled={!parsed?.rows?.length} onClick={run}>
              {parsed?.rows ? `Importar ${parsed.rows.length} ${parsed.rows.length === 1 ? 'fila' : 'filas'}` : 'Importar'}
            </Button>
          </>
        )
      }
    >
      {!result && (
        <>
          <div className="modal__file">
            <input type="file" accept=".csv,text/csv,.txt" onChange={pick} aria-label="Archivo CSV de productos" />
          </div>
          <p className="modal__hint">
            Columnas: <strong>codigo</strong> y <strong>nombre</strong> son obligatorias; el resto es opcional (marca, variante, categoria, precio, stock, minimo, ubicacion, estado, descripcion).
            Si el código ya existe, el producto se actualiza.
          </p>
          <div>
            <Button size="sm" icon="download" onClick={() => downloadCSV('plantilla-productos.csv', [PRODUCT_CSV_HEADER, EXAMPLE])}>Descargar plantilla</Button>
          </div>
          {file && parsed?.error && <p className="modal__error" role="alert">{parsed.error}</p>}
          {file && parsed?.rows && <p className="modal__hint">Archivo leído: {parsed.rows.length} {parsed.rows.length === 1 ? 'fila' : 'filas'} listas para importar.</p>}
        </>
      )}
      {result && (
        <>
          <div className="modal__rows">
            <div className="modal__row"><span>Productos nuevos</span><strong>{result.created}</strong></div>
            <div className="modal__row"><span>Productos actualizados</span><strong>{result.updated}</strong></div>
            <div className="modal__row"><span>Filas con errores</span><strong>{result.errors.length}</strong></div>
          </div>
          {result.errors.length > 0 && (
            <ul className="modal__list" aria-label="Errores de importación">
              {result.errors.slice(0, 8).map((er) => <li key={er}>{er}</li>)}
              {result.errors.length > 8 && <li>…y {result.errors.length - 8} más.</li>}
            </ul>
          )}
        </>
      )}
    </Modal>
  )
}
