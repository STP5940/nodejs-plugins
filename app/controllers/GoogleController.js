// Filename: GoogleController.js 
// Created time: 25-04-2024 19:11:31

const qs = require('qs');
const axios = require('axios');

const Storetokens = require("../Storetokens");
const { googleOAuth, getAccessToken, getGoogleUserInfo } = require("../GoogleAuth");
const Authen = require("../Authen");
const Func = require("../Func");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

// index แสดงข้อมูลทั้งหมด
// router.get('/user/google', usersAuth, GoogleController.index);
exports.index = async function (req, res, next) {
  try {

    const params = {
      client_id: googleOAuth.CLIENT_ID,
      redirect_uri: googleOAuth.REDIRECT_URI,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '), // space separated string
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    };

    const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify(params)}`;

    return res.redirect(googleLoginUrl);
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// callback แสดงข้อมูลด้วย callback
// router.get('/user/google/callback', usersAuth, GoogleController.callback);
exports.callback = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    // รับรหัสยืนยันจากพารามิเตอร์ 'code'
    const code = req.query.code;

    if (!code) { // ตรวจสอบว่ารหัสยืนยันถูกส่งมาจริงหรือไม่
      // ถ้าไม่มีรหัสยืนยัน กลับไปยังหน้าแรกหรือส่งข้อความข้อผิดพลาด
      return res.redirect('/login');
    }

    // const UserInfo = await getGoogleUserInfo((await getAccessToken(code))?.access_token);
    // const UserInfo = await getGoogleUserInfo(await getAccessToken(code).then(res => res.access_token));

    const { access_token } = await getAccessToken(code);
    const UserInfo = await getGoogleUserInfo(access_token);

    console.log('email: ', UserInfo?.email);

    res.redirect('/user/dashboard');
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// create บันทึกข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/create', usersAuth, DemoController.create);
exports.create = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("create");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// store บันทึกข้อมูล
// router.post('/user/demo/store', usersAuth, tokenSubmit, DemoController.store);
exports.store = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    const dataUse = Authen.getSession(req);

    return res.send("store");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/:_id/edit', usersAuth, DemoController.edit);
exports.edit = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("edit");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// update แก้ไขข้อมูล
// router.post('/user/demo/update', usersAuth, tokenSubmit, DemoController.update);
exports.update = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    const dataUse = Authen.getSession(req);

    return res.send("update");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// delete ลบข้อมูล
// router.get('/user/demo/:_id/destroy', usersAuth, DemoController.destroy);
exports.destroy = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("destroy");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

exports.name = controllerName;