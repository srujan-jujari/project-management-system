const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, dashboardController.getStats);

module.exports = router;
