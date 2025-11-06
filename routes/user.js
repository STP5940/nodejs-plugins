const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const { usersAuth, authorize, tokenSubmit } = require('../app/UsersAuth');

const UploadController = require('../app/controllers/UploadController');
const DashboardController = require('../app/controllers/DashboardController');
const SecurityController = require('../app/controllers/SecurityController');
const LanguageController = require('../app/controllers/LanguageController');
const TwofactorController = require('../app/controllers/TwofactorController');
const GoogleController = require('../app/controllers/GoogleController');
const ManageemployeesController = require('../app/controllers/ManageemployeesController');
const ManagecompanysController = require('../app/controllers/ManagecompanysController');
const AccessrolesController = require('../app/controllers/AccessrolesController');
const AccesspermissionsController = require('../app/controllers/AccesspermissionsController');
const ProfilecompanyController = require('../app/controllers/ProfilecompanyController');

/*-------- imageupload: UploadController -------- */
router.post('/api/image/upload', usersAuth, UploadController.imageupload);
/*-------- EndMenu: MenuController -------- */


/*-------- User: DashboardController -------- */
router.get('/dashboard', usersAuth, DashboardController.show);
router.get('/darkmode/:darkmode', [
  check('darkmode').isBoolean().withMessage('Invalid mode specified')
], DashboardController.modeupdate);
/*-------- EndUser: DashboardController -------- */


/*-------- Accessroles: AccessrolesController -------- */
router.get('/accessroles', usersAuth,
  authorize(AccessrolesController.name, 'read'),
  AccessrolesController.index);

router.put('/api/accessroles/update', [
  check("_usersroleId", "_username").not().isEmpty(),
  check("new_description", "_enter_roles_name").not().isEmpty(),
  check("new_permissions", "_enter_permissionslists").isJSON(),
], usersAuth,
  authorize(AccessrolesController.name, 'update'),
  AccessrolesController.update);

router.get('/accessroles/create', usersAuth,
  authorize(AccessrolesController.name, 'create'),
  AccessrolesController.create);

router.post('/api/accessroles/store', [
  check("new_description", "_enter_roles_name").not().isEmpty(),
  check("new_permissions", "_enter_permissionslists").isJSON(),
], usersAuth, tokenSubmit,
  authorize(AccessrolesController.name, 'create'),
  AccessrolesController.store);
/*-------- EndAccessroles: AccessrolesController -------- */


/*-------- Accesspermissions: AccesspermissionsController -------- */
router.get('/accesspermissions', usersAuth,
  authorize(AccesspermissionsController.name, 'read'),
  AccesspermissionsController.index);

router.put('/api/accesspermissions/update', [
  check("_permissionsId", "_permission_id").not().isEmpty(),
  check("new_Controller", "_permission_controller").not().isEmpty(),
  check("new_Name", "_permission_name").not().isEmpty(),
  check("new_Read", "_read").not().isEmpty(),
  check("new_Update", "_create").not().isEmpty(),
  check("new_Create", "_update").not().isEmpty(),
  check("new_Delete", "_delete").not().isEmpty(),
], usersAuth,
  authorize(AccesspermissionsController.name, 'update'),
  AccesspermissionsController.update);
/*-------- EndAccesspermissions: AccesspermissionsController -------- */


/*-------- Managecompanys: ManagecompanysController -------- */
router.get('/managecompanys', usersAuth,
  authorize(ManagecompanysController.name, 'read'),
  ManagecompanysController.index);

router.get('/managecompanys/create', usersAuth,
  authorize(ManagecompanysController.name, 'create'),
  ManagecompanysController.create);

router.post('/api/managecompanys/store', [
  check("new_companyname", "_enter_companyname").not().isEmpty(),
  check("new_mail", "_enter_mail").not().isEmpty(),
  check("new_username", "_enter_username").not().isEmpty(),
  check("new_password", "_enter_new_password").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(ManagecompanysController.name, 'create'),
  ManagecompanysController.store);

router.get('/managecompanys/edit/:_id', usersAuth,
  authorize(ManagecompanysController.name, 'update'),
  ManagecompanysController.edit);

router.put('/api/managecompanys/update', [
  check("new_companyname", "_enter_companyname").not().isEmpty(),
  check("new_mail", "_enter_mail").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(ManagecompanysController.name, 'update'),
  ManagecompanysController.update);

router.delete('/api/managecompanys/delete/:_id', usersAuth,
  authorize(ManagecompanysController.name, 'delete'),
  ManagecompanysController.destroy);

router.delete('/api/managecompanys/twofactorclose/:_id', usersAuth,
  authorize(ManagecompanysController.name, 'update'),
  ManagecompanysController.twofactorclose);

router.put('/api/managecompanys/password/update', [
  check("_userId", "_username").not().isEmpty(),
  check("new_password", "_enter_new_password").not().isEmpty(),
], usersAuth,
  authorize(ManagecompanysController.name, 'update'),
  ManagecompanysController.resetpassword);
/*-------- EndManagecompanys: ManagecompanysController -------- */


/*-------- Manageemployees: ManageemployeesController -------- */
router.get('/manageemployees', usersAuth,
  authorize(ManageemployeesController.name, 'read'),
  ManageemployeesController.index);

router.get('/manageemployees/create', usersAuth,
  authorize(ManageemployeesController.name, 'create'),
  ManageemployeesController.create);

router.post('/api/manageemployees/store', [
  check("new_usersroleId", "_enter_roles").not().isEmpty(),
  check("new_firstname", "_enter_firstname").not().isEmpty(),
  check("new_lastname", "_enter_lastname").not().isEmpty(),
  check("new_mail", "_enter_mail").not().isEmpty(),
  check("new_username", "_enter_username").not().isEmpty(),
  check("new_password", "_enter_new_password").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(ManageemployeesController.name, 'create'),
  ManageemployeesController.store);

router.get('/manageemployees/edit/:_id', usersAuth,
  authorize(ManageemployeesController.name, 'update'),
  ManageemployeesController.edit);

router.put('/api/manageemployees/update', [
  check("new_usersroleId", "_enter_roles").not().isEmpty(),
  check("new_firstname", "_enter_firstname").not().isEmpty(),
  check("new_lastname", "_enter_lastname").not().isEmpty(),
  check("new_mail", "_enter_mail").not().isEmpty(),
  check("new_username", "_enter_username").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(ManageemployeesController.name, 'update'),
  ManageemployeesController.update);

router.delete('/api/manageemployees/delete/:_id', usersAuth,
  authorize(ManageemployeesController.name, 'delete'),
  ManageemployeesController.destroy);

router.delete('/api/manageemployees/twofactorclose/:_id', usersAuth,
  authorize(ManageemployeesController.name, 'update'),
  ManageemployeesController.twofactorclose);

router.put('/api/manageemployees/password/update', [
  check("_userId", "_username").not().isEmpty(),
  check("new_password", "_enter_new_password").not().isEmpty(),
], usersAuth,
  authorize(ManageemployeesController.name, 'update'),
  ManageemployeesController.resetpassword);
/*-------- Manageemployees: ManageemployeesController -------- */


/*-------- Translations: LanguageController -------- */
router.get('/language/:language', [
  check('language').isIn(['th', 'en']).withMessage('Invalid language specified')
], usersAuth, LanguageController.update);
router.get('/language/:_id/show', LanguageController.show);
/*-------- EndTranslations: LanguageController -------- */


/*-------- Security: SecurityController -------- */
router.get('/security', usersAuth,
  authorize(SecurityController.name, 'read'),
  SecurityController.show);

router.post('/security', [
  check("password", "_current_password").not().isEmpty(),
  check("new_password", "_new_password").not().isEmpty(),
  check("confirm_new_password", "_retype_new_password").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(SecurityController.name, 'update'),
  SecurityController.update);

router.delete('/security/session/delete', usersAuth,
  authorize(SecurityController.name, 'delete'),
  SecurityController.destroy);
/*-------- EndSecurity: SecurityController -------- */


/*-------- Twofactor: TwofactorController -------- */
router.get('/twofactor', usersAuth,
  authorize(TwofactorController.name, 'read'),
  TwofactorController.index);

router.post('/twofactor/update', [
  check("confirm_twofactor", "_confirm_twofactor").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(TwofactorController.name, 'update'),
  TwofactorController.update);

router.post('/twofactor/updatechecked', [
  check("confirm_twofactor", "_confirm_twofactor").not().isEmpty(),
  check("namecolumn", "_activity").not().isEmpty(),
  check("setboolean", "_activation_status").isIn(['true', 'false']),
], usersAuth,
  authorize(TwofactorController.name, 'update'),
  TwofactorController.updatechecked);

router.get('/twofactor/:_id/:_twofa/show', usersAuth,
  authorize(TwofactorController.name, 'read'),
  TwofactorController.show);
/*-------- EndTwofactor: TwofactorController -------- */


/*-------- Google: GoogleController -------- */
router.get('/google', GoogleController.index);
router.get('/google/callback', GoogleController.callback);
/*-------- EndGoogle: GoogleController -------- */


/*-------- Profile: ProfilecompanyController -------- */
router.get('/profilecompany', usersAuth,
  authorize(ProfilecompanyController.name, 'read'),
  ProfilecompanyController.index);

router.put('/api/profilecompany/update', [
  check("new_companyname", "_enter_companyname").not().isEmpty(),
  check("new_mail", "_enter_mail").not().isEmpty(),
], usersAuth, tokenSubmit,
  authorize(ProfilecompanyController.name, 'update'),
  ProfilecompanyController.update);
/*-------- EndProfile: ProfilecompanyController -------- */


module.exports = router;