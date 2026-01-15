import './MarketContext.css'

function MarketContext({ additionalInfo, city, state }) {
  const formatCurrency = (value) => {
    if (!value) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const hasData = additionalInfo && Object.values(additionalInfo).some(val => val !== null && val !== undefined)

  return (
    <div className="market-context">
      <h3>Additional Information</h3>

      {!hasData && (
        <p className="no-data">Additional market data not available for this property.</p>
      )}

      {hasData && (
        <div className="context-grid">
          {city && state && (
            <div className="context-item">
              <span className="context-label">Location</span>
              <span className="context-value">{city}, {state}</span>
            </div>
          )}

          {additionalInfo.hoa !== null && additionalInfo.hoa !== undefined && (
            <div className="context-item">
              <span className="context-label">HOA Fees</span>
              <span className="context-value">
                {additionalInfo.hoa === 0 ? 'None' : formatCurrency(additionalInfo.hoa) + '/month'}
              </span>
            </div>
          )}

          {additionalInfo.taxAmount && (
            <div className="context-item">
              <span className="context-label">Annual Property Tax</span>
              <span className="context-value">{formatCurrency(additionalInfo.taxAmount)}</span>
            </div>
          )}

          {additionalInfo.walkScore && (
            <div className="context-item">
              <span className="context-label">Walk Score</span>
              <span className="context-value">
                {additionalInfo.walkScore}/100
                <span className="score-indicator" style={{
                  background: additionalInfo.walkScore >= 70 ? '#22c55e' :
                             additionalInfo.walkScore >= 50 ? '#eab308' : '#ef4444'
                }}></span>
              </span>
            </div>
          )}

          {additionalInfo.schoolRating && (
            <div className="context-item">
              <span className="context-label">School Rating</span>
              <span className="context-value">
                {additionalInfo.schoolRating}/10
                <span className="score-indicator" style={{
                  background: additionalInfo.schoolRating >= 7 ? '#22c55e' :
                             additionalInfo.schoolRating >= 5 ? '#eab308' : '#ef4444'
                }}></span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="context-disclaimer">
        <p><strong>Note:</strong> Additional data such as flood risk, fire risk, school ratings, and neighborhood scores may not be available through all API providers. When available, this information will be displayed here.</p>
      </div>
    </div>
  )
}

export default MarketContext
