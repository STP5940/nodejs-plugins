// Filename: TwofactorController.js 
// Created time: 10-04-2024 09:04:29

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const { validationResult } = require("express-validator");
const twofactor = require("node-2fa");
const qr = require('qrcode');
const crypto = require('crypto');
const path = require('path');

const controllerName = path.parse(__filename).name;

const T_Twofactor = require("../Models/T_Twofactor");

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    await Authen.updateSession(req);
    const dataUse = Authen.getSession(req);


    // // Generate a time-based one-time password
    // const Secretkey = twofactor.generateSecret({ name: `${process.env.WEBSITENAME}`, account: dataUse.username });
    /* Secretkey.uri */
    /* Secretkey.secret */
    // console.log(Secretkey);
    // const Secretkey = req.session.tfa

    // // Generate QR code as a data URL
    const qrDataURL = await qr.toDataURL(`otpauth://totp/${process.env.WEBSITENAME}%3A${dataUse.username.toUpperCase()}?secret=${req.session.tfa}&issuer=${process.env.WEBSITENAME}`, { width: 250, height: 250, margin: 1 });
    // const genToken = twofactor.generateToken(req.session.tfa);

    // // Send the QR code image as a response
    // return res.send(`<img src="${qrDataURL}" alt="QR Code"><br/>
    // <a href="/user/twofactor/${Secretkey.secret}/${genToken.token}/show" target="_blank" style="text-decoration:none">${Secretkey.secret}</a>`);

    // console.log(process.env.WEBSITENAME);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      qrDataURL: qrDataURL,
      // Secretkey: req.session.tfa,
    };

    return res.render("Users/twofactor/index", data);
  } catch ({ name, message, theme }) {
    res.status(500).render("erroruser", {
      error: {
        status: 500,
        theme: theme,
        message: message,
      }
    });
  }
};

// show แสดงข้อมูลด้วยคีย์
// router.get('/user/demo/:_id/show', usersAuth, DemoController.show);
exports.show = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const token = req.params._id;
    const twofa = req.params._twofa;

    const genToken = twofactor.generateToken(token);
    const tokenverify = twofactor.verifyToken(token, twofa);

    // Example usage
    const text = token;

    const key = crypto.randomBytes(32); // สร้าง key 32 bytes = 256 bits
    const iv = crypto.randomBytes(16); // สร้าง IV สุ่มขนาด 16 ไบต์ 16 bytes = 128 bits
    const encryptedText = Func.encryptText(text, key, iv);
    const decryptedText = Func.decryptText(encryptedText, key, iv);

    console.log("text: ", text);
    console.log("key: ", key.toString('hex'));
    console.log("iv: ", iv.toString('hex'));
    // console.log("iv: ", Buffer.from(iv.toString('hex'), 'hex')); // แปลงเป็น Buffer object
    console.log('Encrypted text:', encryptedText);
    console.log('Decrypted text:', decryptedText)

    // console.log(tokenverify);

    // return res.send('<img src="https://chart.googleapis.com/chart?cht=qr&chs=100x100&chl=http://webneena.blogspot.com/&chld=L|0" alt="">');

    if (tokenverify === null) {
      return res.send('token verify failed');
    }

    if (tokenverify && tokenverify.delta < 0) {
      return res.send('2FA: ' + twofa + ', <br/>Timeout: ' + tokenverify.delta + ' min');
    }

    return res.send('genToken: ' + genToken.token + ', <br/>tokenVerify: true');

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
    return res.send(errorMessages);
  }

  try {

    const Twofactor = new T_Twofactor();

    const dataUse = Authen.getSession(req);

    const twofa = req.body.confirm_twofactor;

    const tokenverify = twofactor.verifyToken(req.session.tfa, twofa);

    if (tokenverify === null || tokenverify.delta < -1) { // เกิน 1 นาทีถือว่าหมดอายุ

      req.flash("error", "_error_confirm_tfa"); // รหัสผ่านปัจจุบันไม่ถูกต้อง
      return res.redirect('/user/twofactor');
    }

    await Twofactor.getTwofactorByUid(dataUse?.User_id);
    req.session.tfaactive = true;

    req.flash("success", "_success_saved"); // บันทึกข้อมูลสำเร็จ
    return res.redirect('/user/twofactor');

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


// updatechecked แก้ไขข้อมูลรายการตรวจสอบ 2FA
// router.post('/user/demo/updatechecked', usersAuth, tokenSubmit, DemoController.update);
exports.updatechecked = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    let twofa = req.body.confirm_twofactor;
    let namecolumn = req.body.namecolumn;
    let setboolean = req.body.setboolean;

    const Twofactor = new T_Twofactor();

    const dataUse = Authen.getSession(req);
    const tokenverify = twofactor.verifyToken(req.session.tfa, twofa);

    if (tokenverify === null || tokenverify.delta < -1) { // เกิน 3 นาทีถือว่าหมดอายุ
      return res.status(200).json({
        status: false,
        checked: setboolean === 'true' ? false : true,
      });
    }

    await Twofactor.updateTwofactorByUid(dataUse?.User_id, namecolumn, setboolean);

    return res.status(200).json({
      status: true,
      checked: setboolean === 'true',
    });
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

exports.name = controllerName;