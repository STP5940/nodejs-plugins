const Storetokens = require("@app/Storetokens");
const Authen = require("@app/Authen");
const Func = require("@root/app/Func");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

// index แสดงข้อมูลทั้งหมด
// permission: read
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
    };

    return res.render("Users/template", data);
    // return res.send("index");

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
// permission: read
// router.get('/user/demo/:_id/show', usersAuth, DemoController.show);
exports.show = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
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
// permission: create
// router.get('/user/demo/create', usersAuth, DemoController.create);
exports.create = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
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
// permission: create
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
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
    };

    return res.send("store");

    // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
    // return res.status(200).json({
    //   status: true,
    //   message: "success",
    // });

  } catch ({ name, message, theme }) {
    res.status(500).render("erroruser", {
      error: {
        status: 500,
        theme: theme,
        message: message,
      }
    });

    // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
    // res.status(500).json({
    //   status: false,
    //   message: message,
    // });
  }
};

// edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
// permission: update
// router.get('/user/demo/:_id/edit', usersAuth, DemoController.edit);
exports.edit = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
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
// permission: update
// router.post('/user/demo/update', usersAuth, tokenSubmit, DemoController.update);
exports.update = async function (req, res, next) {

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
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
    };

    return res.send("update");

    // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
    // return res.status(200).json({
    //   status: true,
    //   message: "success",
    // });

  } catch ({ name, message, theme }) {
    res.status(500).render("erroruser", {
      error: {
        status: 500,
        theme: theme,
        message: message,
      }
    });

    // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
    // res.status(500).json({
    //   status: false,
    //   message: message,
    // });
  }
};

// delete ลบข้อมูล
// permission: delete
// router.get('/user/demo/:_id/destroy', usersAuth, DemoController.destroy);
exports.destroy = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
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