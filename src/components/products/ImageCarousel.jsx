import React, { useState, useCallback } from 'react'

/**
 * ImageCarousel – product image carousel with arrows, dots, and thumbnails
 */
export default function ImageCarousel({ images = [], title = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)))
  }, [images.length])

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])

  if (!images.length) {
    return (
      <div className="carousel" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>🖼️</span>
      </div>
    )
  }

  return (
    <div className="carousel">
      <div className="carousel-main">
        <img
          src={images[currentIndex]}
          alt={`${title} – image ${currentIndex + 1}`}
          onError={(e) => { e.target.src = 'https://placehold.co/600x450/141c2e/7c6ff7?text=No+Image' }}
        />
        {images.length > 1 && (
          <>
            <button className="carousel-btn prev" onClick={prev} aria-label="Previous image">
              ‹
            </button>
            <button className="carousel-btn next" onClick={next} aria-label="Next image">
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="carousel-thumbs">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Thumbnail ${i + 1}`}
              className={`carousel-thumb ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goTo(i)}
              onError={(e) => { e.target.src = 'https://placehold.co/64x64/141c2e/7c6ff7?text=?' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
