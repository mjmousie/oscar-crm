import { X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'all',       label: 'All'       },
  { value: 'New',       label: 'New'       },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Follow-up', label: 'Follow-up' },
]

const DATE_SORT_OPTIONS = [
  { value: 'most-recent',  label: 'Most Recent'  },
  { value: 'least-recent', label: 'Least Recent' },
]

// 'all' = no filter, 'has' = must have, 'none' = must not have
const PRESENCE_OPTIONS = [
  { value: 'all',  label: 'All'  },
  { value: 'has',  label: 'Has'  },
  { value: 'none', label: 'None' },
]

const PSI_OPTIONS = [
  { value: 'all',  label: 'All'         },
  { value: 'has',  label: 'Has' },
  { value: 'none', label: 'None' },
]

function BtnGroup({ options, value, onChange }) {
  return (
    <div className="filter-btn-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function FilterBar({ filters, onChange, onClear }) {
  const { status, dateSort, website, linkedIn, psi } = filters
  const isActive = status !== 'all' || website !== 'all' || linkedIn !== 'all' || psi !== 'all'

  return (
    <div className="filter-bar">
      {/* Contact Status */}
      <div className="filter-group">
        <span className="filter-label">Status</span>
        <BtnGroup
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => onChange({ status: v })}
        />
      </div>

      {/* Date sort — only visible when Contacted is the active status filter */}
      {status === 'Contacted' && (
        <div className="filter-group">
          <span className="filter-label">Sort by Date</span>
          <BtnGroup
            options={DATE_SORT_OPTIONS}
            value={dateSort}
            onChange={(v) => onChange({ dateSort: v })}
          />
        </div>
      )}

      <div className="filter-sep" />

      {/* Website three-state */}
      <div className="filter-group">
        <span className="filter-label">Website</span>
        <BtnGroup
          options={PRESENCE_OPTIONS}
          value={website}
          onChange={(v) => onChange({ website: v })}
        />
      </div>

      <div className="filter-sep" />

      {/* LinkedIn three-state */}
      <div className="filter-group">
        <span className="filter-label">LinkedIn</span>
        <BtnGroup
          options={PRESENCE_OPTIONS}
          value={linkedIn}
          onChange={(v) => onChange({ linkedIn: v })}
        />
      </div>

      <div className="filter-sep" />

      {/* PSI audit status */}
      <div className="filter-group">
        <span className="filter-label">PSI</span>
        <BtnGroup
          options={PSI_OPTIONS}
          value={psi}
          onChange={(v) => onChange({ psi: v })}
        />
      </div>

      {isActive && (
        <button className="filter-clear" onClick={onClear}>
          <X size={11} />
          Clear filters
        </button>
      )}
    </div>
  )
}
