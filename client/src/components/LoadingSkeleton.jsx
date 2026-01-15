import './LoadingSkeleton.css'

function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>

      <div className="skeleton-image"></div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-heading"></div>
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="skeleton-section">
        <div className="skeleton-line skeleton-heading"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-card skeleton-card-large">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        ))}
      </div>

      <p className="loading-text">Loading property data...</p>
    </div>
  )
}

export default LoadingSkeleton
