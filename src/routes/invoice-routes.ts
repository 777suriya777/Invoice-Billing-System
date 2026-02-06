import express, { Router } from 'express';
import authenticateUser from '../middleware/auth-middleware';
import { getInvoices, getInvoice, createInvoice, changeStatus } from '../controller/invoice-controller';

const router: Router = express.Router();

router.get('/', authenticateUser, getInvoices);
router.get('/:id', authenticateUser, getInvoice);
router.post('/', authenticateUser, createInvoice);
router.patch('/:id/status', authenticateUser, changeStatus);

export default router;
