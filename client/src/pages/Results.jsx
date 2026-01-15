import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PropertySummary from '../components/PropertySummary'
import Comparables from '../components/Comparables'
import MarketContext from '../components/MarketContext'
import PhotoCarousel from '../components/PhotoCarousel'
import LoadingSkeleton from '../components/LoadingSkeleton'
import './Results.css'

function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const address = searchParams.get('address')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [propertyData, setPropertyData] = useState(null)

  useEffect(() => {
    if (!address) {
      navigate('/')
      return
    }

    fetchPropertyData()
  }, [address])

  const fetchPropertyData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/property?address=${encodeURIComponent(address)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch property data')
      }

      const data = await response.json()
      setPropertyData(data)
    } catch (err) {
      console.error('Error fetching property:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="results">
        <div className="container">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Unable to Load Property</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button onClick={fetchPropertyData} className="btn btn-secondary">
                Try Again
              </button>
              <button onClick={handleNewSearch} className="btn btn-primary">
                New Search
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!propertyData) {
    return null
  }

  return (
    <div className="results">
      <div className="container">
        <div className="results-header">
          <div>
            <h2>{propertyData.address}</h2>
            {propertyData.fromCache && (
              <span className="cache-badge">Cached Result</span>
            )}
          </div>
          <button onClick={handleNewSearch} className="btn btn-secondary">
            New Search
          </button>
        </div>

        {propertyData.photos && propertyData.photos.length > 0 && (
          <PhotoCarousel photos={propertyData.photos} />
        )}

        <PropertySummary
          propertyDetails={propertyData.propertyDetails}
          pricing={propertyData.pricing}
          confidence={propertyData.confidence}
        />

        <Comparables comparables={propertyData.comparables} />

        <MarketContext
          additionalInfo={propertyData.additionalInfo}
          city={propertyData.city}
          state={propertyData.state}
        />
      </div>
    </div>
  )
}

export default Results
