import './PropertySummary.css'

function PropertySummary({ propertyDetails, pricing, confidence }) {
  const formatCurrency = (value) => {
    if (!value) return 'Not available'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value) => {
    if (!value) return 'Not available'
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="property-summary">
      <div className="summary-header">
        <div className="estimated-value">
          <span className="value-label">Estimated Value</span>
          <span className="value-amount">{formatCurrency(pricing?.estimatedValue)}</span>
          {confidence && (
            <div className={`confidence-badge confidence-${confidence.score.toLowerCase()}`}>
              <span className="confidence-label">Confidence: {confidence.score}</span>
              <span className="confidence-reason">{confidence.reason}</span>
            </div>
          )}
        </div>

        {pricing?.lastSoldDate && (
          <div className="last-sold">
            <span className="sold-label">Last Sold</span>
            <span className="sold-date">{formatDate(pricing.lastSoldDate)}</span>
            {pricing.lastSoldPrice && (
              <span className="sold-price">{formatCurrency(pricing.lastSoldPrice)}</span>
            )}
          </div>
        )}
      </div>

      <div className="property-details-grid">
        <div className="detail-item">
          <span className="detail-icon">🛏️</span>
          <div className="detail-content">
            <span className="detail-label">Bedrooms</span>
            <span className="detail-value">{propertyDetails?.beds || 'Not available'}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🚿</span>
          <div className="detail-content">
            <span className="detail-label">Bathrooms</span>
            <span className="detail-value">{propertyDetails?.baths || 'Not available'}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📏</span>
          <div className="detail-content">
            <span className="detail-label">Square Feet</span>
            <span className="detail-value">{formatNumber(propertyDetails?.sqft)}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🏞️</span>
          <div className="detail-content">
            <span className="detail-label">Lot Size</span>
            <span className="detail-value">
              {propertyDetails?.lotSize ? `${formatNumber(propertyDetails.lotSize)} sq ft` : 'Not available'}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Year Built</span>
            <span className="detail-value">{propertyDetails?.yearBuilt || 'Not available'}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🏠</span>
          <div className="detail-content">
            <span className="detail-label">Property Type</span>
            <span className="detail-value">{propertyDetails?.propertyType || 'Not available'}</span>
          </div>
        </div>

        {propertyDetails?.pricePerSqft && (
          <div className="detail-item">
            <span className="detail-icon">💰</span>
            <div className="detail-content">
              <span className="detail-label">Price per Sq Ft</span>
              <span className="detail-value">{formatCurrency(propertyDetails.pricePerSqft)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertySummary
