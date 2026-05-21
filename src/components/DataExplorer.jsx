import { useState, useMemo, useCallback, useRef } from 'react'
import { Search, X, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { DataTable } from './DataTable'
import { DetailPanel } from './DetailPanel'
import { FilterDrawer } from './FilterDrawer'
import { g } from '../utils/columns'

const DEFAULT_FILTERS = {
  status:             'all',
  dateSort:           'most-recent',
  website:            'all',   // 'all' | 'has' | 'none'
  linkedIn:           'all',   // 'all' | 'has' | 'none'
  psi:                'all',   // 'all' | 'has' | 'none'
  email:              'all',   // 'all' | 'has' | 'none'
  minRating:          0,
  minReviews:         0,
  maxReviews:         null,    // null = no max
  cms:                'all',
  perfThreshold:      null,    // show records where perfScore < this value
  daysSinceContacted: null,    // show records where days since _lastContacted >= this value
}

function countActiveFilters(f) {
  return [
    f.status             !== 'all',
    f.website            !== 'all',
    f.linkedIn           !== 'all',
    f.psi                !== 'all',
    f.email              !== 'all',
    f.minRating          > 0,
    f.minReviews         > 0,
    f.maxReviews         !== null,
    f.cms                !== 'all',
    f.perfThreshold      !== null,
    f.daysSinceContacted !== null,
  ].filter(Boolean).length
}

function filterRows(rows, search, filters) {
  let pairs = rows.map((row, i) => [row, i])

  if (search.trim()) {
    const q = search.toLowerCase()
    pairs = pairs.filter(([row]) =>
      (g(row, 'name')    || '').toLowerCase().includes(q) ||
      (g(row, 'email')   || '').toLowerCase().includes(q) ||
      (g(row, 'phone')   || '').includes(q) ||
      (g(row, 'city')    || '').toLowerCase().includes(q) ||
      (g(row, 'website') || '').toLowerCase().includes(q)
    )
  }

  if (filters.status !== 'all') {
    pairs = pairs.filter(([row]) => (row._status || 'New') === filters.status)
  }

  if (filters.website === 'has') {
    pairs = pairs.filter(([row]) => !!g(row, 'website'))
  } else if (filters.website === 'none') {
    pairs = pairs.filter(([row]) => !g(row, 'website'))
  }

  if (filters.linkedIn === 'has') {
    pairs = pairs.filter(([row]) =>
      !!g(row, 'company_linkedin') || !!g(row, 'contact_linkedin')
    )
  } else if (filters.linkedIn === 'none') {
    pairs = pairs.filter(([row]) =>
      !g(row, 'company_linkedin') && !g(row, 'contact_linkedin')
    )
  }

  if (filters.psi === 'has') {
    pairs = pairs.filter(([row]) => row.overallHealth != null)
  } else if (filters.psi === 'none') {
    pairs = pairs.filter(([row]) => row.overallHealth == null)
  }

  if (filters.email === 'has') {
    pairs = pairs.filter(([row]) => !!g(row, 'email'))
  } else if (filters.email === 'none') {
    pairs = pairs.filter(([row]) => !g(row, 'email'))
  }

  if (filters.minRating > 0) {
    pairs = pairs.filter(([row]) => {
      const r = parseFloat(g(row, 'rating') || 0)
      return r >= filters.minRating
    })
  }

  if (filters.minReviews > 0) {
    pairs = pairs.filter(([row]) => {
      const r = parseInt(g(row, 'reviews') || 0, 10)
      return r >= filters.minReviews
    })
  }
  if (filters.maxReviews !== null) {
    pairs = pairs.filter(([row]) => {
      const r = parseInt(g(row, 'reviews') || 0, 10)
      return r <= filters.maxReviews
    })
  }

  if (filters.cms !== 'all') {
    const cmsLower = filters.cms.toLowerCase()
    pairs = pairs.filter(([row]) =>
      (row.website_generator || '').toLowerCase().includes(cmsLower)
    )
  }

  // Performance threshold: records where perfScore < threshold
  if (filters.perfThreshold !== null) {
    pairs = pairs.filter(([row]) => {
      const score = row.perfScore
      return score != null && score < filters.perfThreshold
    })
  }

  // Days since last contacted: records where elapsed days >= threshold
  if (filters.daysSinceContacted !== null) {
    const now = Date.now()
    const msPerDay = 86_400_000
    pairs = pairs.filter(([row]) => {
      if (!row._lastContacted) return false
      const days = Math.floor((now - new Date(row._lastContacted).getTime()) / msPerDay)
      return days >= filters.daysSinceContacted
    })
  }

  // Date sort — only meaningful when showing Contacted rows
  if (filters.status === 'Contacted') {
    pairs.sort(([a], [b]) => {
      const aT = a._lastContacted ? new Date(a._lastContacted).getTime() : 0
      const bT = b._lastContacted ? new Date(b._lastContacted).getTime() : 0
      return filters.dateSort === 'most-recent' ? bT - aT : aT - bT
    })
  }

  return {
    filteredRows:    pairs.map(([row]) => row),
    filteredIndices: pairs.map(([, i]) => i),
  }
}

export function DataExplorer({ dataset, datasetId, updateRow, deleteRow, templates, onBack }) {
  const [search, setSearch]               = useState('')
  const [selectedIdx, setSelected]        = useState(null)
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen]       = useState(false)
  const tableWrapRef                      = useRef(null)

  // Sync pendingFilters to current activeFilters when drawer opens
  const openDrawer = useCallback(() => {
    setPendingFilters(activeFilters)
    setDrawerOpen(true)
  }, [activeFilters])

  // Drawer inputs only touch pendingFilters — table does not jump
  const handleFilterChange = useCallback((updates) => {
    setPendingFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  // Apply: commit pending → active, close, animate
  const handleApply = useCallback(() => {
    setActiveFilters(pendingFilters)
    setSelected(null)
    setDrawerOpen(false)
    if (tableWrapRef.current) {
      tableWrapRef.current.classList.remove('table-fade-in')
      void tableWrapRef.current.offsetWidth // force reflow to restart animation
      tableWrapRef.current.classList.add('table-fade-in')
    }
  }, [pendingFilters])

  // Clear: reset pending only — does not affect active until Apply
  const handleClearPending = useCallback(() => {
    setPendingFilters(DEFAULT_FILTERS)
  }, [])

  // ─── Derived counts ──────────────────────────────────────────────────────────
  const activeFilterCount  = useMemo(() => countActiveFilters(activeFilters),  [activeFilters])
  const pendingFilterCount = useMemo(() => countActiveFilters(pendingFilters), [pendingFilters])

  // Table only reacts to activeFilters
  const { filteredRows, filteredIndices } = useMemo(
    () => filterRows(dataset.rows, search, activeFilters),
    [dataset.rows, search, activeFilters]
  )

  // Live count for the drawer footer — uses pendingFilters, ignores search
  const pendingMatchCount = useMemo(
    () => filterRows(dataset.rows, '', pendingFilters).filteredRows.length,
    [dataset.rows, pendingFilters]
  )

  const isFilterActive = activeFilterCount > 0

  const handleSelect = useCallback((idx) => {
    setSelected((prev) => (prev === idx ? null : idx))
  }, [])

  const handleUpdateRow = useCallback(async (filteredIdx, updates) => {
    const origIdx = filteredIndices[filteredIdx]
    await updateRow(datasetId, origIdx, updates)
  }, [filteredIndices, updateRow, datasetId])

  const handleDeleteRow = useCallback(async (filteredIdx) => {
    const origIdx = filteredIndices[filteredIdx]
    await deleteRow(datasetId, origIdx)
    setSelected(null)
  }, [filteredIndices, deleteRow, datasetId])

  const clearSearch = () => {
    setSearch('')
    setSelected(null)
  }

  return (
    <div className="explorer-view">
      {/* Toolbar */}
      <div className="explorer-toolbar">
        <button className="btn btn-ghost" style={{ height: 32, fontSize: 12.5 }} onClick={onBack}>
          <ArrowLeft size={13} /> Lead Lists
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div className="explorer-title">{dataset.name}</div>

        <div className="search-box">
          <Search size={14} />
          <input
            className="search-input"
            value={search}
            placeholder="Search by name, email, phone, city…"
            onChange={(e) => { setSearch(e.target.value); setSelected(null) }}
          />
        </div>

        {/* Filter trigger with badge */}
        <div className="fd-trigger-wrap">
          <button
            className={`btn btn-ghost fd-trigger${drawerOpen || isFilterActive ? ' fd-trigger--active' : ''}`}
            style={{ height: 32, fontSize: 12.5, gap: 6 }}
            onClick={() => { drawerOpen ? setDrawerOpen(false) : openDrawer() }}
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>
          {activeFilterCount > 0 && (
            <span className="fd-trigger-badge">{activeFilterCount}</span>
          )}
        </div>

        <div className="explorer-count">
          {filteredRows.length.toLocaleString()} {filteredRows.length === 1 ? 'record' : 'records'}
          {(search || isFilterActive) && ` of ${dataset.rowCount.toLocaleString()}`}
        </div>

        {search && (
          <button className="btn btn-ghost" style={{ height: 30, padding: '0 10px' }} onClick={clearSearch}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="explorer-body">
        {filteredRows.length === 0 ? (
          <div className="empty-state" style={{ flex: 1 }}>
            <Search size={32} className="empty-state-icon" />
            <div className="empty-state-title">No results found</div>
            <div className="empty-state-sub">
              {isFilterActive || search ? 'Try adjusting your filters or search' : 'No rows in this dataset'}
            </div>
          </div>
        ) : (
          <div ref={tableWrapRef} className="table-fade-in" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <DataTable
              rows={filteredRows}
              selectedIdx={selectedIdx}
              onSelect={handleSelect}
              onDeleteRow={handleDeleteRow}
            />
          </div>
        )}

        {selectedIdx !== null && filteredRows[selectedIdx] && (
          <DetailPanel
            key={filteredIndices[selectedIdx]}
            row={filteredRows[selectedIdx]}
            templates={templates}
            onClose={() => setSelected(null)}
            onUpdateRow={(updates) => handleUpdateRow(selectedIdx, updates)}
            onDelete={() => handleDeleteRow(selectedIdx)}
          />
        )}
      </div>

      {/* Filter drawer — fixed overlay, does not affect layout */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={pendingFilters}
        onChange={handleFilterChange}
        onClear={handleClearPending}
        onApply={handleApply}
        activeCount={pendingFilterCount}
        matchCount={pendingMatchCount}
        totalCount={dataset.rows.length}
      />
    </div>
  )
}
