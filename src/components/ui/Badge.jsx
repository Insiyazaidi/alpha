import React, { memo } from 'react'

/**
 * Badge – flexible status badge with variant-based coloring
 * React.memo: skips re-render if props unchanged
 */
const Badge = memo(function Badge({ children, variant = 'primary', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'currentColor', display: 'inline-block',
        marginRight: 4, flexShrink: 0
      }} />}
      {children}
    </span>
  )
})

export function getStockVariant(status) {
  switch (status) {
    case 'In Stock':     return 'success'
    case 'Low Stock':    return 'warning'
    case 'Out of Stock': return 'danger'
    default:             return 'muted'
  }
}

export default Badge
