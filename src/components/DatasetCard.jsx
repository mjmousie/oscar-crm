import { useMemo } from 'react'
import { Eye, X, Send, Mail, Phone, Globe, Linkedin } from 'lucide-react'

function countFilled(rows, matchFn) {
  if (!rows?.length) return 0
  const cols = Object.keys(rows[0]).filter(matchFn)
  if (!cols.length) return 0
  return rows.filter(r => cols.some(c => r[c] != null && String(r[c]).trim() !== '')).length
}

export function DatasetCard({ dataset, onView, onDelete }) {
  const date = new Date(dataset.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const density = useMemo(() => {
    const rows = dataset.rows ?? []
    return {
      emails:   countFilled(rows, c => /email/i.test(c)),
      phones:   countFilled(rows, c => /phone/i.test(c)),
      websites: countFilled(rows, c => /(website|\bsite\b|^url$)/i.test(c) && !/linkedin/i.test(c)),
      linkedin: countFilled(rows, c => /linkedin/i.test(c)),
    }
  }, [dataset])

  return (
    <div className="dataset-card" onClick={() => onView(dataset)}>
      <div className="title-and-icons">
        <div className="dataset-card-name">{dataset.name}</div>
      <button
          className="btn btn-danger"
          style={{ height: 32, fontSize: 12.5 }}
          onClick={() => onDelete(dataset.id)}
        >
          <X size={13} />
        </button>
      </div>
      <div className="dataset-card-meta">
        Added {date}
      </div>
      <div className="dataset-card-stats">
        <div className="dataset-stat">
          <div className="dataset-stat-val">{dataset.rowCount?.toLocaleString()}</div>
          <div className="dataset-stat-key">records</div>
        </div>
        <div className="dataset-stat">
          <div className="dataset-stat-val">{dataset.columns?.length || 0}</div>
          <div className="dataset-stat-key">data points</div>
        </div>
      </div>
      <div className="density-pills">
        <span className="density-pill"><Mail size={11} />{density.emails.toLocaleString()}</span>
        <span className="density-pill"><Phone size={11} />{density.phones.toLocaleString()}</span>
        <span className="density-pill"><Globe size={11} />{density.websites.toLocaleString()}</span>
        <span className="density-pill"><Linkedin size={11} />{density.linkedin.toLocaleString()}</span>
      </div>
      <div className="dataset-card-actions" onClick={(e) => e.stopPropagation()}>
      </div>
    </div>
  )
}
