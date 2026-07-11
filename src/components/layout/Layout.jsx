import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((o) => !o)
    } else {
      setCollapsed((c) => !c)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-content ${collapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        <TopNav
          collapsed={collapsed && !isMobile}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="page-content" id="main-content" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}
