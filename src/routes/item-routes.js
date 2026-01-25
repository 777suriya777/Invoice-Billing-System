const express = require('express');
const {getItems, createItem} = require('../controller/item-controller');
const authenticateUser = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/',authenticateUser, getItems);
router.post('/',authenticateUser, createItem);

module.exports = router;