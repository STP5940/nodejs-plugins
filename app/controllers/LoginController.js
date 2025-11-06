const Authen = require("../Authen");
const Func = require("../Func");
const Storetokens = require("../Storetokens");

const { validationResult } = require("express-validator");
const twofactor = require("node-2fa");
const bcrypt = require("bcrypt");
const path = require('path');

const controllerName = path.parse(__filename).name;

const T_Users = require("../Models/T_Users");
const SYS_Signinlogs = require("../Models/SYS_Signinlogs");
const T_Company = require("../Models/T_Company");

const _FAILEDLOGINTIMELLOKED = 2; // ล็อคบัญขี 2 นาที
const _FAILEDLOGINCOUNT = 5; // จำนวนครั้งล็อคอินผิดได้

exports.show = async function (req, res, next) {

  try {
    const dataUse = Authen.getSession(req);

    if (dataUse?.User_id && dataUse?.loggedin && dataUse?.active) {
      return res.redirect('/menu');
    }

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(process.env.LANGUAGE?.toLowerCase())
    };

    return res.render("Login/index", data);
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// เช็คการเข้าสู่ระบบแบบที่ 1
exports.login = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(200).json({
      status: false,
      tfarequired: false,
      error: errorMessages,
      token: res.locals.csrfToken,
    });
  }

  try {
    const Users = new T_Users();
    const Signinlogs = new SYS_Signinlogs();
    const Company = new T_Company();

    const username = req.body.username;
    const password = req.body.password;

    const translat = await Func.getLanguage(process.env.LANGUAGE?.toLowerCase());

    const usernameFirst = await Users.getUserByUsernameFirst(username);
    const resultpass = usernameFirst ? await bcrypt.compare(password, usernameFirst?.password) : false;

    // username or password ไม่ถูกต้อง
    if (!usernameFirst || !resultpass) {

      // สุ่มระหว่าง 520ms ถึง 1020ms
      // ทำให้การตรวจสอบใช้เวลาใกล้เคลียงกันระหว่างไม่เจอ username กับ เจอ username
      const delayTime = Math.floor(Math.random() * (920 - 720 + 1)) + 720;
      usernameFirst ?? await new Promise(resolve => setTimeout(resolve, delayTime));

      // เจอผู้ใช้ และรหัสผ่านไม่ถูกต้อง
      if (usernameFirst && !resultpass) {

        // คำนวณระยะเวลาระหว่างสองเวลาว่าผ่านไปแล้วกี่นาที
        const diffInMs = new Date() - usernameFirst?.lastFailedLogin; // ผลต่างเป็นมิลลิวินาที
        const diffInMinutes = diffInMs / (1000 * 60); // เปลี่ยนมิลลิวินาทีเป็นนาที

        // ตรวจสอบว่าเวลาล็อกอินผิดพลาดล่าสุดผ่านไปแล้วเกินเวลาที่กำหนดหรือไม่
        if (usernameFirst?.lastFailedLogin && diffInMinutes > _FAILEDLOGINTIMELLOKED) {
          // รีเซ็ต failedLoginAttempts เมื่อเวลาผ่านไปแล้ว
          await Users.updateUserById(usernameFirst?.User_id, {
            failedLoginAttempts: 1,
            lastFailedLogin: new Date(), // อัปเดตเวลาล็อกอินผิดล่าสุด
            lockUntil: null, // ลบเวลาล็อก
          });

          usernameFirst.lockUntil = null;
        } else {
          // เพิ่มจำนวนการล็อกอินผิดพลาด
          const failedAttempts = usernameFirst?.failedLoginAttempts + 1;
          const lockUntil = failedAttempts >= _FAILEDLOGINCOUNT ? new Date(Date.now() + _FAILEDLOGINTIMELLOKED * 60 * 1000) : null;

          await Users.updateUserById(usernameFirst?.User_id, {
            failedLoginAttempts: failedAttempts,
            lastFailedLogin: new Date(), // อัปเดตเวลาล็อกอินผิดล่าสุด
            lockUntil,
          });
        }
      }

      // ตรวจสอบว่าบัญชีถูกล็อกหรือไม่
      // ใช้ค่าจาก usernameFirst?.lockUntil จะได้ไม่ต้องโหลดใหม่
      if (usernameFirst?.lockUntil && usernameFirst?.lockUntil > new Date()) {
        return res.status(403).json({
          status: false,
          tfarequired: false,
          error: [
            translat['_username_timelocked']
          ],
          token: res.locals.csrfToken,
        });
      }

      return res.status(200).json({
        status: false,
        tfarequired: false,
        error: [translat['_username_or_password_incorrect']],
        token: res.locals.csrfToken,
      });
    }

    // username และ password ถูกต้อง
    if (usernameFirst && resultpass) {

      const dataUse = await Users.getUserByUsername(username);
      const uid = dataUse?.User_id.toString();

      // ตรวจสอบว่าบัญชีถูกล็อกหรือไม่
      if (dataUse?.lockUntil && dataUse?.lockUntil > new Date()) {
        return res.status(403).json({
          status: false,
          tfarequired: false,
          error: [
            translat['_username_timelocked']
          ],
          token: res.locals.csrfToken,
        });
      }

      // เช็คล็อคบัญชี
      if (!dataUse?.active) {
        return res.status(403).json({
          status: false,
          tfarequired: false,
          error: [
            translat['_username_locked']
          ],
          token: res.locals.csrfToken,
        });
      }

      if (resultpass) {

        if (dataUse?.T_Twofactor?.signinaccount == false) {

          const imageProfile = (dataUse?.TM_Usersrole?.priority == 2 ? dataUse?.T_Company?.profile : dataUse?.T_Employee?.profile);

          let websiteTitle = process.env.WEBSITENAME;
          let websiteLogo = undefined;
          let companyId = undefined;
          switch (dataUse?.TM_Usersrole?.priority) {
            case 1: // SuperAdmin
              websiteTitle = process.env.WEBSITENAME;
              break;
            case 2: // Company
              websiteTitle = dataUse?.T_Company?.name;
              websiteLogo = dataUse?.T_Company?.profile;
              companyId = dataUse?.T_Company?.Company_id;
              break;
            default: // Users
              const companyDetail = await Company.getCompanyById(dataUse?.T_Employee?.Company_id);
              websiteTitle = companyDetail?.name;
              websiteLogo = companyDetail?.profile;
              companyId = dataUse?.T_Employee?.Company_id;
          }

          req.session.loggedin = true;
          req.session.User_id = uid;
          req.session.firstname = dataUse?.firstname;
          req.session.lastname = dataUse?.lastname;
          req.session.username = dataUse?.username;
          req.session.mail = dataUse?.mail;
          req.session.phone = dataUse?.phone;
          req.session.Company_id = companyId;
          req.session.Employee_id = dataUse?.T_Employee?.Employee_id;
          req.session.websiteTitle = websiteTitle;
          req.session.websiteLogo = websiteLogo;
          req.session.profile = imageProfile;
          req.session.Usersrole_id = dataUse?.TM_Usersrole?.Usersrole_id;
          req.session.priority = dataUse?.TM_Usersrole?.priority;
          req.session.description = dataUse?.TM_Usersrole?.description;
          req.session.tfa = dataUse?.T_Twofactor?.Twofactor_id;
          req.session.tfaactive = dataUse?.T_Twofactor?.active;
          req.session.signinaccount = dataUse?.T_Twofactor?.signinaccount;
          req.session.changepassword = dataUse?.T_Twofactor?.changepassword;
          req.session.language = process.env.LANGUAGE?.toLowerCase();
          req.session.active = dataUse?.active;

          const ip = req.clientIp;
          const client = Func.getAgentClient(req.headers['user-agent']);

          await Signinlogs.createSigninlogs(ip, client?.device, client?.browser, client?.platform, req.session.id, uid);

          // รีเซ็ตการล็อกอินผิดพลาด
          await Users.updateUserById(dataUse?.User_id, {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            lockUntil: null,
          });

          return res.status(200).json({
            status: true,
            tfarequired: false,
          });
        } else {

          req.session.username = dataUse?.username;
          req.session.tfa = dataUse?.T_Twofactor?.Twofactor_id;

          // รีเซ็ตการล็อกอินผิดพลาด
          await Users.updateUserById(dataUse?.User_id, {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            lockUntil: null,
          });

          return res.status(200).json({
            status: true,
            tfarequired: true,
            token: res.locals.csrfToken,
          });
        }
      }
    }
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// เช็คการเข้าสู่ระบบแบบที่ 2 (เช็ค 2FA)
// loginchecktfa ตรวจสอบ 2FA ก่อนเข้าสู่ระบบ
// router.post('/login/checktfa', tokenSubmit, LoginController.loginchecktfa);
exports.loginchecktfa = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {
    const Users = new T_Users();
    const Signinlogs = new SYS_Signinlogs();
    const Company = new T_Company();

    let twofa = req.body.confirm_twofactor;

    const tokenverify = twofactor.verifyToken(req.session.tfa, twofa);

    if (tokenverify === null || tokenverify.delta < -1) { // เกิน 3 นาทีถือว่าหมดอายุ
      return res.status(200).json({
        status: false,
        token: res.locals.csrfToken,
      });
    }

    const translat = await Func.getLanguage(process.env.LANGUAGE?.toLowerCase());
    const dataUse = await Users.getUserByUsername(req.session.username);
    const uid = dataUse?.User_id.toString();

    if (dataUse) {

      // เช็คล็อคบัญชี
      if (!dataUse?.active) {
        return res.status(403).json({
          status: false,
          tfarequired: false,
          error: [
            translat['_username_locked']
          ],
          token: res.locals.csrfToken,
        });
      }

      // ตรวจสอบว่าบัญชีถูกล็อกหรือไม่
      if (dataUse?.lockUntil && dataUse?.lockUntil > new Date()) {
        return res.status(403).json({
          status: false,
          tfarequired: false,
          error: [
            translat['_username_timelocked']
          ],
          token: res.locals.csrfToken,
        });
      }

      const imageProfile = (dataUse?.TM_Usersrole?.priority == 2 ? dataUse?.T_Company?.profile : dataUse?.T_Employee?.profile);

      let websiteTitle = process.env.WEBSITENAME;
      let websiteLogo = undefined;
      let companyId = undefined;
      switch (dataUse?.TM_Usersrole?.priority) {
        case 1: // SuperAdmin
          websiteTitle = process.env.WEBSITENAME;
          break;
        case 2: // Company
          websiteTitle = dataUse?.T_Company?.name;
          websiteLogo = dataUse?.T_Company?.profile;
          companyId = dataUse?.T_Company?.Company_id;
          break;
        default: // Users
          const companyDetail = await Company.getCompanyById(dataUse?.T_Employee?.Company_id);
          websiteTitle = companyDetail?.name;
          websiteLogo = companyDetail?.profile;
          companyId = dataUse?.T_Employee?.Company_id;
      }

      req.session.loggedin = true;
      req.session.User_id = uid;
      req.session.firstname = dataUse?.firstname;
      req.session.lastname = dataUse?.lastname;
      req.session.username = dataUse?.username;
      req.session.mail = dataUse?.mail;
      req.session.phone = dataUse?.phone;
      req.session.Company_id = companyId;
      req.session.Employee_id = dataUse?.T_Employee?.Employee_id;
      req.session.websiteTitle = websiteTitle;
      req.session.websiteLogo = websiteLogo;
      req.session.profile = imageProfile;
      req.session.Usersrole_id = dataUse?.TM_Usersrole?.Usersrole_id;
      req.session.priority = dataUse?.TM_Usersrole?.priority;
      req.session.description = dataUse?.TM_Usersrole?.description;
      req.session.tfa = dataUse?.T_Twofactor?.Twofactor_id;
      req.session.tfaactive = dataUse?.T_Twofactor?.active;
      req.session.signinaccount = dataUse?.T_Twofactor?.signinaccount;
      req.session.changepassword = dataUse?.T_Twofactor?.changepassword;
      req.session.language = process.env.LANGUAGE?.toLowerCase();
      req.session.active = dataUse?.active;

      const ip = req.clientIp;
      const client = Func.getAgentClient(req.headers['user-agent']);

      await Signinlogs.createSigninlogs(ip, client?.device, client?.browser, client?.platform, req.session.id, uid);

      return res.status(200).json({
        status: true
      });
    }

    return res.status(200).json({
      status: false,
      token: res.locals.csrfToken,
    });
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// logout
exports.logout = async function (req, res, next) {
  try {
    const Signinlogs = new SYS_Signinlogs();

    const dataUse = Authen.getSession(req);

    // เก็บค่า theme ไว้ก่อนทำลายเซสชัน
    const theme = req.session.theme;
    const _sessionid = req.session.id;

    // ทำลายเซสชันทั้งหมด
    req.session.regenerate(async function (err) {
      // ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Error destroying session",
        });
      }

      // กำหนดค่า theme ใหม่หากมี
      if (theme) {
        req.session.theme = theme;
      }

      // ดึงรายการ session ที่ต้องการลบของ user คนนั้นๆ
      await Signinlogs.daleteSigninlogsByUidAndSession(dataUse?.User_id, _sessionid);

      // Redirect ไปที่หน้า login
      return res.redirect('/login');
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

exports.name = controllerName;