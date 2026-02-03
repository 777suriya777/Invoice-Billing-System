import express from 'express';
import authenticateUser from '../middleware/auth-middleware.js';
import { getInvoices, getInvoice, createInvoice, changeStatus } from '../controller/invoice-controller.js';

const router = express.Router();

router.get('/', authenticateUser, getInvoices);
router.get('/:id', authenticateUser, getInvoice);
router.post('/', authenticateUser, createInvoice);
router.patch('/:id/status', authenticateUser, changeStatus);

export default router;