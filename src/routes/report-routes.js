import express from 'express';
import authenticateUser from '../middleware/auth-middleware.js';
import { getReport } from '../controller/report-controller.js';

const router = express.Router();

// GET /report - generate user-specific report
router.get('/', authenticateUser, getReport);

export default router;