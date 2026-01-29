import express from 'express';
import { makePaymentForAnInvoice, getPaymentForAnInvoice } from '../controller/payment-controller.js';
import authMiddleware from '../middleware/auth-middleware.js';

const router = express.Router();

// POST /payments - process a payment for an invoice
router.post('/:id', authMiddleware, makePaymentForAnInvoice);
router.get('/:id', authMiddleware, getPaymentForAnInvoice);

export default router;