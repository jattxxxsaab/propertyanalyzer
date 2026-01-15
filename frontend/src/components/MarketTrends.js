import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './MarketTrends.css';

const MarketTrends = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMarketColor = (temperature) => {
    switch (temperature) {
      case 'Hot':
        return '#ff4444';
      case 'Warm':
        return '#ff9944';
      case 'Cool':
        return '#4488ff';
      case 'Cold':
        return '#44aaff';
      default:
        return '#667eea';
    }
  };

  const getInventoryColor = (level) => {
    switch (level) {
      case 'Low':
        return '#ff4444';
      case 'Moderate':
        return '#ff9944';
      case 'High':
        return '#44ff44';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="card market-trends full-width">
      <h3>Market Trends</h3>

      <div className="trends-overview">
        <div className="trend-stat">
          <div className="trend-label">Neighborhood</div>
          <div className="trend-value">{data.neighborhood}</div>
        </div>

        <div className="trend-stat">
          <div className="trend-label">Median Price</div>
          <div className="trend-value">{formatCurrency(data.medianPrice)}</div>
        </div>

        <div className="trend-stat">
          <div className="trend-label">1-Year Change</div>
          <div className="trend-value trend-positive">
            +{data.priceChange1Year}%
          </div>
        </div>

        <div className="trend-stat">
          <div className="trend-label">Avg Days on Market</div>
          <div className="trend-value">{data.averageDaysOnMarket} days</div>
        </div>

        <div className="trend-stat">
          <div className="trend-label">Inventory Level</div>
          <div className="trend-value" style={{ color: getInventoryColor(data.inventoryLevel) }}>
            {data.inventoryLevel}
          </div>
        </div>

        <div className="trend-stat">
          <div className="trend-label">Market Temperature</div>
          <div className="trend-value" style={{ color: getMarketColor(data.marketTemperature) }}>
            {data.marketTemperature}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h4>Price Trend (Last 12 Months)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelStyle={{ color: '#333' }}
            />
            <Line
              type="monotone"
              dataKey="medianPrice"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="market-insights">
        <h4>Market Insights</h4>
        <ul>
          {data.marketTemperature === 'Hot' && (
            <>
              <li>This is a competitive seller's market with high demand</li>
              <li>Properties are selling quickly at or above asking price</li>
              <li>Consider pricing competitively to attract multiple offers</li>
            </>
          )}
          {data.marketTemperature === 'Warm' && (
            <>
              <li>The market is balanced with steady buyer interest</li>
              <li>Well-priced properties are selling within average timeframe</li>
              <li>Focus on proper staging and marketing to stand out</li>
            </>
          )}
          {data.inventoryLevel === 'Low' && (
            <li>Low inventory gives sellers an advantage in negotiations</li>
          )}
          {data.priceChange1Year > 5 && (
            <li>Strong price appreciation indicates a healthy market</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MarketTrends;
