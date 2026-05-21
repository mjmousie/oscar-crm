import { useState, useRef } from 'react'
import { Upload, File, Check } from 'lucide-react'
import { parseFile } from '../utils/parseFile'

export function FileUpload({ onSave, onNavigate }) {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError('')
    if (!name) setName(f.name.replace(/\.(csv|xlsx|xls)$/i, ''))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file || !name.trim()) return
    setParsing(true)
    setProgress(20)
    try {
      setProgress(40)
      const rows = await parseFile(file)
      setProgress(75)
      const dataset = {
        id: `ds_${Date.now()}`,
        name: name.trim(),
        createdAt: Date.now(),
        rowCount: rows.length,
        columns: rows.length > 0 ? Object.keys(rows[0]) : [],
        rows,
      }
      setProgress(90)
      await onSave(dataset)
      setProgress(100)
      setTimeout(() => {
        setParsing(false)
        setFile(null)
        setName('')
        setProgress(0)
        onNavigate('gallery')
      }, 400)
    } catch (err) {
      setError(err.message || 'Failed to parse file')
      setParsing(false)
      setProgress(0)
    }
  }

  return (
    <div className="upload-view">
      <div className="upload-card">
        <div className="upload-card-title">Add New Lead List</div>
        <div className="upload-card-sub">
          Upload a CSV or Excel file exported from Outscraper.
        </div>

        <div
          className={`dropzone ${dragging ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="dropzone-icon">
            <Upload size={32} />
          </div>
          <div className="dropzone-title">Drop your file here</div>
          <div className="dropzone-sub">
            or <em>click to browse</em> · CSV, XLSX, XLS supported
          </div>
          {file && (
            <div
              className="dropzone-file-selected"
              onClick={(e) => e.stopPropagation()}
            >
              <File size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span className="dropzone-file-name">{file.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--success)' }}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--danger)' }}>{error}</div>
        )}

        <div className="field-group">
          <label className="field-label">Lead List Name</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Marketing Companies – Akron OH"
          />
        </div>

        {parsing && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleUpload}
          disabled={!file || !name.trim() || parsing}
        >
          <Upload size={15} />
          {parsing ? 'Processing…' : 'Upload Lead List'}
        </button>
      </div>
    </div>
  )
}
