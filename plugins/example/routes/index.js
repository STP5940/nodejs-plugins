const express = require('express');
const router = express.Router();
const { usersAuth, authorize, tokenSubmit } = require("@app/UsersAuth");

const DemoController = require('../controllers/DemoController');

router.get('/', usersAuth, DemoController.index);
router.post('/', usersAuth, DemoController.index);

module.exports = router;