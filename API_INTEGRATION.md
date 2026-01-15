# API Integration Guide

This document provides recommendations for integrating real property data APIs into the Property Analyzer application.

## Recommended Property Data APIs

### 1. **Attom Data Solutions** (Recommended)
- **Website**: https://www.attomdata.com/
- **Best for**: Comprehensive property data, valuations, and market trends
- **Features**:
  - Property details (beds, baths, sqft, year built)
  - Automated Valuation Models (AVM)
  - Property sales history
  - Market trends and analytics
  - Neighborhood statistics
- **Pricing**: Starting at $500/month (contact for custom pricing)
- **API Endpoint Examples**:
  ```
  GET /propertyapi/v1.0.0/property/detail
  GET /propertyapi/v1.0.0/property/valuation
  GET /propertyapi/v1.0.0/sale/snapshot
  ```

### 2. **Realty Mole**
- **Website**: https://www.realtymole.com/
- **Best for**: Budget-friendly property data for realtors
- **Features**:
  - Property details
  - Property valuations
  - Comparable sales
  - Rental estimates
- **Pricing**: Starting at $49/month (10,000 requests)
- **API Endpoint Example**:
  ```
  GET /api/v1/property
  GET /api/v1/sales
  ```

### 3. **Zillow API (ZillowGroup RapidAPI)**
- **Website**: https://rapidapi.com/apimaker/api/zillow-com1/
- **Best for**: Well-known brand recognition
- **Features**:
  - Property details
  - Zestimate valuations
  - Rental estimates
  - Market data
- **Pricing**: Freemium model, paid plans start at $10/month
- **Note**: Official Zillow API has limited public access

### 4. **HouseCanary**
- **Website**: https://www.housecanary.com/
- **Best for**: Enterprise-level analytics and predictions
- **Features**:
  - Property valuations
  - Rental estimates
  - Market trends and forecasts
  - Risk analytics
- **Pricing**: Enterprise pricing (contact sales)

### 5. **Realtor.com API (RapidAPI)**
- **Website**: https://rapidapi.com/apidojo/api/realtor/
- **Best for**: Active listings and recent sales data
- **Features**:
  - Property listings
  - Property details
  - Sale history
  - Agent information
- **Pricing**: Freemium, paid plans from $10/month

## Integration Steps

### Step 1: Choose Your API Provider
Based on your budget and requirements, select one of the recommended providers above. For most realtors, we recommend:
- **Budget-conscious**: Start with Realty Mole or RapidAPI options
- **Professional/Enterprise**: Attom Data Solutions or HouseCanary

### Step 2: Obtain API Keys
1. Sign up for an account with your chosen provider
2. Subscribe to an appropriate plan
3. Generate API keys from your dashboard

### Step 3: Configure Environment Variables
Add your API keys to the backend `.env` file:

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Add your API keys
ATTOM_API_KEY=your_api_key_here
REALTY_MOLE_API_KEY=your_api_key_here
```

### Step 4: Implement API Integration

Edit `backend/server.js` to integrate your chosen API. Here's an example for Attom Data:

```javascript
const axios = require('axios');

app.get('/api/property', async (req, res) => {
  const address = req.query.address;

  try {
    // Call Attom API for property details
    const propertyResponse = await axios.get(
      'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail',
      {
        params: { address },
        headers: {
          'apikey': process.env.ATTOM_API_KEY
        }
      }
    );

    // Call Attom API for valuation
    const valuationResponse = await axios.get(
      'https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/valuation',
      {
        params: { address },
        headers: {
          'apikey': process.env.ATTOM_API_KEY
        }
      }
    );

    // Transform and combine the data
    const propertyData = transformAttomData(propertyResponse.data, valuationResponse.data);

    res.json(propertyData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch property data' });
  }
});
```

### Step 5: Data Transformation
Each API returns data in a different format. You'll need to transform the API response to match the expected format in your frontend:

```javascript
function transformAttomData(propertyData, valuationData) {
  return {
    address: propertyData.property.address.oneLine,
    propertyDetails: {
      beds: propertyData.property.building.rooms.beds,
      baths: propertyData.property.building.rooms.bathsTotal,
      sqft: propertyData.property.building.size.livingSize,
      lotSize: propertyData.property.lot.lotSize1,
      yearBuilt: propertyData.property.summary.yearBuilt,
      propertyType: propertyData.property.summary.propType,
      features: extractFeatures(propertyData)
    },
    valuation: {
      estimatedValue: valuationData.property.avm.amount.value,
      priceHistory: transformPriceHistory(valuationData),
      confidence: valuationData.property.avm.confidence
    },
    // ... more transformations
  };
}
```

## Alternative: Mock Data for Development

The application currently uses mock data, which is perfect for:
- Development and testing
- Demos and presentations
- Prototyping before API integration

To continue using mock data while developing, no changes are needed.

## Cost Optimization Tips

1. **Cache API Responses**: Store recent property lookups to avoid duplicate API calls
2. **Rate Limiting**: Implement rate limiting to prevent excessive API usage
3. **Lazy Loading**: Only fetch detailed data when users request it
4. **Batch Requests**: If supported, batch multiple property requests together

## Example: Adding Redis Cache

```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/property', async (req, res) => {
  const address = req.query.address;
  const cacheKey = `property:${address}`;

  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Fetch from API if not cached
  const data = await fetchFromAPI(address);

  // Cache for 24 hours
  await client.setEx(cacheKey, 86400, JSON.stringify(data));

  res.json(data);
});
```

## Support and Resources

- **Attom Documentation**: https://api.developer.attomdata.com/
- **Realty Mole Docs**: https://www.realtymole.com/api
- **RapidAPI Hub**: https://rapidapi.com/category/Real%20Estate

## Next Steps

1. Review the API providers and select one that fits your budget
2. Sign up and obtain API keys
3. Follow the integration steps above
4. Test thoroughly with real addresses
5. Deploy your application

For questions or issues, consult the respective API's documentation and support channels.
