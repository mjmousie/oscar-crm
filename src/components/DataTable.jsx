import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, Trash2 } from 'lucide-react'
import { g } from '../utils/columns'

// ─── Column definitions ───────────────────────────────────────────────────────
export const TABLE_COLUMNS = [
  { key: '_status',  label: 'Status',        width: 120 },
  { key: 'name',     label: 'Business Name', width: 220 },
  { key: 'category', label: 'Category',      width: 160 },
  { key: 'phone',    label: 'Phone',         width: 140 },
  { key: 'website',  label: 'Website',       width: 200 },
  { key: '_psi',     label: 'PSI',           width: 68,  center: true },
  { key: 'email',    label: 'Email',         width: 200 },
  { key: 'city',     label: 'City',          width: 110 },
  { key: 'rating',   label: 'Rating',        width: 90  },
]

const ROW_H   = 41
const OVERSCAN = 8

const STATUS_STYLE = {
  'Contacted': { background: 'var(--success-light)', color: 'var(--success)'        },
  'Follow-up': { background: 'var(--warning-light)', color: 'var(--warning)'        },
  'Contact':       { background: 'var(--surface-alt)',   color: 'var(--text-secondary)' },
}

const METHOD_COLOR = {
  'Email':          '#2563eb',
  'Direct Message': '#7c3aed',
  'Cold Call':      '#0891b2',
}

// ─── Cell renderers ───────────────────────────────────────────────────────────
function StatusCell({ row }) {
  const status = row._status || 'Contact'
  const method = row._contactMethod
  const style  = STATUS_STYLE[status] || STATUS_STYLE['New']
  return (
    <div className="status-cell">
      <span className="status-badge" style={style}>{status}</span>
      {method && METHOD_COLOR[method] && (
        <span
          className="method-dot"
          style={{ background: METHOD_COLOR[method] }}
          title={method}
        />
      )}
    </div>
  )
}

function RatingCell({ value }) {
  return (
    <div className="star-rating">
      <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b', flexShrink: 0 }} />
      <span className="star-rating-val" style={{ fontSize: 12 }}>{value}</span>
    </div>
  )
}

function PSICell({ row }) {
  const [tip, setTip] = useState(null)
  const score = row.overallHealth
  if (score == null) return <span className="cell-empty">—</span>

  const color = score >= 90 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  const bg    = score >= 90 ? 'var(--success-light)' : score >= 50 ? 'var(--warning-light)' : 'var(--danger-light)'
  const scores = [
    { label: 'Perf', val: row.perfScore },
    { label: 'SEO',  val: row.seoScore  },
    { label: 'Acc',  val: row.accScore  },
    { label: 'BP',   val: row.bpScore   },
  ].filter((s) => s.val != null)

  return (
    <>
      <span
        className="psi-badge"
        style={{ background: bg, color }}
        onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setTip(null)}
      >
        {score}
      </span>
      {tip && scores.length > 0 && createPortal(
        <div className="psi-tooltip" style={{ top: tip.y - 44, left: tip.x + 14 }}>
          {scores.map(({ label, val }) => (
            <span key={label}><b>{label}:</b> {val}</span>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

function WebsiteCell({ value }) {
  return (
    <a
      className="cell-link"
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {value.replace(/^https?:\/\/(www\.)?/, '').slice(0, 28)}
    </a>
  )
}

function renderCell(col, row) {
  if (col.key === '_status') return <StatusCell row={row} />
  if (col.key === '_psi')    return <PSICell row={row} />
  const value = g(row, col.key)
  if (!value) return <span className="cell-empty">—</span>
  if (col.key === 'rating')  return <RatingCell value={value} />
  if (col.key === 'website') return <WebsiteCell value={value} />
  return value
}

// ─── Virtualized table ────────────────────────────────────────────────────────
export function DataTable({ rows, selectedIdx, onSelect, onDeleteRow }) {
  const containerRef  = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [viewH, setViewH]         = useState(500)
  const [confirmingIdx, setConfirmingIdx] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const startIdx    = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
  const visCount    = Math.ceil(viewH / ROW_H) + OVERSCAN * 2
  const endIdx      = Math.min(rows.length - 1, startIdx + visCount)
  const visibleRows = rows.slice(startIdx, endIdx + 1)
  const minWidth    = TABLE_COLUMNS.reduce((s, c) => s + c.width, 0) + 72

  return (
    <div
      className="table-container"
      ref={containerRef}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <table className="data-table" style={{ minWidth }}>
        <thead>
          <tr>
            {TABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, minWidth: col.width, ...(col.center && { textAlign: 'center' }) }}
              >
                {col.label}
              </th>
            ))}
            <th style={{ width: 72, minWidth: 72 }} />
          </tr>
        </thead>
        <tbody>
          {/* top spacer */}
          {startIdx > 0 && (
            <tr style={{ height: startIdx * ROW_H }}>
              <td colSpan={TABLE_COLUMNS.length + 1} />
            </tr>
          )}

          {visibleRows.map((row, i) => {
            const absIdx      = startIdx + i
            const isConfirming = confirmingIdx === absIdx
            return (
              <tr
                key={absIdx}
                className={selectedIdx === absIdx ? 'selected' : ''}
                onClick={() => onSelect(absIdx)}
              >
                {TABLE_COLUMNS.map((col) => (
                  <td key={col.key} style={col.center ? { textAlign: 'center' } : undefined}>
                    {renderCell(col, row)}
                  </td>
                ))}
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  {isConfirming ? (
                    <div className="delete-confirm">
                      <button
                        className="btn-confirm-yes"
                        onClick={(e) => { e.stopPropagation(); setConfirmingIdx(null); onDeleteRow(absIdx) }}
                      >
                        Yes
                      </button>
                      <button
                        className="btn-confirm-no"
                        onClick={(e) => { e.stopPropagation(); setConfirmingIdx(null) }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-row-delete"
                      onClick={(e) => { e.stopPropagation(); setConfirmingIdx(absIdx) }}
                      title="Delete row"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            )
          })}

          {/* bottom spacer */}
          {endIdx < rows.length - 1 && (
            <tr style={{ height: (rows.length - 1 - endIdx) * ROW_H }}>
              <td colSpan={TABLE_COLUMNS.length + 1} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
