import express from 'express';
import { makePaymentForAnInvoice, getPaymentForAnInvoice } from '../controller/payment-controller.js';
import authenticateUser from '../middleware/auth-middleware.js';

const router = express.Router();

// POST /payments - process a payment for an invoice
router.post('/:id', authenticateUser, makePaymentForAnInvoice);
router.get('/:id', authenticateUser, getPaymentForAnInvoice);

export default router;