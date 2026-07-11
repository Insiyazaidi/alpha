import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const ProductContext = createContext(null)

const POLL_INTERVAL = 30000 // 30 seconds

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  // published state: map of productId -> boolean (admin-controlled)
  const [publishedMap, setPublishedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('ap_published')
      return stored ? JSON.parse(stored) : {}
    } catch { return {} }
  })
  // Track which product IDs were recently updated by polling
  const [updatedIds, setUpdatedIds] = useState(new Set())
  const pollTimerRef = useRef(null)

  const fetchProducts = useCallback(async (isBackground = false) => {
    try {
      if (isBackground) setIsPolling(true)
      else setLoading(true)

      const res = await fetch('https://dummyjson.com/products?limit=0')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()

      setAllProducts((prev) => {
        // Detect changed products for animation
        if (prev.length > 0) {
          const prevMap = Object.fromEntries(prev.map((p) => [p.id, p]))
          const changed = data.products.filter((p) => {
            const old = prevMap[p.id]
            return old && old.stock !== p.stock
          })
          if (changed.length > 0) {
            setUpdatedIds(new Set(changed.map((p) => p.id)))
            setTimeout(() => setUpdatedIds(new Set()), 2000)
          }
        }
        return data.products
      })

      setCategories([...new Set(data.products.map((p) => p.category))].sort())
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsPolling(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProducts(false)
  }, [fetchProducts])

  // Polling every 30s
  useEffect(() => {
    pollTimerRef.current = setInterval(() => fetchProducts(true), POLL_INTERVAL)
    return () => clearInterval(pollTimerRef.current)
  }, [fetchProducts])

  // Sync published map to localStorage
  useEffect(() => {
    localStorage.setItem('ap_published', JSON.stringify(publishedMap))
  }, [publishedMap])

  // Derived: products with published status (defaulting to true if not set)
  useEffect(() => {
    if (allProducts.length === 0) return
    const withPublished = allProducts.map((p) => ({
      ...p,
      published: publishedMap[p.id] !== undefined ? publishedMap[p.id] : true,
    }))
    setProducts(withPublished)
  }, [allProducts, publishedMap])

  const togglePublished = useCallback((productId) => {
    setPublishedMap((prev) => ({
      ...prev,
      [productId]: prev[productId] !== undefined ? !prev[productId] : false,
    }))
  }, [])

  const getProductById = useCallback(
    (id) => products.find((p) => p.id === Number(id)),
    [products]
  )

  return (
    <ProductContext.Provider value={{
      products,
      allProducts,
      categories,
      loading,
      error,
      lastUpdated,
      isPolling,
      updatedIds,
      togglePublished,
      getProductById,
      refetch: () => fetchProducts(false),
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within ProductProvider')
  return ctx
}
