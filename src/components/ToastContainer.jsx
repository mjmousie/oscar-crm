import { Check } from 'lucide-react'

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <Check size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}
