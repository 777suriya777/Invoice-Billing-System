const express = require('express');
const {getCustomers, createCustomer} = require('../controller/customer-controller');
const authenticateUser = require('../middleware/auth-middleware')

const router = express.Router();

router.get('/',authenticateUser, getCustomers);
router.post('/',authenticateUser, createCustomer);

module.exports = router;