const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth-middleware');
const { getInvoices, getInvoice, createInvoice, updateInvoice, changeStatus } = require('../controller/invoice-controller');

router.get('/', authenticateUser, getInvoices);
router.get('/:id', authenticateUser, getInvoice);
router.post('/', authenticateUser, createInvoice);
router.put('/:id', authenticateUser, updateInvoice);
router.patch('/:id/status', authenticateUser, changeStatus);

module.exports = router;