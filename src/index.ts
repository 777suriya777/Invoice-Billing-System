import 'dotenv/config.js';
import express, { Request, Response } from 'express';
import authRouter from './routes/auth-routes';
import invoiceRouter from './routes/invoice-routes';
import paymentRouter from './routes/payment-routes';
import reportRouter from './routes/report-routes';
import itemRouter from './routes/item-routes';
import customerRouter from './routes/customer-routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;

const app = express();

app.use(cors({
  methods: ['GET', 'POST', 'PATCH', 'PUT'],
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Route handlers
app.use('/auth', authRouter);

app.use('/invoices', invoiceRouter);

app.use('/payments', paymentRouter);

app.use('/report', reportRouter);

app.use('/items', itemRouter);

app.use('/customers', customerRouter);

// Start the server only when not running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
