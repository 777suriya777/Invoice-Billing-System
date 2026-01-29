import 'dotenv/config.js';
import express from 'express';
import authRouter from './routes/auth-routes.js';
import invoiceRouter from './routes/invoice-routes.js';
import paymentRouter from './routes/payment-routes.js';
import reportRouter from './routes/report-routes.js';
import itemRouter from './routes/item-routes.js';
import customerRouter from './routes/customer-routes.js';
import cors from 'cors';

const port = process.env.PORT || 3000;

const app = express();

app.use(cors({methods: ['GET', 'POST', 'PATCH', 'PUT'], origin: ['http://localhost:5500','http://127.0.0.1:5500']}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Route handlers
app.use('/auth', authRouter);

app.use('/invoices', invoiceRouter);

app.use('/payments', paymentRouter);

app.use('/report', reportRouter);

app.use('/items', itemRouter);

app.use('/customers', customerRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});