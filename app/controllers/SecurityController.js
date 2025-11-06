const Authen = require("../Authen");
const Func = require("../Func");
const Storetokens = require("../Storetokens");
const { redisStore, redisClient } = require('../Redis');

const { validationResult } = require("express-validator");
const twofactor = require("node-2fa");
const bcrypt = require('bcrypt');
const path = require('path');

const controllerName = path.parse(__filename).name;

const T_Users = require("../Models/T_Users");
const SYS_Signinlogs = require("../Models/SYS_Signinlogs");

// show
exports.show = async function (req, res, next) {
  try {

    const Signinlogs = new SYS_Signinlogs();

    await Authen.updateSession(req);
    const dataUse = Authen.getSession(req);

    const keys = await redisClient.sendCommand(["keys", "sess:*"]);

    const sessionLists = keys.map(key => key.replace(redisStore.prefix, ''));

    const signinlogs = await Signinlogs.getSigninlogsByUidAndSession(dataUse?.User_id, sessionLists);

    const encryptedLogs = signinlogs.map(log => {
      const encryptedLog = {
        ...log,
        encryptedSession: Func.encryptText(log.session)
      };
      return encryptedLog;
    });

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      formatDateTimeThai: Func.formatDateTimeThai,
      sessionOnline: Func.encryptText(req.session.id),
      signinlogs: encryptedLogs,
      // language: 'th'
    };

    return res.render("Users/security/index", data);

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

// create
exports.add = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// update
exports.update = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    return res.redirect('/user/security');
  }

  try {

    const Users = new T_Users();

    await Authen.updateSession(req);
    const dataUse = Authen.getSession(req);

    const password = req.body.password;
    const new_password = req.body.new_password;
    const confirm_new_password = req.body.confirm_new_password;
    const twofa = req.body.confirm_twofactor;

    const Usebyusername = await Users.getUserByUsername(dataUse?.username);
    const tokenverify = twofactor.verifyToken(req.session.tfa, twofa);

    if (req.session.changepassword == true && (tokenverify === null || tokenverify.delta < -1)) { // เกิน 1 นาทีถือว่าหมดอายุ 371634

      req.flash("error", "_error_confirm_tfa"); // รหัสผ่านปัจจุบันไม่ถูกต้อง
      return res.redirect('/user/security');
    }

    // ไม่พบข้อมูล username ที่ต้องการเปลี่ยน
    if (!Usebyusername) {

      req.flash("error", "_error_username_not_found"); // ไม่พบชื่อผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน
      return res.redirect('/user/security');
    }


    // เช็ครหัสผ่านใหม่ ไม่ตรงกัน
    if (new_password !== confirm_new_password) {

      req.flash("error", "_error_confirm_password_incorrect"); // ยืนยันรหัสผ่านใหม่ไม่ถูกต้อง
      return res.redirect('/user/security');
    }


    // เช็ครหัสผ่านล่าสุดว่าถูกต้องใหม
    const passwordVerify = await bcrypt.compare(password, Usebyusername?.password);

    // รหัสผ่านไม่ถูกต้อง
    if (!passwordVerify) {

      req.flash("error", "_error_password_incorrect"); // รหัสผ่านปัจจุบันไม่ถูกต้อง
      return res.redirect('/user/security');
    }

    const new_password_hash = await bcrypt.hash(new_password, parseInt(process.env.SALTROUNDS));

    await Users.updateUserById(dataUse?.User_id, {
      password: new_password_hash,
    });

    req.flash("success", "_success_saved"); // บันทึกข้อมูลสำเร็จ
    return res.redirect('/user/security');

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// delete
exports.destroy = async function (req, res, next) {
  try {

    const Signinlogs = new SYS_Signinlogs();

    const dataUse = Authen.getSession(req);

    const _sessionid = Func.decryptText(req.body._sessionid);

    // Use the existing redisStore instance
    redisStore.destroy(_sessionid, async (err) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: `Error destroying session: ${err}`,
        });
      }

      // ถ้ารายการถูกลบหมด ให้ลบรายการใน redis ทั้งหมดของ user นั้นๆ
      // ดักกรณีที่ไม่มี logs session ในฐานข้อมูล
      const keys = await redisClient.sendCommand(["keys", "sess:*"]);

      // ดึงช้อมูลรายละเอียดทุก session เพื่อเตรียมลบรายการที่ไม่ใช้แล้ว
      const valuePromises = keys.map(key => redisClient.get(key));
      const values = await Promise.all(valuePromises);

      // ดึงรายการทั้งหมดของ user นั้นๆ
      const sessionLists = keys.map(key => key.replace(redisStore.prefix, ''));
      const signinlogs = await Signinlogs.getSigninlogsByUidAndSession(dataUse?.User_id, sessionLists);

      for (let i = 0; i < keys.length; i++) {
        try {
          // Skip if value is not a string or looks invalid
          if (typeof values[i] !== 'string' || values[i].trim().length === 0) {
            continue;
          }

          const redisValues = JSON.parse(values[i]);

          // ลบรายการที่ไม่มีข้อมูล
          if (redisValues?.User_id == undefined && redisValues?.theme == undefined) {
            redisStore.destroy(keys[i].replace(redisStore.prefix, ''));
          }

          // ลบรายการที่ถูกบังคับออกจากระบบ และรายการที่ user คนนั้นๆ ลบออกทั้งหมด
          if (redisValues?.User_id == dataUse?.User_id && signinlogs.length == 0) {
            redisStore.destroy(keys[i].replace(redisStore.prefix, ''));
          }

        } catch (e) {
          console.error(`Failed to parse Redis value for key ${keys[i]}:`, values[i], e);
          // You might want to destroy invalid entries or handle them differently
          redisStore.destroy(keys[i].replace(redisStore.prefix, ''));
        }
      }

      // ลบรายการ session ที่ต้องการลบของ user คนนั้นๆ
      // await Signinlogs.daleteSigninlogsByUidAndSession(dataUse?.User_id, _sessionid);

      // ดึงรายการ session ที่ต้องการลบของ user คนนั้นๆ ถ้าไม่เจอคืนค่า Session not found
      const deletedSigninlogs = await Signinlogs.daleteSigninlogsByUidAndSession(dataUse?.User_id, _sessionid);
      if (deletedSigninlogs?.count == 0) {
        return res.status(404).json({
          status: false,
          message: `Session not found`,
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Session destroyed successfully',
      });
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

exports.name = controllerName;