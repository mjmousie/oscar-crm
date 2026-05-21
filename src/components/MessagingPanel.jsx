import { useState } from 'react'
import { Mail, MessageSquare, Copy, ExternalLink, Send } from 'lucide-react'
import { parseTemplate } from '../utils/shortcodes'
import { g } from '../utils/columns'

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button className="btn-msg-action" onClick={copy}>
      <Copy size={12} />
      {done ? 'Copied!' : 'Copy'}
    </button>
  )
}

export function MessagingPanel({ row, templates, onUpdateRow }) {
  const [tab, setTab]           = useState('DM')
  const [selectedId, setSelId]  = useState('')

  const pool    = templates.filter((t) => t.type === tab)
  const active  = pool.find((t) => t.id === selectedId) ?? pool[0] ?? null

  const linkedInUrl = g(row, 'company_linkedin') || g(row, 'contact_linkedin') || ''
  const emailAddr   = g(row, 'email') || ''

  const parsedSubject = active?.subject ? parseTemplate(active.subject, row) : ''
  const parsedBody    = active           ? parseTemplate(active.body,    row) : ''

  const gmailUrl = emailAddr && parsedBody
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddr)}&su=${encodeURIComponent(parsedSubject)}&body=${encodeURIComponent(parsedBody)}`
    : null

  const handleSendEmail = () => {
    if (!gmailUrl) return
    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    onUpdateRow?.({
      _status: 'Contacted',
      _contactMethod: 'Email',
      _lastContacted: new Date().toISOString(),
    })
  }

  const switchTab = (t) => { setTab(t); setSelId('') }

  return (
    <div className="messaging-panel">
      {/* Tab bar */}
      <div className="msg-tabs">
        <button className={`msg-tab${tab === 'DM' ? ' active' : ''}`} onClick={() => switchTab('DM')}>
          <MessageSquare size={12} /> LinkedIn DM
        </button>
        <button className={`msg-tab${tab === 'Email' ? ' active' : ''}`} onClick={() => switchTab('Email')}>
          <Mail size={12} /> Email
        </button>
      </div>

      {pool.length === 0 ? (
        <p className="metrics-empty text-center py-4">
          No templates available for this category.
        </p>
      ) : (
        <>
          {/* Template selector */}
          <select
            className="field-input"
            style={{ height: 32, fontSize: 13 }}
            value={selectedId || active?.id || ''}
            onChange={(e) => setSelId(e.target.value)}
          >
            {pool.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {active && (
            <>
              {/* Email subject preview */}
              {tab === 'Email' && parsedSubject && (
                <div className="msg-preview-block">
                  <div className="msg-preview-label">Subject</div>
                  <div className="msg-preview-text msg-preview-subject">{parsedSubject}</div>
                </div>
              )}

              {/* Body preview */}
              <div className="msg-preview-block">
                <div className="msg-preview-label">Message</div>
                <div className="msg-preview-text">{parsedBody}</div>
              </div>

              {/* Actions */}
              <div className="msg-actions">
                <CopyBtn text={parsedBody} />

                {tab === 'DM' ? (
                  linkedInUrl ? (
                    <a
                      className="btn-msg-action btn-msg-primary"
                      href={linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={12} /> Open LinkedIn
                    </a>
                  ) : (
                    <span className="metrics-empty" style={{ fontSize: 11 }}>No LinkedIn URL on record</span>
                  )
                ) : (
                  gmailUrl ? (
                    <button className="btn-msg-action btn-msg-primary" onClick={handleSendEmail}>
                      <Send size={12} /> Send via Gmail
                    </button>
                  ) : (
                    <span className="metrics-empty" style={{ fontSize: 11 }}>
                      {emailAddr ? 'No message body' : 'No email address on record'}
                    </span>
                  )
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
