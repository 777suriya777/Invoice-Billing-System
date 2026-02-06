import express, { Router } from 'express';
import { getItems, createItem } from '../controller/item-controller';
import authenticateUser from '../middleware/auth-middleware';

const router: Router = express.Router();

router.get('/', authenticateUser, getItems);
router.post('/', authenticateUser, createItem);

export default router;
