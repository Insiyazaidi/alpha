import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProductProvider } from './contexts/ProductContext'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'

// Lazy loading – performance optimization: code-split each page
const Login        = lazy(() => import('./pages/Login'))
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Products     = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))

/**
 * ProtectedRoute – redirects unauthenticated users to login.
 * If adminOnly, redirects non-admin users to /products.
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/products" replace />
  return children
}

/**
 * AuthRoute – redirects authenticated users away from login page
 */
function AuthRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (isAuthenticated) return <Navigate to={isAdmin ? '/dashboard' : '/products'} replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner message="Loading page…" />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* Protected – both roles */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected – admin only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <AppRoutes />
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
