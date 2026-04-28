const express = require('express');
const cors = require('cors');
require('dotenv').config();

const complaintRoutes = require('./src/routes/complaintRoutes');
const validationRoutes = require('./src/routes/validationRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const statusRoutes = require('./src/routes/statusRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json()); // Enable JSON parsing

// API Routes
app.use('/api', complaintRoutes);
app.use('/api', validationRoutes);
app.use('/api', trackingRoutes);
app.use('/api', statusRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Base Route
app.get('/', (req, res) => {
  res.status(200).send('Backend Running');
});

module.exports = app;
