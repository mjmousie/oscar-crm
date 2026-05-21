import { useState, useRef } from 'react'
import { FileUp, ListTodo, MessageSquarePlus, ChevronDown, ArrowRightToLine, ArrowLeftToLine } from 'lucide-react'

const iconWrap = { width: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }

function NavItem({ icon: Icon, label, active, collapsed, onClick }) {
  const btnRef = useRef(null)
  const [tooltipPos, setTooltipPos] = useState(null)

  const handleMouseEnter = () => {
    if (collapsed && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    }
  }

  return (
    <div className="w-full" onMouseEnter={handleMouseEnter} onMouseLeave={() => setTooltipPos(null)}>
      <button
        ref={btnRef}
        className={`nav-item ${active ? 'active' : ''}`}
        onClick={onClick}
        style={collapsed ? { justifyContent: 'center', padding: '9px 0', gap: 0 } : {}}
      >
        <span style={iconWrap}>
          <Icon size={16} />
        </span>
        <span
          style={{
            maxWidth: collapsed ? '0' : '200px',
            overflow: 'hidden',
            opacity: collapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            display: 'block',
            transition: collapsed
              ? 'opacity 0.1s ease, max-width 0.3s ease-in-out 0.05s'
              : 'opacity 0.2s ease 0.2s, max-width 0.3s ease-in-out',
          }}
        >
          {label}
        </span>
      </button>

      {collapsed && tooltipPos && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
        >
          <div className="bg-slate-800 text-slate-200 border border-slate-800 text-sm px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
            {label}
          </div>
        </div>
      )}
    </div>
  )
}

function LeadListHeader({ isCollapsed, isOpen, active, onClick }) {
  const btnRef = useRef(null)
  const [tooltipPos, setTooltipPos] = useState(null)

  const handleMouseEnter = () => {
    if (isCollapsed && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    }
  }

  return (
    <div className="w-full" onMouseEnter={handleMouseEnter} onMouseLeave={() => setTooltipPos(null)}>
      <button
        ref={btnRef}
        className={`nav-item ${active ? 'active' : ''}`}
        onClick={onClick}
        style={isCollapsed ? { justifyContent: 'center', padding: '9px 0', gap: 0 } : {}}
      >
        <span style={iconWrap}>
          <ListTodo size={16} />
        </span>
        <span
          style={{
            maxWidth: isCollapsed ? '0' : '200px',
            overflow: 'hidden',
            opacity: isCollapsed ? 0 : 1,
            whiteSpace: 'nowrap',
            display: 'block',
            transition: isCollapsed
              ? 'opacity 0.1s ease, max-width 0.3s ease-in-out 0.05s'
              : 'opacity 0.2s ease 0.2s, max-width 0.3s ease-in-out',
          }}
        >
          View Lead Lists
        </span>
        {!isCollapsed && (
          <ChevronDown
            size={13}
            className="text-slate-400 shrink-0"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
              marginLeft: 'auto',
            }}
          />
        )}
      </button>

      {isCollapsed && tooltipPos && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
        >
          <div className="bg-slate-800 text-slate-200 border border-slate-800 text-sm px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
            View Lead Lists
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleButton({ isCollapsed, onClick }) {
  const btnRef = useRef(null)
  const [tooltipPos, setTooltipPos] = useState(null)

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    }
  }

  return (
    <div
      style={{ display: 'flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTooltipPos(null)}
    >
      <button
        ref={btnRef}
        onClick={onClick}
        className="nav-item"
        style={{ width: 'auto', padding: '5px 7px', justifyContent: 'center' }}
      >
        {isCollapsed ? <ArrowRightToLine size={15} /> : <ArrowLeftToLine size={15} />}
      </button>

      {tooltipPos && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
        >
          <div className="bg-slate-800 text-slate-200 border border-slate-800 text-sm px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
            {isCollapsed ? 'Expand' : 'Collapse'}
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ view, datasets, activeDatasetId, onNavigate, onSelectDataset }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLeadListOpen, setIsLeadListOpen] = useState(true)

  return (
    <div
      className="sidebar"
      style={{
        width: isCollapsed ? '80px' : '256px',
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <div className="sidebar-content">
        {/* Header row: Actions label + collapse toggle */}
        <div
          className="flex items-center w-full h-12"
          style={{
            padding: isCollapsed ? '0' : '0 16px',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          <span
            className="text-xs font-semibold tracking-wider uppercase text-slate-400"
            style={{
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? 0 : '200px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              transition: 'opacity 0.15s ease, max-width 0.3s ease-in-out',
            }}
          >
            Actions
          </span>
          <ToggleButton
            isCollapsed={isCollapsed}
            onClick={() => setIsCollapsed(c => !c)}
          />
        </div>

        {/* Actions nav items */}
        <div className="sidebar-section">
          <NavItem
            icon={FileUp}
            label="Add New Lead List"
            active={view === 'upload'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('upload')}
          />
        </div>

        {datasets.length > 0 && (
          <>
            <div className="divider" />
            <div className="dataset-list">
              <LeadListHeader
                isCollapsed={isCollapsed}
                isOpen={isLeadListOpen}
                active={view === 'gallery'}
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false)
                    setIsLeadListOpen(true)
                  } else {
                    setIsLeadListOpen(o => !o)
                  }
                }}
              />

              {/* Accordion body */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isLeadListOpen && !isCollapsed ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.25s ease',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  {datasets.map((ds) => (
                    <button
                      key={ds.id}
                      className={`dataset-nav-item ${activeDatasetId === ds.id ? 'active' : ''}`}
                      onClick={() => onSelectDataset(ds)}
                      title={ds.name}
                      style={{ paddingLeft: '40px' }}
                    >
                      <span className={`dataset-nav-dot${activeDatasetId === ds.id ? ' active' : ''}`} />
                      <span className="dataset-nav-name">{ds.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="divider" />
            <div className="dataset-list">
              <div
                className="sidebar-label"
                style={{
                  opacity: isCollapsed ? 0 : 1,
                  maxHeight: isCollapsed ? '0' : '30px',
                  overflow: 'hidden',
                  transition: 'opacity 0.15s ease, max-height 0.25s ease-in-out',
                }}
              >
                Outreach
              </div>
              <NavItem
                icon={MessageSquarePlus}
                label="Message Templates"
                active={view === 'templates'}
                collapsed={isCollapsed}
                onClick={() => onNavigate('templates')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
