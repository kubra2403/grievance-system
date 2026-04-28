const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with default credentials
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  storage
};
