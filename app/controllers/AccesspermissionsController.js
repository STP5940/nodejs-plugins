// Filename: AccesspermissionsController.js 
// Created time: 24-05-2024 15:21:26

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const TM_Permissions = require("../Models/TM_Permissions");
const TM_UsersrolePermissions = require("../Models/TM_UsersrolePermissions");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    const Permissions = new TM_Permissions();
    const prmissionsAll = await Permissions.getAllPermissions()

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      formatDateTimeThai: Func.formatDateTimeThai,
      encryptText: Func.encryptText,
      prmissions: prmissionsAll
    };

    return res.render("Users/accesspermissions", data);

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

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.send("show");

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

// create บันทึกข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/create', usersAuth, DemoController.create);
exports.create = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.send("create");

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

  // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Error message ไปให้เลย
  // const dataUse = Authen.getSession(req);
  // const translat = await Func.getLanguage(dataUse?.language);

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const errorMessages = errors.array().reduce((message, error) => {
  //     message[error.msg] = translat[error.msg];
  //     return message;
  //   }, {});

  //   return res.status(400).json({
  //     status: false,
  //     error: errorMessages,
  //     token: res.locals.csrfToken,
  //   });
  // }

  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.send("store");

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

// edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/:_id/edit', usersAuth, DemoController.edit);
exports.edit = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.send("edit");

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

// update แก้ไขข้อมูล
// router.post('/user/demo/update', usersAuth, tokenSubmit, DemoController.update);
exports.update = async function (req, res, next) {

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const errorMessages = errors.array().map(error => error.msg);
  //   req.flash("error", errorMessages);
  //   // return res.redirect('/user/demo');
  //   return res.send(errorMessages);
  // }

  // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Error message ไปให้เลย
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

    // const dataUse = Authen.getSession(req);

    const Permissions = new TM_Permissions();
    const UsersrolePermissions = new TM_UsersrolePermissions();

    const {
      _permissionsId,
      new_Controller, new_Name, new_Companyonly,
      new_Read, new_Update, new_Create, new_Delete
    } = req.body;

    const permissionsIdDecrypt = parseInt(Func.decryptText(_permissionsId));

    const permissionsData = {
      controller: new_Controller,
      companyonly: Func.isTrue(new_Companyonly),
      name: new_Name,
      create: Func.isTrue(new_Create),
      read: Func.isTrue(new_Read),
      update: Func.isTrue(new_Update),
      delete: Func.isTrue(new_Delete),
    }

    Permissions.updatePermissionsById(permissionsIdDecrypt, permissionsData);

    UsersrolePermissions.updateUsersrolePermissionsBypermissionsId(permissionsIdDecrypt, {
      create: false,
      read: false,
      update: false,
      delete: false,
    });

    return res.status(200).json({
      status: true,
      message: "success",
    });

  } catch ({ name, message, theme }) {
    // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
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

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.send("destroy");

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

exports.name = controllerName;