import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  })
  const [searchHistory, setSearchHistory] = useState([])

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    setSearchHistory(history)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Build address string
    const addressParts = [
      formData.street,
      formData.city,
      formData.state,
      formData.zip
    ].filter(part => part.trim())

    const address = addressParts.join(', ')

    if (!address) {
      alert('Please enter at least a street address')
      return
    }

    // Save to search history
    saveToHistory(address)

    // Navigate to results page
    navigate(`/property?address=${encodeURIComponent(address)}`)
  }

  const saveToHistory = (address) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')

    // Remove duplicate if exists
    const filtered = history.filter(item => item.address !== address)

    // Add to beginning
    const updated = [
      {
        address,
        timestamp: new Date().toISOString()
      },
      ...filtered
    ].slice(0, 10) // Keep only last 10

    localStorage.setItem('searchHistory', JSON.stringify(updated))
    setSearchHistory(updated)
  }

  const handleHistoryClick = (address) => {
    navigate(`/property?address=${encodeURIComponent(address)}`)
  }

  const clearHistory = () => {
    localStorage.removeItem('searchHistory')
    setSearchHistory([])
  }

  return (
    <div className="home">
      <div className="container">
        <div className="hero">
          <h2>Comprehensive Property Analysis</h2>
          <p>Get detailed insights on any property including estimated value, comparable sales, and market trends.</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSubmit} className="search-form">
            <h3>Search for a Property</h3>

            <div className="form-group">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="e.g., 123 Main St"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco"
                />
              </div>

              <div className="form-group form-group-small">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  maxLength="2"
                />
              </div>

              <div className="form-group form-group-small">
                <label htmlFor="zip">ZIP Code</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="94102"
                  maxLength="10"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Analyze Property
            </button>
          </form>

          {searchHistory.length > 0 && (
            <div className="search-history">
              <div className="history-header">
                <h3>Recent Searches</h3>
                <button onClick={clearHistory} className="btn-link">
                  Clear History
                </button>
              </div>
              <ul className="history-list">
                {searchHistory.map((item, index) => (
                  <li key={index} onClick={() => handleHistoryClick(item.address)}>
                    <span className="history-address">{item.address}</span>
                    <span className="history-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
