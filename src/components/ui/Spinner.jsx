import React from 'react'

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap" role="status" aria-label={message}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        {message && (
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>{message}</p>
        )}
      </div>
    </div>
  )
}
