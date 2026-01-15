import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import PropertyDetails from './components/PropertyDetails';
import ComparableSales from './components/ComparableSales';
import MarketTrends from './components/MarketTrends';

function App() {
  const [address, setAddress] = useState('');
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setError('Please enter a property address');
      return;
    }

    setLoading(true);
    setError('');
    setPropertyData(null);

    try {
      const response = await axios.get(`/api/property?address=${encodeURIComponent(address)}`);
      setPropertyData(response.data);
    } catch (err) {
      setError('Failed to fetch property data. Please try again.');
      console.error('Error fetching property data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    setAddress('123 Main St, Los Angeles, CA 90001');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Property Analyzer</h1>
        <p>Get comprehensive market statistics for any property</p>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter property address (e.g., 123 Main St, City, State ZIP)"
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Property'}
          </button>
        </form>
        <button onClick={handleTryDemo} className="demo-button">
          Try Demo Address
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {propertyData && (
        <div className="results-container">
          <h2 className="results-title">Property Analysis for {propertyData.address}</h2>

          <div className="results-grid">
            <PropertyDetails data={propertyData.propertyDetails} valuation={propertyData.valuation} />
            <ComparableSales data={propertyData.comparableSales} />
            <MarketTrends data={propertyData.marketTrends} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
