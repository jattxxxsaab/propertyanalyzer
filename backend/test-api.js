/**
 * Redfin5 API Endpoint Tester
 *
 * This script tests various Redfin5 API endpoints to determine which ones
 * are available in your subscription.
 *
 * Usage: node test-api.js
 */

require('dotenv').config();
const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'redfin5.rapidapi.com';

// Test address
const TEST_ADDRESS = '1600 Pennsylvania Ave NW, Washington, DC 20500';

console.log('\n' + '='.repeat(60));
console.log('Redfin5 API Endpoint Tester');
console.log('='.repeat(60));
console.log(`API Host: ${RAPIDAPI_HOST}`);
console.log(`API Key: ${RAPIDAPI_KEY ? RAPIDAPI_KEY.substring(0, 15) + '...' : 'NOT SET'}`);
console.log(`Test Address: ${TEST_ADDRESS}`);
console.log('='.repeat(60) + '\n');

if (!RAPIDAPI_KEY) {
  console.error('❌ ERROR: RAPIDAPI_KEY not found in .env file');
  process.exit(1);
}

// Test an endpoint
async function testEndpoint(name, endpoint, params = {}) {
  console.log(`\nTesting: ${name}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Params:`, params);

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}${endpoint}`, {
      params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      timeout: 10000
    });

    console.log(`✓ SUCCESS (Status: ${response.status})`);
    console.log('Response preview:', JSON.stringify(response.data).substring(0, 200) + '...');
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      console.log(`✗ FAILED (Status: ${error.response.status})`);
      console.log(`Error: ${error.response.data?.message || error.message}`);
    } else {
      console.log(`✗ FAILED: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  const results = {};

  // Common endpoint variations to test
  const tests = [
    // Search endpoints
    { name: 'Property Search (v1)', endpoint: '/properties/search', params: { location: TEST_ADDRESS, limit: 1 } },
    { name: 'Property Search (v2)', endpoint: '/search', params: { query: TEST_ADDRESS } },
    { name: 'Property Search (v3)', endpoint: '/property/search', params: { address: TEST_ADDRESS } },

    // List endpoints
    { name: 'Properties List', endpoint: '/properties/list', params: { location: TEST_ADDRESS } },
    { name: 'Properties Auto Complete', endpoint: '/properties/auto-complete', params: { query: TEST_ADDRESS } },

    // Detail endpoints (these will likely fail without a propertyId, but that's okay)
    { name: 'Property Details', endpoint: '/properties/detail', params: { propertyId: '12345' } },
    { name: 'Property Info', endpoint: '/property/details', params: { propertyId: '12345' } },

    // Comps endpoints
    { name: 'Property Comps', endpoint: '/properties/comps', params: { propertyId: '12345' } },
    { name: 'Comparable Sales', endpoint: '/property/comps', params: { propertyId: '12345' } },
  ];

  console.log('\n' + '='.repeat(60));
  console.log('TESTING ENDPOINTS');
  console.log('='.repeat(60));

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.endpoint, test.params);
    results[test.name] = result;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const successful = Object.entries(results).filter(([_, r]) => r.success);
  const failed = Object.entries(results).filter(([_, r]) => !r.success);

  console.log(`\n✓ Successful: ${successful.length}`);
  successful.forEach(([name]) => console.log(`  - ${name}`));

  console.log(`\n✗ Failed: ${failed.length}`);
  failed.forEach(([name]) => console.log(`  - ${name}`));

  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS');
  console.log('='.repeat(60));
  console.log(`
1. Check which endpoints succeeded above
2. Log into your RapidAPI dashboard: https://rapidapi.com/
3. Find your Redfin5 API subscription
4. Compare the working endpoints with the API documentation
5. Update backend/server.js to use the correct endpoint paths

If none of the endpoints work, your API might use a different structure.
Check the RapidAPI documentation for your specific Redfin5 subscription.
`);
}

// Run the tests
runTests().catch(console.error);
