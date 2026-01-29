import express from 'express';
import authenticateUser from '../middleware/auth-middleware.js';
import { getInvoices, getInvoice, createInvoice, updateInvoice, changeStatus } from '../controller/invoice-controller.js';

const router = express.Router();

router.get('/', authenticateUser, getInvoices);
router.get('/:id', authenticateUser, getInvoice);
router.post('/', authenticateUser, createInvoice);
router.put('/:id', authenticateUser, updateInvoice);
router.patch('/:id/status', authenticateUser, changeStatus);

export default router;