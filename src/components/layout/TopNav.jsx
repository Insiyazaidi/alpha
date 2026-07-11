import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useProducts } from '../../contexts/ProductContext'

export default function TopNav({ collapsed, onToggleSidebar }) {
  const { currentUser, logout, isAdmin } = useAuth()
  const { isPolling, lastUpdated } = useProducts()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  return (
    <header
      className={`topnav ${collapsed ? 'sidebar-collapsed' : ''}`}
      role="banner"
      aria-label="Top navigation"
    >
      {/* Hamburger / collapse toggle */}
      <button
        className="topnav-toggle"
        onClick={onToggleSidebar}
        id="sidebar-toggle"
        aria-label="Toggle sidebar"
        aria-expanded={!collapsed}
      >
        ☰
      </button>

      {/* Search */}
      <div className="topnav-search">
        <span className="topnav-search-icon">🔍</span>
        <input
          id="topnav-search"
          type="text"
          placeholder="Quick search…"
          aria-label="Quick search"
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/products?search=${e.target.value}`)
          }}
        />
      </div>

      <div className="topnav-spacer" />

      <div className="topnav-actions">
        {/* Live polling indicator */}
        <div className="live-indicator" title={`Last updated: ${lastUpdatedStr}`}>
          <span className="live-dot" />
          <span className="live-text" style={{ fontSize: 12 }}>
            {isPolling ? 'Syncing…' : 'Live'}
          </span>
        </div>

        {/* Notifications */}
        <button className="topnav-icon-btn" aria-label="Notifications" id="topnav-notifications">
          🔔
        </button>

        {/* Settings */}
        <button className="topnav-icon-btn" aria-label="Settings" id="topnav-settings">
          ⚙️
        </button>

        {/* User Avatar + Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="topnav-avatar"
            onClick={() => setDropdownOpen((o) => !o)}
            id="topnav-avatar"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" role="menu" aria-label="User menu">
              <div style={{ padding: '6px 8px 8px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                <span className={`role-badge ${currentUser?.role}`} style={{ marginTop: 4 }}>
                  {currentUser?.role === 'admin' ? '👑' : '👤'} {currentUser?.role}
                </span>
              </div>
              <div
                className="dropdown-item"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); navigate('/products') }}
                id="dropdown-products"
              >
                📦 <span>Products</span>
              </div>
              {isAdmin && (
                <div
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}
                  id="dropdown-analytics"
                >
                  📊 <span>Analytics</span>
                </div>
              )}
              <div className="dropdown-divider" />
              <div
                className="dropdown-item danger"
                role="menuitem"
                onClick={handleLogout}
                id="dropdown-logout"
              >
                🚪 <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
