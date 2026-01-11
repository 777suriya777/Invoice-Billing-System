require('dotenv').config({override: true});
const express = require('express');
const authRouter = require('./auth-routes.js');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();

app.use(cors({methods: ['GET', 'POST'], origin: ['http://localhost:5500','http://127.0.0.1:5500']}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Mount auth routes (public)
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});