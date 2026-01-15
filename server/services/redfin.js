const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'redfin5.p.rapidapi.com';

/**
 * Make a request to the Redfin5 RapidAPI
 */
async function callRedfinAPI(endpoint, params = {}) {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is not configured');
  }

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}${endpoint}`, {
      params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    console.error('Redfin API Error:', error.response?.status, error.message);

    if (error.response?.status === 429) {
      throw new Error('API_RATE_LIMIT');
    } else if (error.response?.status === 403) {
      throw new Error('API_FORBIDDEN');
    } else if (error.response?.status === 404) {
      throw new Error('PROPERTY_NOT_FOUND');
    } else {
      throw new Error('API_ERROR');
    }
  }
}

/**
 * Search for a property by address
 * Tries multiple endpoint patterns to find what works with Redfin5
 */
async function searchProperty(address) {
  // Try different endpoint patterns
  const endpoints = [
    { path: '/properties/search', param: 'location' },
    { path: '/search', param: 'query' },
    { path: '/property/search', param: 'address' }
  ];

  for (const endpoint of endpoints) {
    try {
      const params = { [endpoint.param]: address, limit: 1 };
      const result = await callRedfinAPI(endpoint.path, params);

      // Handle different response structures
      if (result?.data?.homes?.[0]) return result.data.homes[0];
      if (result?.homes?.[0]) return result.homes[0];
      if (Array.isArray(result) && result[0]) return result[0];
      if (result?.property) return result.property;
    } catch (error) {
      // Continue to next endpoint pattern
      continue;
    }
  }

  throw new Error('PROPERTY_NOT_FOUND');
}

/**
 * Get property details by property ID
 */
async function getPropertyDetails(propertyId) {
  try {
    const result = await callRedfinAPI('/properties/detail', { propertyId });
    return result?.data || result;
  } catch (error) {
    return null; // Details are optional
  }
}

/**
 * Get comparable properties
 */
async function getComparables(propertyId) {
  try {
    const result = await callRedfinAPI('/properties/comps', { propertyId });
    return result?.data?.comps || result?.comps || [];
  } catch (error) {
    return []; // Comps are optional
  }
}

/**
 * Transform API response to our standard format
 */
function transformPropertyData(property, details, comps) {
  // Extract address info
  const addressLine = property?.streetLine || property?.address?.streetLine || '';
  const city = property?.city || property?.address?.city || '';
  const state = property?.state || property?.address?.state || '';
  const zip = property?.zip || property?.address?.zip || '';
  const fullAddress = `${addressLine}, ${city}, ${state} ${zip}`.trim();

  // Extract basic property info
  const beds = property?.beds || details?.beds || null;
  const baths = property?.baths || details?.baths || null;
  const sqft = property?.sqft || details?.sqft || property?.livingArea || null;
  const lotSize = property?.lotSize || details?.lotSize || null;
  const yearBuilt = property?.yearBuilt || details?.yearBuilt || null;
  const propertyType = property?.propertyType || details?.propertyType || property?.homeType || null;

  // Extract pricing
  const price = property?.price?.value || property?.price || details?.price || null;
  const estimatedValue = typeof price === 'object' ? price.value : price;
  const pricePerSqft = sqft && estimatedValue ? Math.round(estimatedValue / sqft) : null;

  // Extract last sold info
  const lastSoldDate = property?.lastSoldDate || details?.lastSoldDate || null;
  const lastSoldPrice = property?.lastSoldPrice || details?.lastSoldPrice || null;

  // Extract photos
  const photos = property?.photos || details?.photos || [];

  // Extract additional details
  const hoa = details?.hoa || null;
  const taxAmount = details?.taxAmount || details?.annualTax || null;
  const walkScore = details?.walkScore || null;
  const schoolRating = details?.schoolRating || null;

  // Transform comps
  const comparables = comps.map(comp => ({
    address: comp?.streetLine || comp?.address?.streetLine || 'Unknown',
    city: comp?.city || comp?.address?.city || '',
    state: comp?.state || comp?.address?.state || '',
    soldPrice: comp?.soldPrice || comp?.price?.value || comp?.price || null,
    soldDate: comp?.soldDate || null,
    beds: comp?.beds || null,
    baths: comp?.baths || null,
    sqft: comp?.sqft || null,
    distance: comp?.distance || null,
    pricePerSqft: comp?.sqft && comp?.soldPrice ? Math.round(comp.soldPrice / comp.sqft) : null
  }));

  return {
    address: fullAddress,
    streetLine: addressLine,
    city,
    state,
    zip,
    propertyDetails: {
      beds,
      baths,
      sqft,
      lotSize,
      yearBuilt,
      propertyType,
      pricePerSqft
    },
    pricing: {
      estimatedValue,
      lastSoldDate,
      lastSoldPrice
    },
    photos,
    additionalInfo: {
      hoa,
      taxAmount,
      walkScore,
      schoolRating
    },
    comparables,
    confidence: calculateConfidence(comparables)
  };
}

/**
 * Calculate confidence score based on number and recency of comps
 */
function calculateConfidence(comps) {
  if (comps.length === 0) return { score: 'Low', reason: 'No comparable sales data available' };

  // Score based on number of comps
  let score = 0;
  if (comps.length >= 5) score += 50;
  else if (comps.length >= 3) score += 30;
  else score += 10;

  // Score based on recency (sales within last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentComps = comps.filter(comp => {
    if (!comp.soldDate) return false;
    const soldDate = new Date(comp.soldDate);
    return soldDate >= sixMonthsAgo;
  });

  if (recentComps.length >= 3) score += 50;
  else if (recentComps.length >= 1) score += 25;

  let level, reason;
  if (score >= 75) {
    level = 'High';
    reason = `${comps.length} comparable sales, ${recentComps.length} within last 6 months`;
  } else if (score >= 40) {
    level = 'Medium';
    reason = `${comps.length} comparable sales, ${recentComps.length} recent`;
  } else {
    level = 'Low';
    reason = `Limited data: ${comps.length} comparable sales`;
  }

  return { score: level, reason };
}

/**
 * Main function to get complete property data
 */
async function getPropertyData(address) {
  const property = await searchProperty(address);

  const propertyId = property?.propertyId || property?.id || property?.mlsId;

  let details = null;
  let comps = [];

  if (propertyId) {
    [details, comps] = await Promise.allSettled([
      getPropertyDetails(propertyId),
      getComparables(propertyId)
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : null,
      results[1].status === 'fulfilled' ? results[1].value : []
    ]);
  }

  return transformPropertyData(property, details, comps);
}

module.exports = {
  getPropertyData,
  getComparables: async (address) => {
    const property = await searchProperty(address);
    const propertyId = property?.propertyId || property?.id || property?.mlsId;
    if (!propertyId) return [];
    return await getComparables(propertyId);
  }
};
