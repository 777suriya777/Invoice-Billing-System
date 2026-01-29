import express from 'express';
import { getCustomers, createCustomer } from '../controller/customer-controller.js';
import authenticateUser from '../middleware/auth-middleware.js'

const router = express.Router();

router.get('/',authenticateUser, getCustomers);
router.post('/',authenticateUser, createCustomer);

export default router;