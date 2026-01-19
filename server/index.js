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

// In-memory storage for repair orders (use database in production)
let repairOrders = [];

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

// ============================================
// REPAIR ORDER ENDPOINTS
// ============================================

// Get all repair orders
app.get('/api/repair-orders', (req, res) => {
  try {
    // Return all orders sorted by creation date (newest first)
    const sortedOrders = [...repairOrders].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({
      success: true,
      count: sortedOrders.length,
      data: sortedOrders
    });
  } catch (error) {
    console.error('Get repair orders error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve repair orders'
    });
  }
});

// Get a single repair order by ID
app.get('/api/repair-orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = repairOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Repair order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get repair order error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve repair order'
    });
  }
});

// Create a new repair order
app.post('/api/repair-orders', (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.assetNumber) {
      return res.status(400).json({
        success: false,
        error: 'Asset number is required'
      });
    }
    if (!orderData.orderNumber) {
      return res.status(400).json({
        success: false,
        error: 'Order number is required'
      });
    }
    if (!orderData.repairType) {
      return res.status(400).json({
        success: false,
        error: 'Repair type is required'
      });
    }
    if (!orderData.description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }
    if (!orderData.serviceProvider) {
      return res.status(400).json({
        success: false,
        error: 'Service provider is required'
      });
    }

    // Check for duplicate order number
    const existingOrder = repairOrders.find(o => o.orderNumber === orderData.orderNumber);
    if (existingOrder) {
      return res.status(409).json({
        success: false,
        error: 'Order number already exists'
      });
    }

    // Create new repair order with generated ID
    const newOrder = {
      id: `RO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    repairOrders.push(newOrder);

    console.log(`Created repair order: ${newOrder.orderNumber} (${newOrder.id})`);

    res.status(201).json({
      success: true,
      message: 'Repair order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create repair order error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create repair order'
    });
  }
});

// Update a repair order
app.put('/api/repair-orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const orderIndex = repairOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Repair order not found'
      });
    }

    // Update the order
    repairOrders[orderIndex] = {
      ...repairOrders[orderIndex],
      ...updates,
      id, // Preserve the original ID
      createdAt: repairOrders[orderIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    console.log(`Updated repair order: ${id}`);

    res.json({
      success: true,
      message: 'Repair order updated successfully',
      data: repairOrders[orderIndex]
    });
  } catch (error) {
    console.error('Update repair order error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update repair order'
    });
  }
});

// Delete a repair order
app.delete('/api/repair-orders/:id', (req, res) => {
  try {
    const { id } = req.params;

    const orderIndex = repairOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Repair order not found'
      });
    }

    const deletedOrder = repairOrders.splice(orderIndex, 1)[0];

    console.log(`Deleted repair order: ${id}`);

    res.json({
      success: true,
      message: 'Repair order deleted successfully',
      data: deletedOrder
    });
  } catch (error) {
    console.error('Delete repair order error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete repair order'
    });
  }
});

// Get repair order statistics
app.get('/api/repair-orders-stats', (req, res) => {
  try {
    const stats = {
      total: repairOrders.length,
      byStatus: {},
      byPriority: {},
      totalCost: 0
    };

    repairOrders.forEach(order => {
      // Count by status
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;

      // Count by priority
      stats.byPriority[order.priority] = (stats.byPriority[order.priority] || 0) + 1;

      // Sum total cost
      if (order.totalCost) {
        stats.totalCost += parseFloat(order.totalCost);
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get repair order stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// ============================================
// END REPAIR ORDER ENDPOINTS
// ============================================

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
