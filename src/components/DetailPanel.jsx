import { useState } from 'react'
import {
  X, Phone, Mail, Globe, MapPin, Linkedin, Star,
  Clock, Info, User, Building2, Signal, Check,
  Facebook, Instagram, Twitter, Youtube,
  Calendar, DollarSign, MessageCircle, InfoIcon,
  ChevronRight,
} from 'lucide-react'
import { g } from '../utils/columns'
import { OutreachControls } from './OutreachControls'
import { WebMetrics } from './WebMetrics'
import { MessagingPanel } from './MessagingPanel'

// ─── CollapsibleSection ───────────────────────────────────────────────────────
function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="cs-wrap">
      <button className="cs-header" onClick={() => setOpen((v) => !v)}>
        <span className="cs-title">{title}</span>
        <ChevronRight
          size={13}
          className="cs-chevron"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && <div className="cs-body">{children}</div>}
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, mono, isLink }) {
  if (!value) return null
  return (
    <div className="detail-row">
      <div className="detail-row-icon"><Icon size={13} /></div>
      <div className="detail-row-content">
        <div className="detail-row-label">{label}</div>
        <div className={`detail-row-value${mono ? ' mono' : ''}`}>
          {isLink
            ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
            : value}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  const hasContent = Array.isArray(children)
    ? children.some((c) => c !== null && c !== false && c !== undefined)
    : !!children
  if (!hasContent) return null
  return (
    <div>
      <div className="detail-section-title">{title}</div>
      {children}
    </div>
  )
}

function EmptyState({ message = 'No data found.' }) {
  return <p className="metrics-empty text-center py-4">{message}</p>
}

function WorkingHours({ raw }) {
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return (
      <div className="detail-hours">
        {days.map((day) => {
          const hours = parsed[day]
          if (!hours) return null
          return (
            <div className="detail-hours-row" key={day}>
              <span className="detail-hours-day">{day.slice(0, 3)}</span>
              <span className="detail-hours-time">
                {Array.isArray(hours) ? hours.join(', ') : hours}
              </span>
            </div>
          )
        })}
      </div>
    )
  } catch {
    return <span className="detail-empty">{raw}</span>
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DetailPanel({ row, templates = [], onClose, onUpdateRow, onDelete }) {
  if (!row) return null

  const get = (key) => g(row, key)
  const subtypes = get('category')
    ? String(get('category')).split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const emailStatus = get('email_status')
  const fullName = [get('first_name'), get('last_name')].filter(Boolean).join(' ') || get('full_name')

  const fullAddress = [get('street'), get('city'), get('state'), get('postal_code')]
    .filter(Boolean).join(', ') || null

  const placeId = get('place_id')
  const googleMapsUrl = placeId
    ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([get('name'), fullAddress].filter(Boolean).join(' '))}`

  return (
    <div className="detail-panel">
      {/* ── Fixed header ── */}
      <div className="detail-header">
        <button className="detail-close" onClick={onClose}><X size={16} /></button>
        <div className="detail-name">{get('name') || '—'}</div>
        <div className="detail-category">{get('type') || get('category') || ''}</div>
        {subtypes.length > 0 && (
          <div className="detail-tags" style={{ marginTop: 8 }}>
            {subtypes.slice(0, 4).map((t, i) => (
              <span key={i} className="detail-tag">{t}</span>
            ))}
          </div>
        )}
        {get('rating') && (
          <div className="star-rating" style={{ marginTop: 8 }}>
            <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            <span className="star-rating-val">{get('rating')}</span>
            {get('reviews') && (
              <span className="star-rating-count">({get('reviews')} reviews)</span>
            )}
            {get('business_status') === 'OPERATIONAL' && (
              <span className="badge badge-success" style={{ marginLeft: 6 }}>Open</span>
            )}
          </div>
        )}
      </div>

      {/* ── Scrollable collapsible sections ── */}
      <div className="detail-scroll">
        {/* 1 ── Basic Info — open */}
        <CollapsibleSection title="Primary Info" defaultOpen>
          {!(get('phone') || get('carrier_name') || get('carrier_type') || get('email') || emailStatus || get('website')) ? (
            <EmptyState />
          ) : (
            <>
              <DetailRow icon={Phone}  label="Phone"   value={get('phone')} />
              <DetailRow icon={Signal} label="Carrier" value={get('carrier_name')} />
              <DetailRow icon={Phone}  label="Type"    value={get('carrier_type')} />
              <DetailRow icon={Mail}   label="Email"   value={get('email')} />
              {emailStatus && (
                <div className="detail-row">
                  <div className="detail-row-icon"><Check size={13} /></div>
                  <div className="detail-row-content">
                    <div className="detail-row-label">Email Status</div>
                    <div className="detail-row-value">
                      <span className={`badge ${emailStatus === 'RECEIVING' ? 'badge-success' : 'badge-warning'}`}>
                        {emailStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <DetailRow icon={Globe} label="Website" value={get('website')} isLink />
            </>
          )}
        </CollapsibleSection>
        <CollapsibleSection title="Location Info">
          {!(fullAddress || get('time_zone')) ? (
            <EmptyState />
          ) : (
            <>
              <DetailRow icon={MapPin} label="Business Address" value={fullAddress} />
              <DetailRow icon={Clock}  label="Time Zone"        value={get('time_zone')} />
            </>
          )}
        </CollapsibleSection>
        <CollapsibleSection title="Main Contact Info">
          {!(fullName || get('title') || get('contact_phone') || get('contact_linkedin')) ? (
            <EmptyState />
          ) : (
            <>
              <DetailRow icon={User}     label="Name"         value={fullName} />
              <DetailRow icon={User}     label="Title"        value={get('title')} />
              <DetailRow icon={Phone}    label="Direct Phone" value={get('contact_phone')} />
              <DetailRow icon={Linkedin} label="LinkedIn"     value={get('contact_linkedin')} isLink />
            </>
          )}
        </CollapsibleSection>
        <CollapsibleSection title="Social Media">
          {!(get('company_linkedin') || get('company_facebook') || get('company_instagram') || get('company_x') || get('company_youtube')) ? (
            <EmptyState />
          ) : (
            <>
              <DetailRow icon={Linkedin}  label="LinkedIn"    value={get('company_linkedin')}  isLink />
              <DetailRow icon={Facebook}  label="Facebook"    value={get('company_facebook')}  isLink />
              <DetailRow icon={Instagram} label="Instagram"   value={get('company_instagram')} isLink />
              <DetailRow icon={Twitter}   label="Twitter / X" value={get('company_x')}         isLink />
              <DetailRow icon={Youtube}   label="YouTube"     value={get('company_youtube')}   isLink />
            </>
          )}
        </CollapsibleSection>
        <CollapsibleSection title="Company Insights">
          {!(get('company_insights_industry') || get('company_insights_employees') || get('company_insights_founded') || get('company_insights_revenue')) ? (
            <EmptyState />
          ) : (
            <>
              <DetailRow
                icon={Building2}
                label="Industry"
                value={get('company_insights_industry')?.replace(/_/g, ' ')}
              />
              <DetailRow icon={User}     label="Employees" value={get('company_insights_employees')} />
              <DetailRow icon={Calendar} label="Founded"   value={get('company_insights_founded')} />
              {get('company_insights_revenue') && (
                <DetailRow
                  icon={DollarSign}
                  label="Revenue"
                  value={`$${Number(get('company_insights_revenue')).toLocaleString()}`}
                />
              )}
            </>
          )}
        </CollapsibleSection>
        <CollapsibleSection title="Hours of Operation">
          {!get('working_hours') ? (
            <EmptyState />
          ) : (
            <WorkingHours raw={get('working_hours')} />
          )}
        </CollapsibleSection>
          {/* 3 ── Google Business — collapsed */}
        <CollapsibleSection title="Google Business">
          <DetailRow icon={InfoIcon}    label="Business Status" value={get('business_status')} />
          <DetailRow icon={Info}        label="Owner"           value={get('owner_title')} />
          {get('verified') && get('verified') !== '0' && (
            <div className="detail-row">
              <div className="detail-row-icon"><Check size={13} /></div>
              <div className="detail-row-content">
                <div className="detail-row-value">
                  <span className="badge badge-success">Google Verified</span>
                </div>
              </div>
            </div>
          )}
          <div className="detail-row">
            <div className="detail-row-icon"><MapPin size={13} /></div>
            <div className="detail-row-content">
              <div className="detail-row-label">Google Business Profile</div>
              <div className="detail-row-value">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>
        </CollapsibleSection>
          <CollapsibleSection title="Website & Technical">
            {!(get('website_title') || get('website_description') || get('website_generator') || get('website_has_gtm') || get('website_has_fb_pixel')) ? (
              <EmptyState />
            ) : (
              <>
                <DetailRow icon={Globe} label="Page Title"  value={get('website_title')} />
                <DetailRow icon={Info}  label="Description" value={get('website_description')} />
                <DetailRow icon={Info}  label="Generator"   value={get('website_generator')} />
                {(get('website_has_gtm') || get('website_has_fb_pixel')) && (
                  <div className="detail-row">
                    <div className="detail-row-icon"><Check size={13} /></div>
                    <div className="detail-row-content">
                      <div className="detail-row-label">Tracking</div>
                      <div className="detail-row-value" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {get('website_has_gtm') && get('website_has_gtm') !== '0' && (
                          <span className="badge badge-neutral">GTM</span>
                        )}
                        {get('website_has_fb_pixel') && get('website_has_fb_pixel') !== '0' && (
                          <span className="badge badge-neutral">FB Pixel</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CollapsibleSection>
        {/* 2 ── Web Metrics — open by default */}
        <CollapsibleSection title="Web Metrics">
          <WebMetrics row={row} onUpdateRow={onUpdateRow} />
        </CollapsibleSection>

          <CollapsibleSection title="Messaging">
          <MessagingPanel row={row} templates={templates} onUpdateRow={onUpdateRow} />
        </CollapsibleSection>
        <CollapsibleSection title="Outreach">
          <OutreachControls row={row} onUpdateRow={onUpdateRow} onDelete={onDelete} />
        </CollapsibleSection>
      </div>
    </div>
  )
}
