import { useAudit } from '../contexts/AuditContext'

export function AuditIndicator() {
  const { pending } = useAudit()
  if (pending.size === 0) return null

  const names = [...pending.values()].map((v) => v.name).join(', ')
  const count = pending.size

  return (
    <div className="audit-indicator" title={`Auditing: ${names}`}>
      <span className="audit-spinner-sm" />
      Auditing {count} site{count !== 1 ? 's' : ''}…
    </div>
  )
}
