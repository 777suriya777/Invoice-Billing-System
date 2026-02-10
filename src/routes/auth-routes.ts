import express, { Router } from 'express';
import { LoginUser, RegisterUser } from '../controller/auth-controller';
import { rateLimitMiddleware } from '../middleware/rate-limiter';

const router: Router = express.Router();

router.post('/login',rateLimitMiddleware, LoginUser);

router.post('/register',rateLimitMiddleware, RegisterUser);

export default router;
