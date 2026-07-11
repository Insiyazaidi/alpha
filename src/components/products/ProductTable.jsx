import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from '../ui/StarRating'
import Badge, { getStockVariant } from '../ui/Badge'

/**
 * ProductTable – desktop table view with sortable columns and admin toggle
 */
export default function ProductTable({ products, isAdmin, onTogglePublish, updatedIds, sortKey, onSortChange }) {
  const navigate = useNavigate()

  const handleRowClick = useCallback((id) => {
    navigate(`/products/${id}`)
  }, [navigate])

  const SortTh = ({ field, label }) => {
    const isActive = sortKey?.startsWith(field)
    const isDesc = sortKey === `${field}-desc`
    return (
      <th
        onClick={() => onSortChange(isActive && !isDesc ? `${field}-desc` : `${field}-asc`)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        aria-sort={isActive ? (isDesc ? 'descending' : 'ascending') : 'none'}
      >
        {label}
        <span className="sort-icon">
          {isActive ? (isDesc ? ' ↓' : ' ↑') : ' ↕'}
        </span>
      </th>
    )
  }

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table aria-label="Products table">
          <thead>
            <tr>
              <th>#</th>
              <SortTh field="name" label="Product" />
              <th>Category</th>
              <SortTh field="price" label="Price" />
              <th>Stock</th>
              <SortTh field="rating" label="Rating" />
              {isAdmin && <th>Published</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={updatedIds?.has(product.id) ? 'updated' : ''}
                onClick={() => handleRowClick(product.id)}
                id={`product-row-${product.id}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRowClick(product.id)}
                aria-label={`${product.title} row`}
              >
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{product.id}</td>
                <td>
                  <div className="product-cell">
                    <img
                      className="product-thumb"
                      src={product.thumbnail}
                      alt={product.title}
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44/141c2e/7c6ff7?text=?' }}
                    />
                    <div>
                      <div className="product-name">{product.title}</div>
                      <div className="product-brand">{product.brand || '—'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge variant="primary">{product.category}</Badge>
                </td>
                <td>
                  <strong style={{ color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</strong>
                  {product.discountPercentage > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--color-success)', marginLeft: 4 }}>
                      -{product.discountPercentage.toFixed(0)}%
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Badge variant={getStockVariant(product.availabilityStatus)} dot>
                      {product.availabilityStatus}
                    </Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{product.stock} units</span>
                  </div>
                </td>
                <td>
                  <StarRating rating={product.rating} size={13} />
                </td>
                {isAdmin && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <label
                      className="publish-toggle"
                      htmlFor={`table-toggle-${product.id}`}
                      title="Toggle published status"
                    >
                      <div className={`toggle-track ${product.published ? 'on' : ''}`}>
                        <div className="toggle-thumb" />
                      </div>
                      <input
                        id={`table-toggle-${product.id}`}
                        type="checkbox"
                        checked={product.published}
                        onChange={() => onTogglePublish(product.id)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </td>
                )}
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleRowClick(product.id) }}
                    aria-label={`View ${product.title} details`}
                  >
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
