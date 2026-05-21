import { Zap } from 'lucide-react'
import { useAudit } from '../contexts/AuditContext'
import { g } from '../utils/columns'

function scoreColor(score) {
  if (score == null) return 'var(--text-tertiary)'
  if (score >= 90)   return 'var(--success)'
  if (score >= 50)   return 'var(--warning)'
  return 'var(--danger)'
}

function ScoreCell({ label, score, hero }) {
  const color = scoreColor(score)
  return (
    <div
      className={`metric-cell${hero ? ' metric-cell--hero' : ''}`}
      style={hero ? { borderColor: color } : undefined}
    >
      <div className={`metric-score${hero ? ' metric-score--hero' : ''}`} style={{ color }}>
        {score ?? '—'}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

// Stable key derived from the row's own identity fields
function auditKeyFor(row) {
  return (
    row.place_id ||
    row.google_id ||
    [row.name, row.phone, row.email].filter(Boolean).join('|') ||
    'unknown'
  )
}

export function WebMetrics({ row, onUpdateRow }) {
  const { isPending, startAudit } = useAudit()

  const url       = g(row, 'website')
  const name      = g(row, 'name') || 'this site'
  const auditKey  = auditKeyFor(row)
  const loading   = isPending(auditKey)
  const hasScores = row.perfScore != null

  const run = () => {
    if (!url || loading) return
    // onUpdateRow is the closure already bound to the correct datasetId + origIdx
    startAudit(auditKey, { name, url, onSave: onUpdateRow })
  }

  return (
    <div className="web-metrics">
      <div className="web-metrics-header">
        <button
          className="btn-metrics-run"
          onClick={run}
          disabled={loading || !url}
          title={!url ? 'No website URL for this record' : ''}
        >
          {loading ? (
            <><span className="metrics-spinner" /> Analyzing…</>
          ) : (
            <><Zap size={12} />{hasScores ? 'Refresh' : 'Get Web Metrics'}</>
          )}
        </button>
      </div>

      {hasScores && !loading && (
        <div className="psi-metrics">
          <ScoreCell label="Overall Score" score={row.overallHealth} hero />
          <div className="metrics-grid">
            <ScoreCell label="Speed"       score={row.perfScore} />
            <ScoreCell label="SEO"         score={row.seoScore} />
            <ScoreCell label="Access."     score={row.accScore} />
            <ScoreCell label="Best Pract." score={row.bpScore} />
          </div>
        </div>
      )}

      {!hasScores && !loading && (
        <p className="metrics-empty text-center py-4">
          {url
            ? "No metrics found. Click 'Get Web Metrics' to audit this site."
            : 'No website URL found for this record.'}
        </p>
      )}
    </div>
  )
}
