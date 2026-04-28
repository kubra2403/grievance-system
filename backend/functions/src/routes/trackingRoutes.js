const express = require('express');
const trackingController = require('../controllers/trackingController');

const router = express.Router();

router.get('/complaints', trackingController.getAllComplaints);
router.get('/complaints/:id', trackingController.getComplaintById);
router.get('/complaints/:id/logs', trackingController.getComplaintLogs);

module.exports = router;
