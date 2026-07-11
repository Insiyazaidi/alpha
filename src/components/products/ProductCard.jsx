import React, { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from '../ui/StarRating'
import Badge, { getStockVariant } from '../ui/Badge'

/**
 * ProductCard – grid card view for a product
 * React.memo + useCallback prevents unnecessary re-renders in large lists
 */
const ProductCard = memo(function ProductCard({ product, isAdmin, onTogglePublish, isUpdated }) {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    navigate(`/products/${product.id}`)
  }, [navigate, product.id])

  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    onTogglePublish(product.id)
  }, [onTogglePublish, product.id])

  return (
    <div
      className={`product-card ${isUpdated ? 'updated' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      id={`product-card-${product.id}`}
      aria-label={`View ${product.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <img
        className="product-card-img"
        src={product.thumbnail}
        alt={product.title}
        loading="lazy"
        onError={(e) => { e.target.src = 'https://placehold.co/300x200/141c2e/7c6ff7?text=No+Image' }}
      />

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <div className="product-card-name">{product.title}</div>

        <StarRating rating={product.rating} size={12} />

        <div className="product-card-footer">
          <div className="product-price">${product.price.toFixed(2)}</div>
          <Badge variant={getStockVariant(product.availabilityStatus)}>
            {product.availabilityStatus}
          </Badge>
        </div>

        {isAdmin && (
          <div
            style={{ marginTop: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <label className="publish-toggle" htmlFor={`toggle-${product.id}`} title="Toggle published status">
              <div className={`toggle-track ${product.published ? 'on' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <input
                id={`toggle-${product.id}`}
                type="checkbox"
                checked={product.published}
                onChange={handleToggle}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: 12, color: product.published ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {product.published ? 'Published' : 'Hidden'}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
})

export default ProductCard
