import express, { Router } from 'express';
import authenticateUser from '../middleware/auth-middleware';
import { getReport } from '../controller/report-controller';

const router: Router = express.Router();

// GET /report - generate user-specific report
router.get('/', authenticateUser, getReport);

export default router;
