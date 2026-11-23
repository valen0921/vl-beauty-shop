import './DataTable.css'

// columns: [{ key, header, width?, align?, render?(row) }]
export default function DataTable({ columns, rows, rowKey = 'id', selectedId, onRowSelect, emptyText = 'Sin resultados' }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align ? `t-${c.align}` : ''} style={{ width: c.width }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td className="table__empty" colSpan={columns.length}>{emptyText}</td></tr>
          )}
          {rows.map((row) => {
            const clickable = Boolean(onRowSelect)
            const selected = selectedId === row[rowKey]
            return (
              <tr
                key={row[rowKey]}
                className={`${clickable ? 'is-clickable' : ''} ${selected ? 'is-selected' : ''}`}
                onClick={clickable ? () => onRowSelect(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.align ? `t-${c.align}` : ''}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
