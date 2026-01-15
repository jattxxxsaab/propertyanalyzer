# RapidAPI Redfin Setup Guide

This guide will help you configure and test your RapidAPI Redfin integration.

## Configuration Status

Your API key has been configured in `/backend/.env`:
```
RAPIDAPI_KEY=47dd0078d1mshd091c749d88ee62p1b59c6jsn9c89001ead32
RAPIDAPI_HOST=redfin5.rapidapi.com
USE_REAL_API=true
```

## Important: Verify Your RapidAPI Endpoint

RapidAPI has several Redfin-related APIs. You need to verify which one you're subscribed to:

### Common RapidAPI Redfin Services:

1. **Redfin5 API** (Currently Configured)
   - Host: `redfin5.rapidapi.com`
   - Endpoints: `/search`, `/property/details`, `/property/comps`

2. **Redfin API (by API Dojo)**
   - Host: `redfin-com-data.p.rapidapi.com`
   - Endpoints: `/search`, `/property/details`, `/property/comps`

3. **US Real Estate API**
   - Host: `us-real-estate.p.rapidapi.com`
   - Different endpoint structure

4. **Zillow/Redfin Combined APIs**
   - Various hosts and endpoint patterns

## How to Find Your API Details

1. **Log into RapidAPI**: https://rapidapi.com/
2. **Go to "My Apps"** or your subscription page
3. **Find your Redfin API subscription**
4. **Check the API documentation** for:
   - The correct `X-RapidAPI-Host` value
   - Available endpoints (paths)
   - Request parameters
   - Response format

## Update Configuration

Your API is currently configured to use `redfin5.rapidapi.com`. If you need to change to a different API host, update your `.env` file:

```bash
# Edit backend/.env
RAPIDAPI_HOST=your-actual-api-host.p.rapidapi.com
```

## Testing Your API

### 1. Test the Health Endpoint

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Property Analyzer API is running",
  "usingRealAPI": true,
  "apiConfigured": true
}
```

### 2. Test Property Search

Start your backend:
```bash
cd backend
npm run dev
```

In another terminal, test with a real address:
```bash
curl "http://localhost:5001/api/property?address=1600%20Amphitheatre%20Parkway%2C%20Mountain%20View%2C%20CA"
```

### 3. Check Server Logs

Watch the server logs to see if the API is being called:
```bash
# You should see output like:
Fetching property data for: 1600 Amphitheatre Parkway, Mountain View, CA
Attempting to fetch from RapidAPI Redfin...
Property found, fetching details...
Successfully fetched and transformed data from RapidAPI
```

If you see errors like:
- `Request failed with status code 426` - Wrong API host
- `Request failed with status code 401` - API key issue
- `Request failed with status code 429` - Rate limit exceeded

## Troubleshooting

### Error 426 (Upgrade Required)

This means the API endpoint structure is different. You need to:

1. Check your RapidAPI dashboard for the correct endpoints
2. Update `backend/server.js` if the endpoint paths are different

For example, if your API uses `/property` instead of `/search`, you'd need to modify the `searchProperty` function in `server.js`.

### Error 401 (Unauthorized)

Check that:
1. Your API key is correct in `.env`
2. You're subscribed to the API on RapidAPI
3. Your subscription is active and not expired

### Error 429 (Rate Limit)

You've exceeded your API quota. Either:
1. Wait for the rate limit to reset
2. Upgrade your RapidAPI plan
3. Set `USE_REAL_API=false` to use mock data temporarily

### Property Not Found

If the API works but doesn't find properties:
1. Try a well-known address (like a famous landmark)
2. Make sure you're using the full address with city, state, zip
3. Check that the API you're subscribed to has data for that area

## Switching Between Mock and Real Data

You can easily switch between mock data and real API data:

**Use Mock Data:**
```bash
# Edit backend/.env
USE_REAL_API=false
```

**Use Real API:**
```bash
# Edit backend/.env
USE_REAL_API=true
```

Restart the backend server after changing this setting.

## API Cost Management

To avoid unexpected costs:

1. **Monitor Your Usage** on the RapidAPI dashboard
2. **Set Usage Alerts** in RapidAPI settings
3. **Use Mock Data** during development by setting `USE_REAL_API=false`
4. **Cache Results** (future enhancement) to reduce API calls

## Need Help?

### Getting the Correct API Configuration

If you're still having issues, please provide:

1. The name of the API you're subscribed to on RapidAPI
2. The API host from your RapidAPI dashboard
3. Any error messages from the server logs

### Alternative: Use Different Property Data API

If the Redfin API isn't working, you can switch to alternatives:
- Attom Data Solutions
- Zillow API
- Realty Mole
- Estated

See `API_INTEGRATION.md` for details on other providers.

## Next Steps

Once your API is working:

1. **Test with multiple addresses** to verify data quality
2. **Add caching** to reduce API calls and costs
3. **Customize data transformation** if needed in `server.js`
4. **Deploy your application** (see README.md for deployment options)

## Current Implementation Details

The backend server (`server.js`) includes:

- ✅ RapidAPI integration with proper headers
- ✅ Search, property details, and comps endpoints
- ✅ Data transformation to match frontend format
- ✅ Automatic fallback to mock data on error
- ✅ Configurable via environment variables
- ✅ Error handling and logging

Your integration is ready to use once you verify the correct API host and endpoints!
