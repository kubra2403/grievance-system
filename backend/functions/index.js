const functions = require('firebase-functions');
const app = require('./app');

// Export Express app as a Firebase Function named "app"
exports.app = functions.https.onRequest(app);
