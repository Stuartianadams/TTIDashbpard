interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  confirmLabel?: string
}

export default function ConfirmDialog({ message, onConfirm, onCancel, danger = false, confirmLabel = 'Confirm' }: Props) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn sm" onClick={onCancel}>Cancel</button>
          <button
            className="btn sm primary"
            onClick={onConfirm}
            style={danger ? { background: 'var(--coral)', borderColor: 'var(--coral)' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
