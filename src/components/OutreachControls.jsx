import { useState } from 'react'
import { Mail, MessageSquare, Phone, Activity } from 'lucide-react'

const METHODS = [
  { key: 'Email',          label: 'Email',          icon: Mail,          color: '#2563eb' },
  { key: 'Direct Message', label: 'Direct Message', icon: MessageSquare, color: '#7c3aed' },
  { key: 'Cold Call',      label: 'Cold Call',      icon: Phone,         color: '#0891b2' },
]

const STATUS_CYCLE = ['New', 'Contacted', 'Follow-up']

const STATUS_STYLE = {
  'New':       { bg: 'var(--surface-alt)',   color: 'var(--text-secondary)' },
  'Contacted': { bg: 'var(--success-light)', color: 'var(--success)'        },
  'Follow-up': { bg: 'var(--warning-light)', color: 'var(--warning)'        },
}

export function OutreachControls({ row, onUpdateRow, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const status       = row._status        || 'New'
  const method       = row._contactMethod || null
  const lastContacted = row._lastContacted

  const cycleStatus = () => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]
    onUpdateRow({ _status: next })
  }

  const logContact = (methodKey) => {
    setDropdownOpen(false)
    onUpdateRow({
      _status: 'Contacted',
      _contactMethod: methodKey,
      _lastContacted: new Date().toISOString(),
    })
  }

  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE['New']

  return (
    <div className="outreach-controls">
      {/* Status row */}
      <div className="outreach-status-row">
        <button
          className="outreach-status-badge"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
          onClick={cycleStatus}
          title="Click to cycle status"
        >
          {status}
        </button>
        {method && (
          <span className="outreach-method-tag">{method}</span>
        )}
        {lastContacted && (
          <span className="outreach-last-date">
            {new Date(lastContacted).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="outreach-actions">
        {/* Log Contact dropdown */}
        <div className="outreach-log-wrap">
          <button
            className="btn-outreach-log"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <Activity size={12} />
            Log Contact
          </button>
          {dropdownOpen && (
            <>
              <div className="outreach-overlay" onClick={() => setDropdownOpen(false)} />
              <div className="outreach-dropdown">
                {METHODS.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    className="outreach-method-btn"
                    onClick={() => logContact(key)}
                  >
                    <Icon size={13} style={{ color }} />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete with confirmation */}
        {!confirmDelete ? (
          <button
            className="btn-outreach-delete"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        ) : (
          <div className="outreach-confirm-delete">
            <span>Remove?</span>
            <button className="btn-confirm-yes-sm" onClick={() => { setConfirmDelete(false); onDelete() }}>
              Yes
            </button>
            <button className="btn-confirm-no-sm" onClick={() => setConfirmDelete(false)}>
              No
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
