/**
 * Validate and normalize address input
 */
function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Address is required');
  }

  const trimmed = address.trim();

  if (trimmed.length < 5) {
    throw new Error('Address is too short');
  }

  if (trimmed.length > 200) {
    throw new Error('Address is too long');
  }

  // Basic validation - should contain at least some alphanumeric characters
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    throw new Error('Invalid address format');
  }

  return trimmed;
}

/**
 * Normalize address for consistent formatting
 */
function normalizeAddress(address) {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/,\s*/g, ', ') // Ensure consistent comma spacing
    .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd)\b/gi, match => {
      // Normalize common street types
      const abbrev = {
        'street': 'St',
        'st': 'St',
        'avenue': 'Ave',
        'ave': 'Ave',
        'road': 'Rd',
        'rd': 'Rd',
        'drive': 'Dr',
        'dr': 'Dr',
        'lane': 'Ln',
        'ln': 'Ln',
        'court': 'Ct',
        'ct': 'Ct',
        'boulevard': 'Blvd',
        'blvd': 'Blvd'
      };
      return abbrev[match.toLowerCase()] || match;
    });
}

module.exports = {
  validateAddress,
  normalizeAddress
};
