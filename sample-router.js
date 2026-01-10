const express = require('express');
const router = express.Router();

router.get('/sample', (req, res) => {
    res.send('This is a sample route!');
});

router.post('/sample',(req,res) => {
    const { invoiceNumber, amount } = req.body;
     if (!invoiceNumber || !amount) {
        return res.status(400).json({ message: 'Invoice number and amount are required' });
    }
    res.json({ message: `Invoice ${invoiceNumber} submitted with amount ${amount}` });
});

module.exports = router;