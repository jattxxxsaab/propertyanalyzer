const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuration
const USE_REAL_API = process.env.USE_REAL_API === 'true';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'redfin5.rapidapi.com';

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demonstration and fallback
const mockPropertyData = {
  '123 Main St, Los Angeles, CA 90001': {
    address: '123 Main St, Los Angeles, CA 90001',
    propertyDetails: {
      beds: 3,
      baths: 2,
      sqft: 1850,
      lotSize: 5200,
      yearBuilt: 1995,
      propertyType: 'Single Family',
      features: ['Hardwood Floors', 'Central AC', 'Garage', 'Backyard']
    },
    valuation: {
      estimatedValue: 725000,
      priceHistory: [
        { date: '2023-01', price: 695000 },
        { date: '2023-06', price: 710000 },
        { date: '2024-01', price: 720000 },
        { date: '2024-06', price: 725000 }
      ],
      confidence: 'Medium'
    },
    comparableSales: [
      {
        address: '125 Main St, Los Angeles, CA 90001',
        soldPrice: 715000,
        soldDate: '2024-01-15',
        beds: 3,
        baths: 2,
        sqft: 1820,
        distance: 0.1
      },
      {
        address: '456 Oak Ave, Los Angeles, CA 90001',
        soldPrice: 735000,
        soldDate: '2024-02-20',
        beds: 3,
        baths: 2.5,
        sqft: 1900,
        distance: 0.3
      },
      {
        address: '789 Pine St, Los Angeles, CA 90001',
        soldPrice: 710000,
        soldDate: '2023-12-10',
        beds: 3,
        baths: 2,
        sqft: 1800,
        distance: 0.5
      }
    ],
    marketTrends: {
      neighborhood: 'Downtown LA',
      medianPrice: 720000,
      priceChange1Year: 8.5,
      averageDaysOnMarket: 28,
      inventoryLevel: 'Low',
      marketTemperature: 'Hot',
      trends: [
        { month: '2023-07', medianPrice: 680000 },
        { month: '2023-10', medianPrice: 695000 },
        { month: '2024-01', medianPrice: 710000 },
        { month: '2024-04', medianPrice: 718000 },
        { month: '2024-07', medianPrice: 720000 }
      ]
    }
  }
};

// Helper function to call RapidAPI Redfin
async function callRedfinAPI(endpoint, params = {}) {
  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}${endpoint}`, {
      params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('RapidAPI Error:', error.message);
    throw error;
  }
}

// Search for property by address
async function searchProperty(address) {
  try {
    // Try the search endpoint
    const searchResult = await callRedfinAPI('/search', { query: address });

    if (searchResult && searchResult.payload && searchResult.payload.sections) {
      const results = searchResult.payload.sections.flatMap(s => s.rows || []);
      if (results.length > 0) {
        return results[0]; // Return first matching property
      }
    }
    return null;
  } catch (error) {
    console.error('Property search failed:', error.message);
    return null;
  }
}

// Get property details
async function getPropertyDetails(propertyId) {
  try {
    const details = await callRedfinAPI('/property/details', { propertyId });
    return details;
  } catch (error) {
    console.error('Property details failed:', error.message);
    return null;
  }
}

// Get comparable sales
async function getComparableSales(propertyId) {
  try {
    const comps = await callRedfinAPI('/property/comps', { propertyId });
    return comps;
  } catch (error) {
    console.error('Comparable sales failed:', error.message);
    return null;
  }
}

// Transform Redfin API response to our format
function transformRedfinData(searchResult, propertyDetails, comps) {
  const property = propertyDetails?.payload?.propertyDetails || {};
  const building = property.building || {};
  const address = property.addressInfo || {};

  // Extract property details
  const beds = building.beds || 3;
  const baths = building.baths || 2;
  const sqft = building.sqft || 1750;
  const lotSize = property.lotSize || 5000;
  const yearBuilt = building.yearBuilt || 2000;
  const propertyType = property.propertyType || 'Single Family';

  // Extract features
  const features = [];
  if (building.stories) features.push(`${building.stories} Story`);
  if (building.garage) features.push('Garage');
  if (building.cooling) features.push(building.cooling);
  if (building.heating) features.push(building.heating);
  if (building.flooring) features.push(building.flooring);

  // Extract valuation
  const estimatedValue = property.price?.value || property.redfin_estimate || 650000;

  // Build price history
  const priceHistory = [];
  if (property.priceHistory && Array.isArray(property.priceHistory)) {
    property.priceHistory.slice(0, 4).forEach(item => {
      priceHistory.push({
        date: new Date(item.date).toISOString().slice(0, 7),
        price: item.price
      });
    });
  } else {
    // Generate fallback price history
    const basePrice = estimatedValue * 0.92;
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - (i * 6));
      priceHistory.push({
        date: date.toISOString().slice(0, 7),
        price: Math.round(basePrice + (estimatedValue - basePrice) * (1 - i / 4))
      });
    }
  }

  // Transform comparable sales
  const comparableSales = [];
  if (comps && comps.payload && comps.payload.comps) {
    comps.payload.comps.slice(0, 5).forEach(comp => {
      comparableSales.push({
        address: comp.addressInfo?.formattedStreetLine || 'Nearby Property',
        soldPrice: comp.price || 0,
        soldDate: comp.soldDate ? new Date(comp.soldDate).toISOString().split('T')[0] : '2024-01-01',
        beds: comp.beds || beds,
        baths: comp.baths || baths,
        sqft: comp.sqft || sqft,
        distance: comp.distance || 0.5
      });
    });
  }

  // If no comps, generate generic ones
  if (comparableSales.length === 0) {
    comparableSales.push(
      {
        address: 'Nearby Property 1',
        soldPrice: Math.round(estimatedValue * 0.97),
        soldDate: '2024-01-15',
        beds,
        baths,
        sqft: Math.round(sqft * 0.95),
        distance: 0.2
      },
      {
        address: 'Nearby Property 2',
        soldPrice: Math.round(estimatedValue * 1.03),
        soldDate: '2024-02-20',
        beds,
        baths: baths + 0.5,
        sqft: Math.round(sqft * 1.05),
        distance: 0.4
      }
    );
  }

  // Extract market trends
  const neighborhood = address.city || 'Local Area';
  const medianPrice = estimatedValue;
  const priceChange1Year = 7.5; // Default, would come from market data API

  // Generate market trend data
  const trends = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - (i * 3));
    trends.push({
      month: date.toISOString().slice(0, 7),
      medianPrice: Math.round(medianPrice * (0.95 + (0.05 * (4 - i) / 4)))
    });
  }

  return {
    address: searchResult?.name?.value || address.formattedStreetLine || 'Unknown Address',
    propertyDetails: {
      beds,
      baths,
      sqft,
      lotSize,
      yearBuilt,
      propertyType,
      features: features.length > 0 ? features : ['Updated Kitchen', 'Central AC', 'Garage']
    },
    valuation: {
      estimatedValue,
      priceHistory,
      confidence: 'Medium'
    },
    comparableSales,
    marketTrends: {
      neighborhood,
      medianPrice,
      priceChange1Year,
      averageDaysOnMarket: 32,
      inventoryLevel: 'Moderate',
      marketTemperature: 'Warm',
      trends
    }
  };
}

// Generate generic mock data for an address
function generateGenericMockData(address) {
  return {
    address: address,
    propertyDetails: {
      beds: 3,
      baths: 2,
      sqft: 1750,
      lotSize: 5000,
      yearBuilt: 2000,
      propertyType: 'Single Family',
      features: ['Updated Kitchen', 'Central AC', 'Garage']
    },
    valuation: {
      estimatedValue: 650000,
      priceHistory: [
        { date: '2023-01', price: 600000 },
        { date: '2023-06', price: 620000 },
        { date: '2024-01', price: 640000 },
        { date: '2024-06', price: 650000 }
      ],
      confidence: 'Medium'
    },
    comparableSales: [
      {
        address: 'Nearby Property 1',
        soldPrice: 645000,
        soldDate: '2024-01-15',
        beds: 3,
        baths: 2,
        sqft: 1700,
        distance: 0.2
      },
      {
        address: 'Nearby Property 2',
        soldPrice: 660000,
        soldDate: '2024-02-20',
        beds: 3,
        baths: 2.5,
        sqft: 1800,
        distance: 0.4
      }
    ],
    marketTrends: {
      neighborhood: 'Local Area',
      medianPrice: 650000,
      priceChange1Year: 7.5,
      averageDaysOnMarket: 32,
      inventoryLevel: 'Moderate',
      marketTemperature: 'Warm',
      trends: [
        { month: '2023-07', medianPrice: 610000 },
        { month: '2023-10', medianPrice: 625000 },
        { month: '2024-01', medianPrice: 640000 },
        { month: '2024-04', medianPrice: 645000 },
        { month: '2024-07', medianPrice: 650000 }
      ]
    }
  };
}

// Routes

// API root - shows available endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'Property Analyzer API',
    version: '1.0.0',
    endpoints: {
      '/api/health': {
        method: 'GET',
        description: 'Check API health and configuration status'
      },
      '/api/property': {
        method: 'GET',
        description: 'Get property data by address',
        parameters: {
          address: 'Full property address (required)'
        },
        example: '/api/property?address=123 Main St, Seattle, WA 98101'
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Property Analyzer API is running',
    usingRealAPI: USE_REAL_API,
    apiConfigured: !!RAPIDAPI_KEY
  });
});

// Get property data by address
app.get('/api/property', async (req, res) => {
  const address = req.query.address;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  console.log(`Fetching property data for: ${address}`);

  // If using real API and it's configured
  if (USE_REAL_API && RAPIDAPI_KEY) {
    try {
      console.log('Attempting to fetch from RapidAPI Redfin...');

      // Search for the property
      const searchResult = await searchProperty(address);

      if (searchResult && searchResult.id) {
        console.log('Property found, fetching details...');

        // Get property details and comps in parallel
        const [propertyDetails, comps] = await Promise.all([
          getPropertyDetails(searchResult.id),
          getComparableSales(searchResult.id)
        ]);

        // Transform and return the data
        const transformedData = transformRedfinData(searchResult, propertyDetails, comps);
        console.log('Successfully fetched and transformed data from RapidAPI');
        return res.json(transformedData);
      }

      console.log('Property not found in API, falling back to mock data');
    } catch (error) {
      console.error('API Error, falling back to mock data:', error.message);
    }
  }

  // Fallback: Use mock data
  console.log('Using mock data');

  // Check if we have specific mock data for this address
  const propertyData = mockPropertyData[address];
  if (propertyData) {
    return res.json(propertyData);
  }

  // Return generic mock data
  const genericData = generateGenericMockData(address);
  res.json(genericData);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Real API: ${USE_REAL_API}`);
  console.log(`API Key Configured: ${!!RAPIDAPI_KEY}`);
  if (!USE_REAL_API) {
    console.log('Note: Currently using mock data. Set USE_REAL_API=true in .env to use real API');
  }
});
