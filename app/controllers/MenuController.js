// Filename: MenuController.js 
// Created time: 11-05-2024 10:18:38

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const T_Workinstruction = require("../Models/T_Workinstruction");
const T_Correctivemaintenance = require("../Models/T_Correctivemaintenance");
const T_Preventivemaintenance = require("../Models/T_Preventivemaintenance");

const { validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs');

const controllerName = path.parse(__filename).name;

const T_Users = require("../Models/T_Users");

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    // ดึงสิทธิในการเข้าถึงโมดูล ล่าสุด
    const Users = new T_Users();

    const Usersrole = await Users.getUserByUsername(req.session.username);
    const permissionsArray = Usersrole?.TM_Usersrole?.TM_UsersrolePermissions || [];
    const formattedPermissions = {};

    permissionsArray.forEach((item) => {
      const controllerName = item?.TM_Permissions?.controller;
      if (controllerName) {
        formattedPermissions[controllerName] = {
          read: item.read,
          update: item.update,
          create: item.create,
          delete: item.delete,
        };
      }
    });

    // เก็บสิทธิล่าสุดลง session['permission']
    req.session['permission'] = formattedPermissions;

    const dataUse = Authen.getSession(req);

    // ต้องเป็น Employee_id ระดับ users
    // ต้องมีสิทธิเข้าถึงโมดูล Workinstructionsdetail
    let workinstructionCount = 0;
    if (dataUse?.Employee_id && dataUse?.priority >= 3 && dataUse?.permission?.WorkinstructionsdetailController?.read) {

      // ดึงข้อมูล Workinstruction
      const Workinstruction = new T_Workinstruction();
      const Workinstructions = await Workinstruction.getAllWorkinstructionByEmpId(dataUse?.Employee_id, dataUse?.Company_id);
      workinstructionCount = (Workinstructions.length >= 100 ? '99+' : Workinstructions.length);
    }

    // ต้องเป็น Employee_id ระดับ users
    // ต้องมีสิทธิเข้าถึงโมดูล Correctivemaintenancedetail
    let correctiveCount = 0;
    if (dataUse?.Employee_id && dataUse?.priority >= 3 && dataUse?.permission?.CorrectivemaintenancedetailController?.read) {
      // ดึงข้อมูล Correctivemaintenance
      const Correctivemaintenance = new T_Correctivemaintenance();
      const Correctivemaintenances = await Correctivemaintenance.getAllCorrectivemaintenanceByEmpId(dataUse?.Employee_id, dataUse?.Company_id);
      correctiveCount = (Correctivemaintenances.length >= 100 ? '99+' : Correctivemaintenances.length);
    }

    // ต้องเป็น Employee_id ระดับ users
    // ต้องมีสิทธิเข้าถึงโมดูล Preventivemaintenancedetail
    let preventiveCount = 0;
    if (dataUse?.Employee_id && dataUse?.priority >= 3 && dataUse?.permission?.PreventivemaintenancedetailController?.read) {
      // ดึงข้อมูล Preventivemaintenance
      const Preventivemaintenance = new T_Preventivemaintenance();
      const Preventivemaintenances = await Preventivemaintenance.getAllPreventivemaintenanceByEmpId(dataUse?.Employee_id, dataUse?.Company_id);
      preventiveCount = (Preventivemaintenances.length >= 100 ? '99+' : Preventivemaintenances.length);
    }

    const pluginMenus = await loadAllPluginMenus();

    const data = {
      use: dataUse,
      translat: Func.getLanguage(dataUse?.language),
      workinstructionCount: workinstructionCount,
      correctiveCount: correctiveCount,
      preventiveCount: preventiveCount,
      pluginMenus: pluginMenus,
    };

    return res.render("Users/menu", data);

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
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

async function loadAllPluginMenus(pluginsDir = './plugins') {
  try {
    // อ่านรายชื่อโฟลเดอร์ทั้งหมดในไดเรกทอรี plugins
    const pluginFolders = fs.readdirSync(pluginsDir).filter(folder => {
      return fs.statSync(path.join(pluginsDir, folder)).isDirectory();
    });

    const menus = [];

    // ตรวจสอบแต่ละ plugin ว่ามีไฟล์ menu.json หรือไม่
    for (const folder of pluginFolders) {
      const menuPath = path.join(pluginsDir, folder, 'menu.json');

      if (fs.existsSync(menuPath)) {
        try {
          const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
          menus.push({
            plugin: folder,
            ...menuData
          });
        } catch (e) {
          console.error(`Error loading menu for ${folder}:`, e.message);
        }
      }
    }

    // เรียงลำดับเมนูตาม index จากน้อยไปมาก
    menus.sort((a, b) => a.index - b.index);
    return menus;
  } catch (e) {
    console.error('Error loading plugins:', e.message);
    return [];
  }
}


exports.name = controllerName;