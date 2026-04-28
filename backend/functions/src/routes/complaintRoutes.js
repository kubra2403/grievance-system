const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// Define routes
router.post('/complaints', complaintController.createComplaint);

module.exports = router;
