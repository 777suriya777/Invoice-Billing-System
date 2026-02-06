import express, { Router } from 'express';
import { getCustomers, createCustomer } from '../controller/customer-controller';
import authenticateUser from '../middleware/auth-middleware'

const router: Router = express.Router();

router.get('/', authenticateUser, getCustomers);
router.post('/', authenticateUser, createCustomer);

export default router;
