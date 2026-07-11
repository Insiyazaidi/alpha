import React, { memo } from 'react'

/**
 * StarRating – renders 5 stars filled based on rating value.
 * React.memo prevents re-renders when rating hasn't changed.
 */
const StarRating = memo(function StarRating({ rating, showValue = true, size = 14 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} className="star filled" style={{ fontSize: size }}>★</span>)
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} className="star half" style={{ fontSize: size }}>★</span>)
    } else {
      stars.push(<span key={i} className="star" style={{ fontSize: size }}>☆</span>)
    }
  }

  return (
    <span className="star-rating">
      {stars}
      {showValue && (
        <span className="rating-value">{Number(rating).toFixed(1)}</span>
      )}
    </span>
  )
})

export default StarRating
