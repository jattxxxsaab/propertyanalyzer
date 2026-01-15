const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demonstration
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

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Property Analyzer API is running' });
});

// Get property data by address
app.get('/api/property', (req, res) => {
  const address = req.query.address;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  // Check if we have mock data for this address
  const propertyData = mockPropertyData[address];

  if (propertyData) {
    return res.json(propertyData);
  }

  // Return generic mock data for any other address
  const genericData = {
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

  res.json(genericData);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
