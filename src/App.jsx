import { useState, useMemo } from 'react'
import { Sidebar }          from './components/Sidebar'
import { FileUpload }       from './components/FileUpload'
import { GalleryView }      from './components/GalleryView'
import { DataExplorer }     from './components/DataExplorer'
import { TemplatesView }    from './components/TemplatesView'
import { ToastContainer }   from './components/ToastContainer'
import { AuditIndicator }   from './components/AuditIndicator'
import { useDatasets }      from './hooks/useDatasets'
import { useTemplates }     from './hooks/useTemplates'
import { useToast }         from './hooks/useToast'
import { AuditProvider }    from './contexts/AuditContext'

export default function App() {
  const { datasets, loading, saveDataset, deleteDataset, updateRow, deleteRow } = useDatasets()
  const { templates, saveTemplate, deleteTemplate } = useTemplates()
  const { toasts, show: showToast } = useToast()

  const [view, setView]                   = useState('gallery')
  const [activeDatasetId, setActiveDatasetId] = useState(null)

  // Derive activeDataset from the live datasets list so row updates are reflected instantly
  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeDatasetId) ?? null,
    [datasets, activeDatasetId]
  )

  const handleView = (ds) => {
    setActiveDatasetId(ds.id)
    setView('explorer')
  }

  const handleDelete = async (id) => {
    await deleteDataset(id)
    showToast('Dataset deleted')
    if (activeDatasetId === id) {
      setActiveDatasetId(null)
      setView('gallery')
    }
  }

  const handleSave = async (ds) => {
    await saveDataset(ds)
    showToast(`"${ds.name}" uploaded — ${ds.rowCount.toLocaleString()} rows`, 'success')
  }

  const handleNavigate = (target) => {
    if (target === 'gallery') setActiveDatasetId(null)
    setView(target)
  }

  return (
    <AuditProvider showToast={showToast}>
    <div className="app-shell">
      {/* Top bar */}
      <header className="top-bar">
        <span className="top-bar-logo">OS<span>CAR</span></span>
        <span className="top-bar-badge">Outscraper Client Audit Reconnaissance</span>
        <div className="top-bar-sep" />
        <AuditIndicator />
      </header>

      <div className="body-area">
        {/* Sidebar */}
        <Sidebar
          view={view}
          datasets={datasets}
          activeDatasetId={activeDataset?.id}
          onNavigate={handleNavigate}
          onSelectDataset={handleView}
        />

        {/* Main content */}
        <main className="main-area">
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading…</div>
              </div>
            </div>
          ) : view === 'upload' ? (
            <FileUpload onSave={handleSave} onNavigate={handleNavigate} />
          ) : view === 'templates' ? (
            <TemplatesView
              templates={templates}
              onSave={saveTemplate}
              onDelete={deleteTemplate}
            />
          ) : view === 'explorer' && activeDataset ? (
            <DataExplorer
              dataset={activeDataset}
              datasetId={activeDatasetId}
              updateRow={updateRow}
              deleteRow={deleteRow}
              templates={templates}
              onBack={() => handleNavigate('gallery')}
            />
          ) : (
            <GalleryView
              datasets={datasets}
              onView={handleView}
              onDelete={handleDelete}
              onAddNew={() => setView('upload')}
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
    </AuditProvider>
  )
}
