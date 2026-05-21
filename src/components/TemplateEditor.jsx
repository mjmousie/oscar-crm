import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { SHORTCODES, SHORTCODE_GROUPS } from '../utils/shortcodes'

export function TemplateEditor({ template, onSave, onCancel }) {
  const [type,    setType]    = useState(template?.type    || 'DM')
  const [name,    setName]    = useState(template?.name    || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [body,    setBody]    = useState(template?.body    || '')
  const [active,  setActive]  = useState('body') // which field receives shortcode inserts

  const subjectRef = useRef(null)
  const bodyRef    = useRef(null)

  const insertShortcode = (key) => {
    const token = `[${key}]`
    const isSubject = active === 'subject' && type === 'Email'
    const ref       = isSubject ? subjectRef : bodyRef
    const el        = ref.current
    if (!el) return

    const start  = el.selectionStart ?? el.value.length
    const end    = el.selectionEnd   ?? el.value.length
    const before = el.value.slice(0, start)
    const after  = el.value.slice(end)
    const next   = before + token + after

    if (isSubject) setSubject(next)
    else            setBody(next)

    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const canSave =
    name.trim() &&
    body.trim() &&
    (type !== 'Email' || subject.trim())

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id:        template?.id        || `tpl_${Date.now()}`,
      createdAt: template?.createdAt || Date.now(),
      type,
      name:    name.trim(),
      subject: type === 'Email' ? subject.trim() : undefined,
      body:    body.trim(),
    })
  }

  return (
    <div className="tpl-overlay">
      <div className="tpl-editor">
        {/* Header */}
        <div className="tpl-editor-header">
          <span className="tpl-editor-title">
            {template ? 'Edit Template' : 'New Template'}
          </span>
          <button className="detail-close" onClick={onCancel}><X size={16} /></button>
        </div>

        <div className="tpl-editor-body">
          {/* ── Form ── */}
          <div className="tpl-editor-form">
            {/* Type toggle */}
            <div className="tpl-field-group">
              <label className="tpl-field-label">Type</label>
              <div className="filter-btn-group">
                {['DM', 'Email'].map((t) => (
                  <button
                    key={t}
                    className={`filter-btn${type === t ? ' active' : ''}`}
                    onClick={() => setType(t)}
                  >
                    {t === 'DM' ? 'LinkedIn DM' : 'Email'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="tpl-field-group">
              <label className="tpl-field-label">Template Name</label>
              <input
                className="field-input"
                value={name}
                placeholder="e.g. Cold Outreach DM"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Subject — Email only */}
            {type === 'Email' && (
              <div className="tpl-field-group">
                <label className="tpl-field-label">
                  Subject
                  {active === 'subject' && <span className="tpl-active-hint">← inserting here</span>}
                </label>
                <input
                  className="field-input"
                  ref={subjectRef}
                  value={subject}
                  placeholder="e.g. Quick question about [businessName]"
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setActive('subject')}
                />
              </div>
            )}

            {/* Body */}
            <div className="tpl-field-group tpl-body-group">
              <label className="tpl-field-label">
                Body
                {(active === 'body' || type === 'DM') && (
                  <span className="tpl-active-hint">← inserting here</span>
                )}
              </label>
              <textarea
                className="tpl-textarea"
                ref={bodyRef}
                value={body}
                placeholder={"Hi [firstName],\n\nI came across [businessName] and noticed..."}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setActive('body')}
              />
            </div>
          </div>

          {/* ── Shortcode picker ── */}
          <div className="tpl-shortcode-panel">
            <div className="tpl-shortcode-title">Variables</div>
            <div className="tpl-shortcode-hint">Click to insert at cursor</div>
            {SHORTCODE_GROUPS.map((group) => (
              <div key={group} className="tpl-shortcode-group">
                <div className="tpl-shortcode-group-label">{group}</div>
                {SHORTCODES.filter((s) => s.group === group).map((sc) => (
                  <button
                    key={sc.key}
                    className="tpl-shortcode-btn"
                    onClick={() => insertShortcode(sc.key)}
                    title={sc.label}
                  >
                    [{sc.key}]
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="tpl-editor-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}
