import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Icon from '@/components/ui/Icon/Icon'
import DataTable from '@/components/ui/DataTable/DataTable'

export default function ReportHistory({ reports, onDownload }) {
  const columns = [
    { key: 'id', header: 'ID reporte', render: (r) => <strong>{r.id}</strong> },
    { key: 'type', header: 'Tipo' },
    { key: 'date', header: 'Fecha / hora', render: (r) => <span className="muted">{r.date}</span> },
    { key: 'format', header: 'Formato' },
    {
      key: 'download', header: '', width: 50, align: 'right',
      render: (r) => (
        <button type="button" className="icon-btn" aria-label={`Volver a descargar ${r.id}`} title="Volver a descargar" onClick={() => onDownload(r)}>
          <Icon name="download" size={16} />
        </button>
      ),
    },
  ]
  return (
    <Card
      flush
      title="Historial de reportes"
      subtitle="Vista previa de los reportes generados recientemente."
      action={<Badge tone="pink">Últimos {reports.length}</Badge>}
    >
      <DataTable columns={columns} rows={reports} />
      <p className="card-pad muted small" style={{ paddingTop: 0 }}>
        Los reportes generados se guardan con idReporte, tipoReporte, fechaGeneración y formatoExportación.
      </p>
    </Card>
  )
}
