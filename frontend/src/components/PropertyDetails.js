import React from 'react';
import './PropertyDetails.css';

const PropertyDetails = ({ data, valuation }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="card property-details">
      <h3>Property Details & Valuation</h3>

      <div className="valuation-highlight">
        <div className="valuation-label">Estimated Market Value</div>
        <div className="valuation-amount">{formatCurrency(valuation.estimatedValue)}</div>
        <div className="valuation-confidence">Confidence: {valuation.confidence}</div>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-icon">🛏️</span>
          <div>
            <div className="detail-label">Bedrooms</div>
            <div className="detail-value">{data.beds}</div>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🚿</span>
          <div>
            <div className="detail-label">Bathrooms</div>
            <div className="detail-value">{data.baths}</div>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📏</span>
          <div>
            <div className="detail-label">Square Feet</div>
            <div className="detail-value">{formatNumber(data.sqft)}</div>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🏞️</span>
          <div>
            <div className="detail-label">Lot Size</div>
            <div className="detail-value">{formatNumber(data.lotSize)} sq ft</div>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <div>
            <div className="detail-label">Year Built</div>
            <div className="detail-value">{data.yearBuilt}</div>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🏠</span>
          <div>
            <div className="detail-label">Property Type</div>
            <div className="detail-value">{data.propertyType}</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h4>Features</h4>
        <div className="features-list">
          {data.features.map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className="price-history">
        <h4>Price History</h4>
        {valuation.priceHistory.map((item, index) => (
          <div key={index} className="price-history-item">
            <span className="price-date">{item.date}</span>
            <span className="price-amount">{formatCurrency(item.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyDetails;
