import React from 'react';
import './ComparableSales.css';

const ComparableSales = ({ data }) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="card comparable-sales">
      <h3>Comparable Sales</h3>
      <p className="section-description">
        Recent sales of similar properties in the area
      </p>

      <div className="comps-list">
        {data.map((comp, index) => (
          <div key={index} className="comp-item">
            <div className="comp-header">
              <div className="comp-address">{comp.address}</div>
              <div className="comp-price">{formatCurrency(comp.soldPrice)}</div>
            </div>

            <div className="comp-details">
              <div className="comp-detail-row">
                <span className="comp-detail-label">Sold Date:</span>
                <span className="comp-detail-value">{formatDate(comp.soldDate)}</span>
              </div>

              <div className="comp-detail-row">
                <span className="comp-detail-label">Specs:</span>
                <span className="comp-detail-value">
                  {comp.beds} bed, {comp.baths} bath, {formatNumber(comp.sqft)} sq ft
                </span>
              </div>

              <div className="comp-detail-row">
                <span className="comp-detail-label">Distance:</span>
                <span className="comp-detail-value">{comp.distance} miles</span>
              </div>
            </div>

            <div className="comp-price-per-sqft">
              {formatCurrency(comp.soldPrice / comp.sqft)} per sq ft
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="no-comps">
          No comparable sales data available
        </div>
      )}
    </div>
  );
};

export default ComparableSales;
