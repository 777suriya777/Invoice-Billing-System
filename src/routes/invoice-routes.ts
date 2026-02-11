import express, { Router } from 'express';
import authenticateUser from '../middleware/auth-middleware';
import { getInvoices, getInvoice, createInvoice, changeStatus, downloadInvoicePDF } from '../controller/invoice-controller';
import { rateLimitMiddleware } from '../middleware/rate-limiter';

const router: Router = express.Router();

router.get('/',rateLimitMiddleware, authenticateUser, getInvoices);
router.get('/:id',rateLimitMiddleware, authenticateUser, getInvoice);
router.get('/:id/pdf',rateLimitMiddleware, authenticateUser, downloadInvoicePDF)
router.post('/',rateLimitMiddleware, authenticateUser, createInvoice);
router.patch('/:id/status',rateLimitMiddleware, authenticateUser, changeStatus);

export default router;
