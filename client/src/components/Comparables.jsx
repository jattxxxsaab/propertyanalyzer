import { useState } from 'react'
import './Comparables.css'

function Comparables({ comparables }) {
  const [sortBy, setSortBy] = useState('distance') // distance, date, price-high, price-low

  const formatCurrency = (value) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const sortComparables = (comps) => {
    const sorted = [...comps]

    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999))
      case 'date':
        return sorted.sort((a, b) => {
          if (!a.soldDate) return 1
          if (!b.soldDate) return -1
          return new Date(b.soldDate) - new Date(a.soldDate)
        })
      case 'price-high':
        return sorted.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
      case 'price-low':
        return sorted.sort((a, b) => (a.soldPrice || 0) - (b.soldPrice || 0))
      default:
        return sorted
    }
  }

  if (!comparables || comparables.length === 0) {
    return (
      <div className="comparables">
        <h3>Comparable Properties</h3>
        <p className="no-data">No comparable sales data available for this property.</p>
      </div>
    )
  }

  const sortedComps = sortComparables(comparables)

  return (
    <div className="comparables">
      <div className="comparables-header">
        <h3>Comparable Properties ({comparables.length})</h3>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="distance">Closest</option>
            <option value="date">Newest Sale</option>
            <option value="price-high">Highest Price</option>
            <option value="price-low">Lowest Price</option>
          </select>
        </div>
      </div>

      <div className="comparables-list">
        {sortedComps.map((comp, index) => (
          <div key={index} className="comp-card">
            <div className="comp-header">
              <div className="comp-address">
                <h4>{comp.address}</h4>
                {(comp.city || comp.state) && (
                  <p className="comp-location">{[comp.city, comp.state].filter(Boolean).join(', ')}</p>
                )}
              </div>
              <div className="comp-price">
                {formatCurrency(comp.soldPrice)}
              </div>
            </div>

            <div className="comp-details">
              <div className="comp-detail">
                <span className="comp-detail-label">Sold</span>
                <span className="comp-detail-value">{formatDate(comp.soldDate)}</span>
              </div>

              {comp.distance !== null && comp.distance !== undefined && (
                <div className="comp-detail">
                  <span className="comp-detail-label">Distance</span>
                  <span className="comp-detail-value">{comp.distance} mi</span>
                </div>
              )}

              <div className="comp-detail">
                <span className="comp-detail-label">Beds/Baths</span>
                <span className="comp-detail-value">
                  {comp.beds || '?'} bd / {comp.baths || '?'} ba
                </span>
              </div>

              {comp.sqft && (
                <div className="comp-detail">
                  <span className="comp-detail-label">Sq Ft</span>
                  <span className="comp-detail-value">
                    {new Intl.NumberFormat('en-US').format(comp.sqft)}
                  </span>
                </div>
              )}

              {comp.pricePerSqft && (
                <div className="comp-detail highlight">
                  <span className="comp-detail-label">$/Sq Ft</span>
                  <span className="comp-detail-value">{formatCurrency(comp.pricePerSqft)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comparables
