import { X, SlidersHorizontal, Check } from 'lucide-react'

const STATUS_OPTS = [
  { value: 'all',       label: 'All'       },
  { value: 'New',       label: 'New'       },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Follow-up', label: 'Follow-up' },
]
const DATE_SORT_OPTS = [
  { value: 'most-recent',  label: 'Most Recent'  },
  { value: 'least-recent', label: 'Oldest First' },
]
const PRESENCE_OPTS = [
  { value: 'all',  label: 'All'  },
  { value: 'has',  label: 'Has'  },
  { value: 'none', label: 'None' },
]
const CMS_OPTS = [
  { value: 'all',          label: 'All'        },
  { value: 'wordpress',    label: 'WordPress'  },
  { value: 'shopify',      label: 'Shopify'    },
  { value: 'wix',          label: 'Wix'        },
  { value: 'squarespace',  label: 'Squarespace'},
  { value: 'webflow',      label: 'Webflow'    },
  { value: 'drupal',       label: 'Drupal'     },
]

function PillGroup({ options, value, onChange }) {
  return (
    <div className="fd-pill-group">
      {options.map(({ value: val, label }) => (
        <button
          key={val}
          className={`fd-pill${value === val ? ' active' : ''}`}
          onClick={() => onChange(val)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="fd-section">
      <div className="fd-section-title">{title}</div>
      {children}
    </div>
  )
}

function FilterRow({ label, children }) {
  return (
    <div className="fd-row">
      <div className="fd-row-label">{label}</div>
      {children}
    </div>
  )
}

export function FilterDrawer({ open, onClose, filters, onChange, onClear, onApply, activeCount, matchCount, totalCount }) {
  const handleReviewsMin = (e) => {
    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
    if (!isNaN(val)) onChange({ minReviews: Math.max(0, val) })
  }
  const handleReviewsMax = (e) => {
    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
    if (val === null || !isNaN(val)) onChange({ maxReviews: val !== null ? Math.max(0, val) : null })
  }
  const handlePerfThreshold = (e) => {
    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
    if (val === null || !isNaN(val)) {
      onChange({ perfThreshold: val !== null ? Math.max(0, Math.min(100, val)) : null })
    }
  }
  const handleDaysSinceContacted = (e) => {
    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
    if (val === null || !isNaN(val)) {
      onChange({ daysSinceContacted: val !== null ? Math.max(0, val) : null })
    }
  }

  const isZeroMatch = matchCount === 0

  return (
    <>
      {open && <div className="fd-overlay" onClick={onClose} />}

      <div className={`fd-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        {/* Header */}
        <div className="fd-header">
          <div className="fd-header-title">
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="fd-active-badge">{activeCount}</span>
            )}
          </div>
          <button className="fd-close" onClick={onClose} aria-label="Close filters">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="fd-body">

          {/* ── Group 1: Audit Progress ── */}
          <Section title="Audit Progress">
            <FilterRow label="Status">
              <PillGroup options={STATUS_OPTS} value={filters.status} onChange={(v) => onChange({ status: v })} />
            </FilterRow>

            {filters.status === 'Contacted' && (
              <FilterRow label="Last Touched">
                <PillGroup options={DATE_SORT_OPTS} value={filters.dateSort} onChange={(v) => onChange({ dateSort: v })} />
              </FilterRow>
            )}

            <FilterRow label="PSI Audit">
              <PillGroup options={PRESENCE_OPTS} value={filters.psi} onChange={(v) => onChange({ psi: v })} />
            </FilterRow>
          </Section>

          <div className="fd-divider" />

          {/* ── Group 2: Lead Quality ── */}
          <Section title="Lead Quality">
            <FilterRow label={`Min Rating${filters.minRating > 0 ? ` — ${filters.minRating}★` : ''}`}>
              <div className="fd-slider-wrap">
                <span className="fd-slider-tick">0</span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={filters.minRating}
                  onChange={(e) => onChange({ minRating: parseFloat(e.target.value) })}
                  className="fd-slider"
                />
                <span className="fd-slider-tick">5★</span>
              </div>
              {filters.minRating === 0 && (
                <span className="fd-slider-hint">Drag to set minimum star rating</span>
              )}
            </FilterRow>

            <FilterRow label="Review Count">
              <div className="fd-range-inputs">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.minReviews || ''}
                  onChange={handleReviewsMin}
                  className="fd-number-input"
                />
                <span className="fd-range-sep">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.maxReviews ?? ''}
                  onChange={handleReviewsMax}
                  className="fd-number-input"
                />
              </div>
            </FilterRow>

            <FilterRow label="CMS Type">
              <PillGroup options={CMS_OPTS} value={filters.cms} onChange={(v) => onChange({ cms: v })} />
            </FilterRow>
          </Section>

          <div className="fd-divider" />

          {/* ── Group 3: Connection ── */}
          <Section title="Connection">
            <FilterRow label="Website">
              <PillGroup options={PRESENCE_OPTS} value={filters.website} onChange={(v) => onChange({ website: v })} />
            </FilterRow>

            <FilterRow label="LinkedIn">
              <PillGroup options={PRESENCE_OPTS} value={filters.linkedIn} onChange={(v) => onChange({ linkedIn: v })} />
            </FilterRow>

            <FilterRow label="Email">
              <PillGroup options={PRESENCE_OPTS} value={filters.email} onChange={(v) => onChange({ email: v })} />
            </FilterRow>
          </Section>

          <div className="fd-divider" />

          {/* ── Group 4: Performance & Outreach ── */}
          <Section title="Performance & Outreach">
            <FilterRow label="Performance Threshold">
              <div className="fd-perf-input-wrap">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 50"
                  value={filters.perfThreshold ?? ''}
                  onChange={handlePerfThreshold}
                  className="fd-number-input"
                />
                {filters.perfThreshold !== null && (
                  <span className="fd-perf-hint">Score &lt; {filters.perfThreshold}</span>
                )}
              </div>
              <span className="fd-slider-hint">Show records where mobile performance is below this score</span>
            </FilterRow>

            <FilterRow label="Days Since Contacted">
              <div className="fd-perf-input-wrap">
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 30"
                  value={filters.daysSinceContacted ?? ''}
                  onChange={handleDaysSinceContacted}
                  className="fd-number-input"
                />
                {filters.daysSinceContacted !== null && (
                  <span className="fd-perf-hint">≥ {filters.daysSinceContacted}d ago</span>
                )}
              </div>
              <span className="fd-slider-hint">Show records not contacted in at least this many days</span>
            </FilterRow>
          </Section>
        </div>

        {/* Footer */}
        <div className="fd-footer">
          <div className={`fd-match-count${isZeroMatch ? ' fd-match-count--zero' : ''}`}>
            {matchCount.toLocaleString()} of {totalCount.toLocaleString()} records match
          </div>
          <div className="fd-footer-actions">
            <button
              className="fd-clear-btn fd-clear-btn--compact"
              onClick={onClear}
            >
              <X size={12} />
              Clear
            </button>
            <button
              className="fd-apply-btn"
              onClick={onApply}
              disabled={isZeroMatch}
            >
              <Check size={14} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
