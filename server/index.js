const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { getPropertyData, getComparables } = require('./services/redfin');
const { validateAddress, normalizeAddress } = require('./utils/validation');
const Cache = require('./utils/cache');

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 1800000; // 30 minutes

// Initialize cache
const cache = new Cache(CACHE_TTL);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const cacheStats = cache.stats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.RAPIDAPI_KEY,
    cache: cacheStats
  });
});

// Get property data endpoint
app.get('/api/property', async (req, res) => {
  try {
    const { address } = req.query;

    // Validate input
    const validatedAddress = validateAddress(address);
    const normalizedAddress = normalizeAddress(validatedAddress);

    console.log(`Property request for: ${normalizedAddress}`);

    // Check cache first
    const cached = cache.get(normalizedAddress);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    // Fetch from API
    const propertyData = await getPropertyData(normalizedAddress);

    // Cache the result
    cache.set(normalizedAddress, propertyData);

    res.json({ ...propertyData, fromCache: false });
  } catch (error) {
    console.error('Property endpoint error:', error.message);

    if (error.message === 'Address is required' ||
        error.message === 'Address is too short' ||
        error.message === 'Address is too long' ||
        error.message === 'Invalid address format') {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({
        error: 'Property not found. Please verify the address and try again.'
      });
    }

    if (error.message === 'API_RATE_LIMIT') {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    if (error.message === 'API_FORBIDDEN') {
      return res.status(403).json({
        error: 'API access denied. Please check your API configuration.'
      });
    }

    if (error.message === 'RAPIDAPI_KEY is not configured') {
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.'
      });
    }

    res.status(500).json({
      error: 'An error occurred while fetching property data. Please try again.'
    });
  }
});

// Get comparables endpoint (can be used separately if needed)
app.get('/api/comps', async (req, res) => {
  try {
    const { address } = req.query;

    // Validate input
    const validatedAddress = validateAddress(address);
    const normalizedAddress = normalizeAddress(validatedAddress);

    console.log(`Comparables request for: ${normalizedAddress}`);

    // Check if we have full property data in cache
    const cached = cache.get(normalizedAddress);
    if (cached?.comparables) {
      return res.json({ comparables: cached.comparables, fromCache: true });
    }

    // Fetch comparables
    const comps = await getComparables(normalizedAddress);

    res.json({ comparables: comps, fromCache: false });
  } catch (error) {
    console.error('Comps endpoint error:', error.message);

    if (error.message === 'Address is required' ||
        error.message.includes('Address is')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({
        error: 'Property not found for comparables.'
      });
    }

    res.status(500).json({
      error: 'An error occurred while fetching comparables.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('Property Analyzer API Server');
  console.log('='.repeat(50));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`API Key: ${process.env.RAPIDAPI_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`Cache TTL: ${CACHE_TTL / 1000 / 60} minutes`);
  console.log('='.repeat(50) + '\n');
});
