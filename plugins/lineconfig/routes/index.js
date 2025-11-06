const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { usersAuth, authorize, tokenSubmit } = require("@app/UsersAuth");

const LineconfigController = require('../controllers/LineconfigController');

router.get('/', usersAuth,
    authorize(LineconfigController.name, 'read'),
    LineconfigController.index);

router.post('/webhook/:_companyId',
    LineconfigController.webhook);

router.post('/api/testconnection', usersAuth, tokenSubmit, LineconfigController.testconnection);

router.put('/api/update', [
    // ยังไม่ได้ Validate ข้อมูล
    check("_companyId", "_enter_companyname").not().isEmpty(),
], usersAuth, tokenSubmit,
    authorize(LineconfigController.name, 'update'),
    LineconfigController.update);

module.exports = router;