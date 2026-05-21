import { g } from './columns'

export const SHORTCODES = [
  // ─ Business ─────────────────────────────────────
  { key: 'businessName',  label: 'Business Name',   group: 'Business',  resolve: (r) => g(r, 'name') },
  { key: 'category',      label: 'Category',        group: 'Business',  resolve: (r) => g(r, 'category') },
  { key: 'website',       label: 'Website',         group: 'Business',  resolve: (r) => g(r, 'website') },
  { key: 'phone',         label: 'Phone',           group: 'Business',  resolve: (r) => g(r, 'phone') },
  { key: 'email',         label: 'Email',           group: 'Business',  resolve: (r) => g(r, 'email') },
  { key: 'city',          label: 'City',            group: 'Business',  resolve: (r) => g(r, 'city') },
  { key: 'state',         label: 'State',           group: 'Business',  resolve: (r) => g(r, 'state') },
  { key: 'rating',        label: 'Rating',          group: 'Business',  resolve: (r) => g(r, 'rating') },
  // ─ Contact Person ───────────────────────────────
  { key: 'firstName',     label: 'First Name',      group: 'Contact',   resolve: (r) => g(r, 'first_name') },
  { key: 'lastName',      label: 'Last Name',       group: 'Contact',   resolve: (r) => g(r, 'last_name') },
  { key: 'fullName',      label: 'Full Name',       group: 'Contact',   resolve: (r) => g(r, 'full_name') || [g(r, 'first_name'), g(r, 'last_name')].filter(Boolean).join(' ') },
  { key: 'title',         label: 'Job Title',       group: 'Contact',   resolve: (r) => g(r, 'title') },
  { key: 'contactPhone',  label: 'Direct Phone',    group: 'Contact',   resolve: (r) => g(r, 'contact_phone') },
  { key: 'linkedIn',      label: 'LinkedIn URL',    group: 'Contact',   resolve: (r) => g(r, 'company_linkedin') || g(r, 'contact_linkedin') },
  // ─ Web Metrics ──────────────────────────────────
  { key: 'overallHealth', label: 'Overall Health',  group: 'Web',       resolve: (r) => r.overallHealth },
  { key: 'perfScore',     label: 'Speed Score',     group: 'Web',       resolve: (r) => r.perfScore },
  { key: 'seoScore',      label: 'SEO Score',       group: 'Web',       resolve: (r) => r.seoScore },
  { key: 'accScore',      label: 'Accessibility',   group: 'Web',       resolve: (r) => r.accScore },
  { key: 'bpScore',       label: 'Best Practices',  group: 'Web',       resolve: (r) => r.bpScore },
  // ─ Outreach ─────────────────────────────────────
  { key: 'status',        label: 'Outreach Status', group: 'Outreach',  resolve: (r) => r._status || 'New' },
  { key: 'contactMethod', label: 'Contact Method',  group: 'Outreach',  resolve: (r) => r._contactMethod || 'None' },
]

// Groups in display order
export const SHORTCODE_GROUPS = ['Business', 'Contact', 'Web', 'Outreach']

/**
 * Replaces [key] tokens in text with resolved values from row.
 * Unknown tokens are left as-is. Null/empty values render as "N/A".
 */
export function parseTemplate(text, row) {
  if (!text) return ''
  if (!row)  return text
  return text.replace(/\[(\w+)\]/g, (match, key) => {
    const sc = SHORTCODES.find((s) => s.key === key)
    if (!sc) return match
    const val = sc.resolve(row)
    return val != null && String(val).trim() !== '' ? String(val) : 'N/A'
  })
}
