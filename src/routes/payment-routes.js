const express = require('express');
const router = express.Router();
const {makePaymentForAnInvoice, getPaymentForAnInvoice} = require('../controller/payment-controller.js');
const authMiddleware = require('../middleware/auth-middleware.js');

// POST /payments - process a payment for an invoice
router.post('/:id', authMiddleware, makePaymentForAnInvoice);
router.get('/:id', authMiddleware, getPaymentForAnInvoice);

module.exports = router;