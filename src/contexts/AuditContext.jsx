import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { fetchLighthouseMetrics } from '../utils/pagespeed'

const AuditCtx = createContext(null)

/**
 * Wraps the app and manages all in-flight PageSpeed audits globally.
 * Audits survive component unmounts — the save callback fires against
 * the original datasetId + rowIdx regardless of where the user navigates.
 */
export function AuditProvider({ showToast, children }) {
  // pendingRef is the source-of-truth read inside async closures (never stale)
  // pending state is a copy used only to trigger re-renders in consumers
  const pendingRef = useRef(new Map())
  const [pending, setPending] = useState(new Map())

  const isPending = useCallback((key) => pendingRef.current.has(key), [])

  /**
   * @param {string}   key     - Stable per-lead identifier
   * @param {object}   opts
   * @param {string}   opts.name    - Business name for toast messages
   * @param {string}   opts.url     - Website URL to audit
   * @param {function} opts.onSave  - (scores) => Promise<void> — already bound to the correct row
   */
  const startAudit = useCallback(async (key, { name, url, onSave }) => {
    if (pendingRef.current.has(key)) return   // prevent duplicate runs

    pendingRef.current.set(key, { name })
    setPending(new Map(pendingRef.current))

    try {
      const scores = await fetchLighthouseMetrics(url)
      await onSave(scores)
      showToast(`"${name}" web metrics are ready`, 'success')
    } catch (err) {
      showToast(`Audit failed for "${name}": ${err.message}`, 'error')
    } finally {
      pendingRef.current.delete(key)
      setPending(new Map(pendingRef.current))
    }
  }, [showToast])

  return (
    <AuditCtx.Provider value={{ pending, isPending, startAudit }}>
      {children}
    </AuditCtx.Provider>
  )
}

export const useAudit = () => useContext(AuditCtx)
