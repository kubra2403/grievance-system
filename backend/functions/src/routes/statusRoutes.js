const express = require('express');
const statusController = require('../controllers/statusController');

const router = express.Router();

router.patch('/complaints/:id/status', statusController.updateComplaintStatus);

module.exports = router;
