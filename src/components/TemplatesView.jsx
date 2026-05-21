import { useState } from 'react'
import { Plus, FileText, Pencil, Trash2, Mail, Linkedin } from 'lucide-react'
import { TemplateEditor } from './TemplateEditor'

export function TemplatesView({ templates, onSave, onDelete }) {
  const [editing, setEditing] = useState(null)

  const dmTemplates = templates.filter(t => t.type === 'DM')
  const emailTemplates = templates.filter(t => t.type === 'Email')

  const renderCard = (tpl) => (
    <div key={tpl.id} className="tpl-card">
      <div className="title-buttons">
      <div className="tpl-card-name">{tpl.name}</div>
      <div style={{ display: 'flex', gap: 2 }}>
          <button className="tpl-icon-btn" onClick={() => setEditing(tpl)} title="Edit">
            <Pencil size={13} />
          </button>
          <button className="tpl-icon-btn tpl-icon-btn-danger" onClick={() => onDelete(tpl.id)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {tpl.subject && (
        <div className="tpl-card-subject">{tpl.subject}</div>
      )}
      <div className="tpl-card-preview">
        {tpl.body.slice(0, 110)}{tpl.body.length > 110 ? '…' : ''}
      </div>
      <div className="tpl-card-top">
        
      </div>
    </div>
  )

  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <div className="gallery-title">Message Templates</div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus size={14} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <FileText size={32} className="empty-state-icon" />
          <div className="empty-state-title">No message templates yet</div>
          <div className="empty-state-sub">
            Create a DM or Email template and use variables like [businessName] to personalise each message
          </div>
        </div>
      ) : (
        <div className="tpl-sections">
          <div className="tpl-section">
            <div className="tpl-section-header">
              <span className="tpl-section-icon tpl-section-icon-dm"><Linkedin size={14} /></span>
              <span className="tpl-section-title">LinkedIn DMs</span>
              <span className="tpl-section-count linkedin-count">{dmTemplates.length}</span>
            </div>
            {dmTemplates.length === 0 ? (
              <div className="tpl-section-empty">No LinkedIn DM templates yet</div>
            ) : (
              <div className="tpl-section-grid">
                {dmTemplates.map(renderCard)}
              </div>
            )}
          </div>

          <div className="tpl-section">
            <div className="tpl-section-header">
              <span className="tpl-section-icon tpl-section-icon-email"><Mail size={14} /></span>
              <span className="tpl-section-title">Email Templates</span>
              <span className="tpl-section-count">{emailTemplates.length}</span>
            </div>
            {emailTemplates.length === 0 ? (
              <div className="tpl-section-empty">No Email templates yet</div>
            ) : (
              <div className="tpl-section-grid">
                {emailTemplates.map(renderCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <TemplateEditor
          template={editing === 'new' ? null : editing}
          onSave={(tpl) => { onSave(tpl); setEditing(null) }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
