import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Hardcoded credentials for demo
const USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Alex Johnson', email: 'alex@adminpulse.io' },
  user:  { username: 'user',  password: 'user123',  role: 'user',  name: 'Sam Rivera',   email: 'sam@example.com' },
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ap_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (username, password) => {
    const user = Object.values(USERS).find(
      (u) => u.username === username && u.password === password
    )
    if (!user) throw new Error('Invalid username or password')
    const { password: _, ...safeUser } = user
    setCurrentUser(safeUser)
    localStorage.setItem('ap_user', JSON.stringify(safeUser))
    return safeUser
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('ap_user')
  }

  const isAdmin = currentUser?.role === 'admin'
  const isAuthenticated = !!currentUser

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
