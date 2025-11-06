// Filename: ManagecompanysController.js 
// Created time: 13-05-2024 13:00:10

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const T_Users = require("../Models/T_Users");
const T_Company = require("../Models/T_Company");
const T_Employee = require("../Models/T_Employee");
const T_Twofactor = require("../Models/T_Twofactor");

const { validationResult } = require("express-validator");
const twofactor = require("node-2fa");
const bcrypt = require("bcrypt");
const path = require('path');

const controllerName = path.parse(__filename).name;

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const Company = new T_Company();
    const Employee = new T_Employee();

    const Companys = await Company.getAllCompany();

    const companiesWithEmployees = await Promise.all(
      Companys.map(async (company) => {
        let employeeDetails = await Employee.getAllEmployeeByComId(company.Company_id);
        const countEmployee = (employeeDetails.length > 5 ? employeeDetails.length - 5 : 0);

        employeeDetails = employeeDetails.slice(0, 5);
        return {
          ...company,
          employeeDetails,
          countEmployee,
        };
      })
    );

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
      companys: companiesWithEmployees,
    };

    return res.render("Users/managecompanys", data);

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

    return res.send("show");

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

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.render("Users/managecompanys/create", data);

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

  const dataUse = Authen.getSession(req);
  const translat = await Func.getLanguage(dataUse?.language);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((message, error) => {
      message[error.msg] = translat[error.msg];
      return message;
    }, {});

    return res.status(400).json({
      status: false,
      error: errorMessages,
      token: res.locals.csrfToken,
    });
  }

  try {

    const {
      new_companyname, new_profile, new_companyphone,
      new_mail, new_phone, new_username, new_password,
      new_active
    } = req.body;

    const Users = new T_Users();
    const Company = new T_Company();
    const Twofactor = new T_Twofactor();

    const UserGenId = await Users.genId();
    const Secretkey = twofactor.generateSecret({ name: `${process.env.WEBSITENAME}`, account: dataUse.username });

    const createdUser = await Users.createUserIfNotExists({
      User_id: UserGenId,
      Usersrole_id: 2,
      firstname: 'Company',
      password: await bcrypt.hash(new_password, parseInt(process.env.SALTROUNDS)),
      mail: new_mail,
      lastname: new_companyname,
      username: new_username,
      phone: new_phone,
      active: (new_active === 'true'),
    });

    // สร้าง user ไม่สำเร็จพบข้อมูลซ้ำ
    if (createdUser.status == false) {
      const errorObject = {
        status: false,
        token: res.locals.csrfToken,
        error: {}
      };

      const { DupMailCount, DupUsername } = createdUser.res;
      const { _error_mail_already, _error_username_already } = translat;

      if (DupMailCount && _error_mail_already) {
        errorObject.error['_error_mail_already'] = _error_mail_already;
      }

      if (DupUsername && _error_username_already) {
        errorObject.error['_error_username_already'] = _error_username_already;
      }

      return res.status(409).json(errorObject);
    }

    // สร้าง user สำเร็จทำการสร้าง 2FA และ Company
    await Promise.all([
      Twofactor.createTwofactorIfNotExists(UserGenId, Secretkey?.secret),

      Company.createCompanyIfNotExists({
        User_id: UserGenId,
        name: new_companyname,
        phone: new_companyphone,
        profile: new_profile,
      }),
    ]);

    return res.status(200).json({
      status: true,
      token: res.locals.csrfToken,
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
      token: res.locals.csrfToken,
    });
  }
};

// edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/:_id/edit', usersAuth, DemoController.edit);
exports.edit = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const companyIdDecrypt = parseInt(Func.decryptText(req.params?._id));

    if (isNaN(companyIdDecrypt)) {
      return res.status(400).render("erroruser", {
        error: {
          status: 400,
          message: "Invalid request: Unable to process the provided ID.",
        }
      });
    }

    const Company = new T_Company();

    const companyProfile = await Company.getCompanyById(companyIdDecrypt);

    if (companyProfile) {

      const data = {
        use: dataUse,
        messages: req.flash(),
        controllerName: controllerName,
        translat: Func.getLanguage(dataUse?.language),
        encryptText: Func.encryptText,
        company: companyProfile,
      };

      return res.render("Users/managecompanys/edit", data);
    }

    return res.redirect('/user/managecompanys');
  } catch ({ name, message, theme }) {
    res.status(500).render("erroruser", {
      error: {
        status: 500,
        theme: theme,
        message: message,
      }
    });
    // res.status(500).json({
    //   status: false,
    //   message: message,
    // });
  }
};

// update แก้ไขข้อมูล
// router.post('/user/demo/update', usersAuth, tokenSubmit, DemoController.update);
exports.update = async function (req, res, next) {

  const dataUse = Authen.getSession(req);
  const translat = await Func.getLanguage(dataUse?.language);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((message, error) => {
      message[error.msg] = translat[error.msg];
      return message;
    }, {});

    return res.status(400).json({
      status: false,
      error: errorMessages,
      token: res.locals.csrfToken,
    });
  }

  try {

    const Users = new T_Users();
    const Company = new T_Company();

    const {
      _companyId, _userId,
      new_companyname, new_profile, new_companyphone,
      new_mail, new_phone, new_active
    } = req.body;

    const companyIdDecrypt = parseInt(Func.decryptText(_companyId));
    const userIdDecrypt = parseInt(Func.decryptText(_userId));

    const companyProfile = await Company.getCompanyById(companyIdDecrypt);

    if (companyProfile) {
      // อัปเดท user และ Company
      await Promise.all([
        Users.updateUserById(userIdDecrypt, {
          lastname: new_companyname,
          mail: (companyProfile.T_Users.mailconfirm ? companyProfile.T_Users.mail : new_mail),
          phone: new_phone,
          active: Func.isTrue(new_active),
        }),

        Company.updateCompanyById(companyIdDecrypt, {
          name: new_companyname,
          profile: new_profile,
          phone: new_companyphone,
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "success",
      });
    }

    return res.status(404).json({
      status: false,
      message: "Update Company Not Found",
    });
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
      token: res.locals.csrfToken,
    });
  }
};

// delete ลบข้อมูล
// router.get('/user/demo/:_id/destroy', usersAuth, DemoController.destroy);
exports.destroy = async function (req, res, next) {
  try {

    const companyIdDecrypt = parseInt(Func.decryptText(req.params?._id));

    if (isNaN(companyIdDecrypt)) {
      return res.status(400).render("erroruser", {
        error: {
          status: 400,
          message: "Invalid request: Unable to process the provided ID.",
        }
      });
    }

    const Users = new T_Users();
    const Company = new T_Company();

    const companyProfile = await Company.getCompanyById(companyIdDecrypt);

    if (companyProfile) {

      const userId = companyProfile?.T_Users?.User_id;

      // ลบข้อมูล user และ Company
      await Promise.all([
        Users.deleteUserById(userId),
        Company.deleteCompanyById(companyIdDecrypt),
      ]);

      return res.status(200).json({
        status: true,
        message: "success",
      });
    }

    return res.status(404).json({
      status: false,
      message: "Delete User Not Found",
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
      token: res.locals.csrfToken,
    });
  }
};

// twofactorclose ปิดใช้งาน 2FA
exports.twofactorclose = async function (req, res, next) {
  try {

    const companyIdDecrypt = parseInt(Func.decryptText(req.params?._id));

    if (isNaN(companyIdDecrypt)) {
      return res.status(400).render("erroruser", {
        error: {
          status: 400,
          message: "Invalid request: Unable to process the provided ID.",
        }
      });
    }

    const Company = new T_Company();
    const Twofactor = new T_Twofactor();

    const companyProfile = await Company.getCompanyById(companyIdDecrypt);

    if (companyProfile) {

      const userId = companyProfile?.T_Users?.User_id;

      // ลบข้อมูล Twofactor
      await Promise.all([
        Twofactor.deleteTwofactorByUid(userId)
      ]);

      return res.status(200).json({
        status: true,
        message: "success",
      });
    }

    return res.status(404).json({
      status: false,
      message: "Delete User Not Found",
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
      token: res.locals.csrfToken,
    });
  }
};

// resetpassword แอดมินบริษัท
exports.resetpassword = async function (req, res, next) {

  const dataUse = Authen.getSession(req);
  const translat = await Func.getLanguage(dataUse?.language);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((message, error) => {
      message[error.msg] = translat[error.msg];
      return message;
    }, {});

    return res.status(400).json({
      status: false,
      error: errorMessages,
    });
  }

  try {

    const Users = new T_Users();

    const {
      _userId,
      new_password
    } = req.body;

    const userIdDecrypt = Func.decryptText(_userId);

    const newPassword = await bcrypt.hash(new_password, parseInt(process.env.SALTROUNDS));

    // อัปเดทข้อมูลรหัสผ่าน
    await Users.updateUserById(userIdDecrypt, {
      password: newPassword,
    });

    return res.status(200).json({
      status: true,
      message: "success",
    });

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
      token: res.locals.csrfToken,
    });
  }
};

exports.name = controllerName;