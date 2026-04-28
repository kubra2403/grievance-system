const crypto = require('crypto');

/**
 * Generates a SHA256 hash of the given data
 * @param {string} data - The data to hash
 * @returns {string} The resulting hash in hex format
 */
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  generateHash
};
