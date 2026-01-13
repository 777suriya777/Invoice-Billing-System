const express = require('express');
const router = express.Router();
const authenticateUser = require('./auth-middleware');
const { getInvoices, getInvoice, createInvoice } = require('./invoice-controller');

router.get('/', authenticateUser, getInvoices);
router.get('/:id', authenticateUser, getInvoice);
router.post('/', authenticateUser, createInvoice);

module.exports = router;