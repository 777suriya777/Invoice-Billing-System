const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth-middleware');
const { getReport } = require('../controller/report-controller');

// GET /report - generate user-specific report
router.get('/', authenticateUser, getReport);

module.exports = router;