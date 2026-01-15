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

// Helper function to call Redfin5 RapidAPI
async function callRedfin5API(endpoint, params = {}) {
  try {
    const url = `https://${RAPIDAPI_HOST}${endpoint}`;
    console.log(`Calling Redfin5 API: ${url}`, params);

    const response = await axios.get(url, {
      params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      timeout: 15000
    });

    console.log('Redfin5 API response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Redfin5 API Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

// Search for property by address using Redfin5 API
async function searchPropertyRedfin5(address) {
  try {
    // Try the properties/search endpoint
    const searchResult = await callRedfin5API('/properties/search', {
      location: address,
      limit: 1
    });

    console.log('Search result:', JSON.stringify(searchResult).substring(0, 200));

    // Handle different response structures
    if (searchResult && searchResult.data && searchResult.data.homes) {
      return searchResult.data.homes[0];
    } else if (searchResult && searchResult.homes) {
      return searchResult.homes[0];
    } else if (Array.isArray(searchResult) && searchResult.length > 0) {
      return searchResult[0];
    }

    return null;
  } catch (error) {
    console.error('Property search failed:', error.message);
    return null;
  }
}

// Get property details using Redfin5 API
async function getPropertyDetailsRedfin5(propertyId) {
  try {
    const details = await callRedfin5API('/properties/detail', {
      propertyId: propertyId
    });
    return details;
  } catch (error) {
    console.error('Property details failed:', error.message);
    return null;
  }
}

// Get comparable sales using Redfin5 API
async function getComparableSalesRedfin5(propertyId) {
  try {
    const comps = await callRedfin5API('/properties/comps', {
      propertyId: propertyId
    });
    return comps;
  } catch (error) {
    console.error('Comparable sales failed:', error.message);
    return null;
  }
}

// Transform Redfin5 API response to our format
function transformRedfin5Data(property, propertyDetails, comps) {
  // Extract basic info from search result
  const addressLine = property?.streetLine || property?.address?.streetLine || 'Unknown Address';
  const city = property?.city || property?.address?.city || 'Unknown City';
  const state = property?.state || property?.address?.state || '';
  const zip = property?.zip || property?.address?.zip || '';
  const fullAddress = `${addressLine}, ${city}, ${state} ${zip}`.trim();

  // Extract property details
  const beds = property?.beds || propertyDetails?.beds || 3;
  const baths = property?.baths || propertyDetails?.baths || 2;
  const sqft = property?.sqft || propertyDetails?.sqft || property?.lotSize || 1750;
  const lotSize = propertyDetails?.lotSize || property?.lotSize || 5000;
  const yearBuilt = property?.yearBuilt || propertyDetails?.yearBuilt || 2000;
  const propertyType = property?.propertyType || propertyDetails?.propertyType || 'Single Family';

  // Extract features
  const features = [];
  if (propertyDetails?.stories) features.push(`${propertyDetails.stories} Story`);
  if (propertyDetails?.garage || property?.garage) features.push('Garage');
  if (propertyDetails?.pool) features.push('Pool');
  if (propertyDetails?.heating) features.push(propertyDetails.heating);
  if (propertyDetails?.cooling) features.push(propertyDetails.cooling);
  if (features.length === 0) features.push('Updated Kitchen', 'Central AC', 'Garage');

  // Extract valuation
  const price = property?.price?.value || property?.price || propertyDetails?.price || 650000;
  const estimatedValue = typeof price === 'object' ? price.value : price;

  // Build price history
  const priceHistory = [];
  if (propertyDetails?.priceHistory && Array.isArray(propertyDetails.priceHistory)) {
    propertyDetails.priceHistory.slice(0, 4).forEach(item => {
      priceHistory.push({
        date: new Date(item.date || item.time).toISOString().slice(0, 7),
        price: item.price || item.amount
      });
    });
  }

  // Generate fallback price history if none available
  if (priceHistory.length === 0) {
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
  const compsData = comps?.data?.comps || comps?.comps || [];

  compsData.slice(0, 5).forEach(comp => {
    const compAddress = comp?.streetLine || comp?.address?.streetLine || 'Nearby Property';
    const compPrice = comp?.price?.value || comp?.price || comp?.soldPrice || 0;

    comparableSales.push({
      address: compAddress,
      soldPrice: typeof compPrice === 'object' ? compPrice.value : compPrice,
      soldDate: comp?.soldDate ? new Date(comp.soldDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      beds: comp?.beds || beds,
      baths: comp?.baths || baths,
      sqft: comp?.sqft || sqft,
      distance: comp?.distance || Math.random().toFixed(1)
    });
  });

  // If no comps, generate generic ones
  if (comparableSales.length === 0) {
    comparableSales.push(
      {
        address: 'Nearby Property 1',
        soldPrice: Math.round(estimatedValue * 0.97),
        soldDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        beds,
        baths,
        sqft: Math.round(sqft * 0.95),
        distance: 0.2
      },
      {
        address: 'Nearby Property 2',
        soldPrice: Math.round(estimatedValue * 1.03),
        soldDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        beds,
        baths: baths + 0.5,
        sqft: Math.round(sqft * 1.05),
        distance: 0.4
      }
    );
  }

  // Extract market trends
  const neighborhood = city || 'Local Area';
  const medianPrice = estimatedValue;
  const priceChange1Year = 7.5; // Default value

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
    address: fullAddress,
    propertyDetails: {
      beds,
      baths,
      sqft,
      lotSize,
      yearBuilt,
      propertyType,
      features
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
    apiConfigured: !!RAPIDAPI_KEY,
    apiHost: RAPIDAPI_HOST
  });
});

// Get property data by address
app.get('/api/property', async (req, res) => {
  const address = req.query.address;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  console.log(`\n=== Fetching property data for: ${address} ===`);

  // If using real API and it's configured
  if (USE_REAL_API && RAPIDAPI_KEY) {
    try {
      console.log('Attempting to fetch from Redfin5 RapidAPI...');

      // Search for the property
      const property = await searchPropertyRedfin5(address);

      if (property) {
        console.log('Property found! Fetching additional details...');

        // Extract property ID
        const propertyId = property.propertyId || property.id || property.mlsId;

        // Get property details and comps in parallel (with fallback if no ID)
        let propertyDetails = null;
        let comps = null;

        if (propertyId) {
          [propertyDetails, comps] = await Promise.allSettled([
            getPropertyDetailsRedfin5(propertyId),
            getComparableSalesRedfin5(propertyId)
          ]).then(results => [
            results[0].status === 'fulfilled' ? results[0].value : null,
            results[1].status === 'fulfilled' ? results[1].value : null
          ]);
        }

        // Transform and return the data
        const transformedData = transformRedfin5Data(property, propertyDetails, comps);
        console.log('✓ Successfully fetched and transformed data from Redfin5 API');
        return res.json(transformedData);
      }

      console.log('Property not found in API, falling back to mock data');
    } catch (error) {
      console.error('API Error, falling back to mock data:', error.message);
    }
  } else {
    console.log('Real API disabled or not configured, using mock data');
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
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Property Analyzer API Server`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`Using Real API: ${USE_REAL_API}`);
  console.log(`API Host: ${RAPIDAPI_HOST}`);
  console.log(`API Key Configured: ${!!RAPIDAPI_KEY}`);
  console.log(`${'='.repeat(50)}\n`);

  if (!USE_REAL_API) {
    console.log('⚠️  Currently using MOCK DATA');
    console.log('   Set USE_REAL_API=true in .env to use Redfin5 API\n');
  } else if (!RAPIDAPI_KEY) {
    console.log('⚠️  Real API enabled but NO API KEY configured');
    console.log('   Add RAPIDAPI_KEY to .env file\n');
  } else {
    console.log('✓ Redfin5 API integration active\n');
  }
});
