import React, { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '../contexts/ProductContext'
import { useAuth } from '../contexts/AuthContext'
import ImageCarousel from '../components/products/ImageCarousel'
import StarRating from '../components/ui/StarRating'
import Badge, { getStockVariant } from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function ProductDetail() {
  const { id } = useParams()
  const { getProductById, loading, togglePublished } = useProducts()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  // useMemo: only recalculate when id or products list changes
  const product = useMemo(() => getProductById(id), [getProductById, id])

  if (loading) return <Spinner message="Loading product…" />

  if (!product) return (
    <div className="empty-state">
      <span className="empty-icon">🔍</span>
      <p className="empty-title">Product not found</p>
      <p className="empty-desc">The product you are looking for does not exist.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
        ← Back to Products
      </button>
    </div>
  )

  const discountedPrice = product.price * (1 - product.discountPercentage / 100)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/products">Products</Link>
          <span className="breadcrumb-sep">›</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.title}</span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          id="back-button"
          style={{ marginTop: 8 }}
        >
          ← Back
        </button>
      </div>

      <div className="product-detail-grid">
        {/* Left: Image Carousel */}
        <div>
          <ImageCarousel images={product.images} title={product.title} />

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'var(--spacing-md)' }}>
              {product.tags.map((tag) => (
                <Badge key={tag} variant="muted"># {tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div>
          <div className="detail-section">
            {/* Category + Published badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-sm)' }}>
              <Badge variant="primary">{product.category}</Badge>
              {product.published
                ? <Badge variant="success" dot>Published</Badge>
                : <Badge variant="danger" dot>Hidden</Badge>
              }
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 'var(--spacing-sm)' }}>
              {product.title}
            </h1>

            {product.brand && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                by <strong style={{ color: 'var(--text-secondary)' }}>{product.brand}</strong>
              </p>
            )}

            {/* Rating */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <StarRating rating={product.rating} size={18} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="detail-price">
              ${discountedPrice.toFixed(2)}
              {product.discountPercentage > 0 && (
                <span className="original-price">${product.price.toFixed(2)}</span>
              )}
              {product.discountPercentage > 0 && (
                <Badge variant="success" style={{ marginLeft: 8 }}>
                  -{product.discountPercentage.toFixed(0)}% OFF
                </Badge>
              )}
            </div>

            {/* Stock */}
            <Badge variant={getStockVariant(product.availabilityStatus)} dot>
              {product.availabilityStatus} · {product.stock} units
            </Badge>

            {/* Description */}
            <div className="divider" />
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {product.description}
            </p>

            {/* Meta grid */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <div className="detail-meta-label">SKU</div>
                <div className="detail-meta-value" style={{ fontSize: 13, fontFamily: 'monospace' }}>{product.sku || '—'}</div>
              </div>
              <div className="detail-meta-item">
                <div className="detail-meta-label">Weight</div>
                <div className="detail-meta-value">{product.weight ? `${product.weight} g` : '—'}</div>
              </div>
              <div className="detail-meta-item">
                <div className="detail-meta-label">Warranty</div>
                <div className="detail-meta-value" style={{ fontSize: 13 }}>{product.warrantyInformation || '—'}</div>
              </div>
              <div className="detail-meta-item">
                <div className="detail-meta-label">Shipping</div>
                <div className="detail-meta-value" style={{ fontSize: 13 }}>{product.shippingInformation || '—'}</div>
              </div>
              <div className="detail-meta-item">
                <div className="detail-meta-label">Return Policy</div>
                <div className="detail-meta-value" style={{ fontSize: 13 }}>{product.returnPolicy || '—'}</div>
              </div>
              <div className="detail-meta-item">
                <div className="detail-meta-label">Min. Order</div>
                <div className="detail-meta-value">{product.minimumOrderQuantity || 1} units</div>
              </div>
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <button
                  id="toggle-published-btn"
                  className={`btn ${product.published ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => togglePublished(product.id)}
                  style={{ width: '100%' }}
                >
                  {product.published ? ' Hide from Users' : ' Publish Product'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="reviews-list">
            {product.reviews.map((review, i) => (
              <div key={i} className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">{review.reviewerName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarRating rating={review.rating} size={12} showValue={false} />
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
