import express, { Router } from 'express';
import { LoginUser, RegisterUser } from '../controller/auth-controller';

const router: Router = express.Router();

router.post('/login', LoginUser);

router.post('/register', RegisterUser);

export default router;
