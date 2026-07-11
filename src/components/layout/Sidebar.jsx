import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Analytics',    adminOnly: true  },
  { to: '/products',   label: 'Products',     adminOnly: false },
]

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Sidebar navigation"
        id="sidebar"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">AdminPulse</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-section-label">Main</span>

          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <span className="nav-section-label">Admin</span>
              <div className="nav-item" style={{ cursor: 'default', opacity: 0.5 }}>
                
                <span className="nav-label">Access Control</span>
              </div>
            </>
          )}

          <span className="nav-section-label">Account</span>
          <button
            className="nav-item"
            onClick={handleLogout}
            id="nav-logout"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
          >
           
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        {/* User Profile at bottom */}
        <div className="sidebar-profile">
          <div className="profile-avatar">{initials}</div>
          <div className="sidebar-profile-info">
            <div className="profile-name">{currentUser?.name}</div>
            <div className="profile-role">
              <span className={`role-badge ${currentUser?.role}`}>
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
