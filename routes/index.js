const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { usersAuth, tokenSubmit } = require('../app/UsersAuth');

const MenuController = require('../app/controllers/MenuController');
const LoginController = require('../app/controllers/LoginController');


/*-------- Define a route handler for the root URL -------- */
router.get('/', (req, res) => { res.redirect('/login'); });


/*-------- Menu: MenuController -------- */
router.get('/menu', usersAuth, MenuController.index);
/*-------- EndMenu: MenuController -------- */


/*-------- Login: LoginController -------- */
router.get('/login', LoginController.show);
router.post('/login', [
  check("username", "โปรดใส่ชื่อผู้ใช้").not().isEmpty(),
  check("password", "โปรดใส่รหัสผ่าน").not().isEmpty(),
], tokenSubmit, LoginController.login);
router.post('/login/checktfa', tokenSubmit, LoginController.loginchecktfa);
router.get('/logout', LoginController.logout);
/*-------- EndLogin: LoginController -------- */


module.exports = router;