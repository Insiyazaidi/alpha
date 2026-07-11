import React, { useCallback } from 'react'
import { useURLState } from '../../hooks/useURLState'

const SORT_OPTIONS = [
  { value: '',           label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating-desc',label: 'Rating: High → Low' },
  { value: 'rating-asc', label: 'Rating: Low → High' },
  { value: 'name-asc',   label: 'Name: A → Z' },
  { value: 'name-desc',  label: 'Name: Z → A' },
]

/**
 * ProductFilters – search, category multi-select, sort, and view toggle
 * useCallback on all handlers to prevent child re-renders (performance optimization)
 */
export default function ProductFilters({ categories, search, onSearchChange, selectedCategories, onCategoryToggle, sort, onSortChange, rating, onRatingChange, view, onViewChange, totalCount, filteredCount }) {
  const { setParam, setArrayParam, setMultipleParams } = useURLState()

  const handleSearch = useCallback((e) => {
    const val = e.target.value
    onSearchChange(val)
    setMultipleParams({ search: val, page: 1 })
  }, [onSearchChange, setMultipleParams])

  const handleCategoryToggle = useCallback((cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat]
    onCategoryToggle(next)
    setMultipleParams({ category: next, page: 1 })
  }, [selectedCategories, onCategoryToggle, setMultipleParams])

  const handleClearAll = useCallback(() => {
    onCategoryToggle([])
    onSearchChange('')
    onSortChange('')
    onRatingChange(0)
    setMultipleParams({ category: [], search: '', sort: '', rating: '', page: 1 })
  }, [onCategoryToggle, onSearchChange, onSortChange, onRatingChange, setMultipleParams])

  const handleSort = useCallback((e) => {
    onSortChange(e.target.value)
    setParam('sort', e.target.value)
  }, [onSortChange, setParam])

  const handleRating = useCallback((e) => {
    const val = Number(e.target.value)
    onRatingChange(val)
    setMultipleParams({ rating: val || '', page: 1 })
  }, [onRatingChange, setMultipleParams])

  const hasActiveFilters = search || selectedCategories.length > 0 || sort || rating > 0

  return (
    <div>
      {/* Main filter bar */}
      <div className="filters-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="product-search"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
            aria-label="Search products"
          />
        </div>

        {/* Sort */}
        <select
          id="product-sort"
          className="filter-select"
          value={sort}
          onChange={handleSort}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          id="product-rating"
          className="filter-select"
          value={rating}
          onChange={handleRating}
          aria-label="Filter by rating"
        >
          <option value={0}>All Ratings</option>
          <option value={4}>4 Stars & Up</option>
          <option value={3}>3 Stars & Up</option>
          <option value={2}>2 Stars & Up</option>
          <option value={1}>1 Star & Up</option>
        </select>

        {/* View toggle + clear */}
        <div className="filters-actions">
          <div className="view-toggle">
            <button
              id="view-table"
              className={`view-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => onViewChange('table')}
              title="Table view"
              aria-label="Switch to table view"
            >
              ☰
            </button>
            <button
              id="view-grid"
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => onViewChange('grid')}
              title="Grid view"
              aria-label="Switch to grid view"
            >
              ⊞
            </button>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleClearAll} id="clear-filters">
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="category-pills">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4, fontWeight: 600 }}>Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategories.includes(cat) ? 'active' : ''}`}
              onClick={() => handleCategoryToggle(cat)}
              id={`cat-${cat}`}
              aria-pressed={selectedCategories.includes(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredCount}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> products
      </p>
    </div>
  )
}
