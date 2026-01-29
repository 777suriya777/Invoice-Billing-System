import express from 'express';
import { getItems, createItem } from '../controller/item-controller.js';
import authenticateUser from '../middleware/auth-middleware.js';

const router = express.Router();

router.get('/',authenticateUser, getItems);
router.post('/',authenticateUser, createItem);

export default router;