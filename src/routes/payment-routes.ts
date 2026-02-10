import express, { Router } from 'express';
import { makePaymentForAnInvoice, getPaymentForAnInvoice } from '../controller/payment-controller';
import authenticateUser from '../middleware/auth-middleware';
import { rateLimitMiddleware } from '../middleware/rate-limiter';

const router: Router = express.Router();

// POST /payments - process a payment for an invoice
router.post('/:id',rateLimitMiddleware, authenticateUser, makePaymentForAnInvoice);
router.get('/:id',rateLimitMiddleware, authenticateUser, getPaymentForAnInvoice);

export default router;
