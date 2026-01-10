require('dotenv').config({override: true});
const express = require('express');
const sampleRouter = require('./sample-router.js');
const cors = require('cors');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use((req,res,next) => { 
    console.log("This is from the express middleware");
    next();
});
app.use(cors({methods: ['GET', 'POST'], origin: ['http://localhost:5500','http://127.0.0.1:5500']}));

app.use('/sample-router', sampleRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});