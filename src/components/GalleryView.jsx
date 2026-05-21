import { Database, Plus } from 'lucide-react'
import { DatasetCard } from './DatasetCard'

export function GalleryView({ datasets, onView, onDelete, onAddNew }) {
  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <div className="gallery-title">Your Lead Lists</div>
        <button className="btn btn-ghost" onClick={onAddNew}>
          <Plus size={14} /> Add Lead List
        </button>
      </div>

      {datasets.length === 0 ? (
        <div className="empty-state">
          <Database size={36} className="empty-state-icon" />
          <div className="empty-state-title">No lead lists yet</div>
          <div className="empty-state-sub">
            Upload your first CSV or XLSX file to get started.
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {datasets.map((ds) => (
            <DatasetCard
              key={ds.id}
              dataset={ds}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
