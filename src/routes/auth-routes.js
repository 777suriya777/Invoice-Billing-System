import express from 'express';
import { LoginUser, RegisterUser } from '../controller/auth-controller.js';

const router = express.Router();

router.post('/login', LoginUser);

router.post('/register', RegisterUser);

export default router;    