import React, { memo } from 'react'

/**
 * StatsCard – analytics metric card with icon, value, label, trend
 * React.memo prevents re-render unless value/label/icon changes
 */
const StatsCard = memo(function StatsCard({ icon, value, label, trend, trendLabel, glowColor, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-card-glow" style={{ background: glowColor || 'var(--color-primary)' }} />
      <div className="stat-card-icon" style={{ background: iconBg || 'rgba(124,111,247,0.15)' }}>
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div className={`stat-card-trend ${trend >= 0 ? 'up' : 'neutral'}`}>
          {trend >= 0 ? '↑' : '↓'} {trendLabel}
        </div>
      )}
    </div>
  )
})

export default StatsCard
