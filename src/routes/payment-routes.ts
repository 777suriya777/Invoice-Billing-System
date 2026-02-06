import express, { Router } from 'express';
import { makePaymentForAnInvoice, getPaymentForAnInvoice } from '../controller/payment-controller';
import authenticateUser from '../middleware/auth-middleware';

const router: Router = express.Router();

// POST /payments - process a payment for an invoice
router.post('/:id', authenticateUser, makePaymentForAnInvoice);
router.get('/:id', authenticateUser, getPaymentForAnInvoice);

export default router;
