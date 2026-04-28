const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');

router.post('/complaints/:id/validate', validationController.validateComplaint);

module.exports = router;
