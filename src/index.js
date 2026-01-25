require('dotenv').config({override: true});
const express = require('express');
const authRouter = require('./routes/auth-routes.js');
const invoiceRouter = require('./routes/invoice-routes.js');
const paymentRouter = require('./routes/payment-routes.js');
const reportRouter = require('./routes/report-routes.js');
const itemRouter = require('./routes/item-routes.js');
const customerRouter = require('./routes/customer-routes.js');
const cors = require('cors');

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