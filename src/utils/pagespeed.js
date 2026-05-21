// Set VITE_PSI_KEY in a .env.local file at the project root.
// e.g.  VITE_PSI_KEY=AIza...
const API_KEY = import.meta.env.VITE_PSI_KEY || ''
const BASE    = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

function normalizeUrl(url) {
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function calcOverallHealth({ perf, bp, seo, acc }) {
  return Math.round(perf * 0.5 + bp * 0.2 + seo * 0.15 + acc * 0.15)
}

export async function fetchLighthouseMetrics(rawUrl) {
  const url = normalizeUrl(rawUrl)
  if (!url) throw new Error('No URL provided')
  if (!API_KEY) throw new Error('No API key — add VITE_PSI_KEY to .env.local')

  const params = new URLSearchParams({ url, strategy: 'MOBILE', key: API_KEY })
  ;['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES'].forEach((c) =>
    params.append('category', c)
  )

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const cats = data.lighthouseResult?.categories
  if (!cats) throw new Error('Unexpected API response shape')

  const round = (v) => Math.round((v ?? 0) * 100)
  const perf = round(cats.performance?.score)
  const seo  = round(cats.seo?.score)
  const acc  = round(cats.accessibility?.score)
  const bp   = round(cats['best-practices']?.score)

  return {
    perfScore:     perf,
    seoScore:      seo,
    accScore:      acc,
    bpScore:       bp,
    overallHealth: calcOverallHealth({ perf, bp, seo, acc }),
  }
}
