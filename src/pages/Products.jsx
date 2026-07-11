import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../contexts/ProductContext'
import { useAuth } from '../contexts/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { useURLState } from '../hooks/useURLState'
import ProductFilters from '../components/products/ProductFilters'
import ProductTable from '../components/products/ProductTable'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/ui/Spinner'

const PAGE_SIZE = 12

export default function Products() {
  const { products, categories, loading, error, updatedIds, togglePublished } = useProducts()
  const { isAdmin } = useAuth()
  const { getParam, getArrayParam, getNumberParam, setParam, setArrayParam, setMultipleParams } = useURLState()

  // Read initial state from URL
  const [searchInput, setSearchInput] = useState(() => getParam('search', ''))
  const [selectedCategories, setSelectedCategories] = useState(() => getArrayParam('category'))
  const [sort, setSort] = useState(() => getParam('sort', ''))
  const [rating, setRating] = useState(() => getNumberParam('rating', 0))
  const [view, setView] = useState(() => getParam('view', 'table'))
  const [page, setPage] = useState(() => getNumberParam('page', 1))

  // Debounced search (300ms) – avoids filtering on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300)

  // Sync URL ↔ page when page changes
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
    setParam('page', newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setParam])

  const handleViewChange = useCallback((v) => {
    setView(v)
    setParam('view', v)
  }, [setParam])

  const handleSortChange = useCallback((s) => {
    setSort(s)
    setMultipleParams({ sort: s, page: 1 })
    setPage(1)
  }, [setMultipleParams])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedCategories, sort, rating])

  // useMemo: filter + sort product list only when dependencies change
  const filteredProducts = useMemo(() => {
    let list = isAdmin ? products : products.filter((p) => p.published)

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category))
    }

    // Rating filter
    if (rating > 0) {
      list = list.filter((p) => p.rating >= rating)
    }

    // Sort
    const sorted = [...list]
    switch (sort) {
      case 'price-asc':   sorted.sort((a, b) => a.price - b.price); break
      case 'price-desc':  sorted.sort((a, b) => b.price - a.price); break
      case 'rating-asc':  sorted.sort((a, b) => a.rating - b.rating); break
      case 'rating-desc': sorted.sort((a, b) => b.rating - a.rating); break
      case 'name-asc':    sorted.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'name-desc':   sorted.sort((a, b) => b.title.localeCompare(a.title)); break
    }
    return sorted
  }, [products, isAdmin, debouncedSearch, selectedCategories, sort, rating])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredProducts.slice(start, start + PAGE_SIZE)
  }, [filteredProducts, page])

  if (loading) return <Spinner message="Loading products…" />
  if (error) return (
    <div className="empty-state">
      <span className="empty-icon">⚠️</span>
      <p className="empty-title">Failed to load products</p>
      <p className="empty-desc">{error}</p>
    </div>
  )

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-sep">›</span>
          <span>Products</span>
        </div>
        <h1 className="page-title">
          {isAdmin ? 'Product Management' : 'Product Catalog'}
        </h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Manage, publish, and analyze your product inventory'
            : 'Browse available products'}
        </p>
      </div>

      {/* Filters */}
      <ProductFilters
        categories={categories}
        search={searchInput}
        onSearchChange={setSearchInput}
        selectedCategories={selectedCategories}
        onCategoryToggle={setSelectedCategories}
        sort={sort}
        onSortChange={handleSortChange}
        rating={rating}
        onRatingChange={setRating}
        view={view}
        onViewChange={handleViewChange}
        totalCount={isAdmin ? products.length : products.filter((p) => p.published).length}
        filteredCount={filteredProducts.length}
      />

      {/* Products */}
      {paginatedProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p className="empty-title">No products found</p>
          <p className="empty-desc">Try adjusting your search or filters</p>
        </div>
      ) : view === 'table' ? (
        <ProductTable
          products={paginatedProducts}
          isAdmin={isAdmin}
          onTogglePublish={togglePublished}
          updatedIds={updatedIds}
          sortKey={sort}
          onSortChange={handleSortChange}
        />
      ) : (
        <div className="products-grid">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              onTogglePublish={togglePublished}
              isUpdated={updatedIds.has(product.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" role="navigation" aria-label="Product pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="page-info">…</span>
              ) : (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                  id={`page-btn-${p}`}
                >
                  {p}
                </button>
              )
            )}

          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            ›
          </button>

          <span className="page-info" style={{ marginLeft: 8 }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
