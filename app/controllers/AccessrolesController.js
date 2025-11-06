// Filename: AccessrolesController.js 
// Created time: 24-05-2024 13:02:21

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

const T_Company = require("../Models/T_Company");
const TM_Usersrole = require("../Models/TM_Usersrole");
const TM_Permissions = require("../Models/TM_Permissions");
const TM_UsersrolePermissions = require("../Models/TM_UsersrolePermissions");

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
// Code After Optimize Speed...
exports.index = async function (req, res, next) {
  try {
    const dataUse = Authen.getSession(req);

    // Ensure dataUse exists
    if (!dataUse) {
      return res.status(401).render("erroruser", {
        error: {
          status: 401,
          theme: 'Authentication',
          message: 'User session not found'
        }
      });
    }

    const isAdministrator = [1].includes(dataUse.priority);

    const Usersrole = new TM_Usersrole();
    const Permissions = new TM_Permissions();
    const UsersrolePermissions = new TM_UsersrolePermissions();

    // Safe role fetching
    let CoreRoles = [];
    let SubRoles = [];
    let permissionsData = [];

    try {
      if (isAdministrator) {
        // ดึงข้อมูลกรณีเป็น SuperAdmin
        [permissionsData, CoreRoles, SubRoles,] = await Promise.all([
          Permissions.getPermissionsHaveActive(),
          Usersrole.getUsersroleCore([2, 3]),
          Usersrole.getAllUsersroleSub(),
        ]);
      } else {
        // ดึงข้อมูลกรณีเป็น CompanyAdmin
        [permissionsData, CoreRoles, SubRoles,] = await Promise.all([
          Permissions.getPermissionsHaveActiveByUsersroleId(dataUse?.Usersrole_id), // ดึงแค่เมนูที่ Company นั้นมีสิทธิเข้าถึง
          Usersrole.getUsersroleCore([3]),
          Usersrole.getUsersroleSubByUid(dataUse.User_id),
        ]);
      }
    } catch (roleError) {
      console.error('Error fetching roles:', roleError);
      CoreRoles = [];
      SubRoles = [];
    }

    const CorePrmissionsActive = permissionsData;
    const SubPrmissionsActive = CorePrmissionsActive;

    // Safe permission processing function
    const processRoles = async (roles, permissionsActive) => {
      if (!roles || !Array.isArray(roles)) return [];

      const rolesAndPermissions = [];

      for (const role of roles) {
        if (!role || !role.Usersrole_id) continue;

        const updatedPermissions = [];

        for (const perm of permissionsActive) {
          if (!perm || !perm.Permissions_id) continue;

          let checkedPermissions = null;
          try {
            checkedPermissions = await UsersrolePermissions.getUsersrolePermissionsByroleIdAndpermissionsId(
              role.Usersrole_id,
              perm.Permissions_id
            );
          } catch (permError) {
            console.error('Error checking permissions:', permError);
            continue;
          }

          // Ensure all properties exist with default values
          const processedPerm = {
            Permissions_id: perm.Permissions_id || null,
            prefix: perm.prefix || '',
            name: perm.name || '',
            controller: perm.controller || '',
            companyonly: perm.companyonly || false,

            disabledRead: (role?.core ? (isAdministrator ? !perm.read : true) : !perm.read),
            disabledUpdate: (role?.core ? (isAdministrator ? !perm.update : true) : !perm.update),
            disabledCreate: (role?.core ? (isAdministrator ? !perm.create : true) : !perm.create),
            disabledDelete: (role?.core ? (isAdministrator ? !perm.delete : true) : !perm.delete),

            checkedRead: (isAdministrator && !perm.read ? false : checkedPermissions?.read || false),
            checkedUpdate: (isAdministrator && !perm.update ? false : checkedPermissions?.update || false),
            checkedCreate: (isAdministrator && !perm.create ? false : checkedPermissions?.create || false),
            checkedDelete: (isAdministrator && !perm.delete ? false : checkedPermissions?.delete || false),
          };

          // Filter conditions
          if (role.priority == 2 || processedPerm.companyonly == false) {
            updatedPermissions.push(processedPerm);
          }
        }

        rolesAndPermissions.push({
          ...role,
          prmissions: updatedPermissions
        });
      }

      return rolesAndPermissions;
    };

    // Process roles with error handling
    let CoreRolesAndprmissions = [];
    let SubRolesAndprmissions = [];

    // ดึงรายการ accessRoles ไว้รอใน Cache
    // ใช้การดึงข้อมูลใน Cache แทนถ้ามีข้อมูลแล้ว
    const getCacheBycompanyId = `getAccessrolesByComId_${isAdministrator ? 'Administrator' : dataUse?.Company_id}`;
    [CoreRolesAndprmissions, SubRolesAndprmissions] = await Func.getCache(getCacheBycompanyId, async () => {
      try {
        const [coreRoles, subRoles] = await Promise.all([
          processRoles(CoreRoles, CorePrmissionsActive),
          processRoles(SubRoles, SubPrmissionsActive),
        ]);
        return [coreRoles, subRoles];
      } catch (processError) {
        console.error('Error processing roles:', processError);
        throw processError; // Re-throw to handle in outer catch
      }
    });

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      encryptText: Func.encryptText,
      rolesCore: CoreRolesAndprmissions,
      rolesSub: SubRolesAndprmissions,
    };

    return res.render("Users/accessroles", data);

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

    const Permissions = new TM_Permissions();
    const UsersrolePermissions = new TM_UsersrolePermissions();

    const prmissionsActive = await Permissions.getPermissionsHaveActive();

    // เอาแค่ที่ไม่ใช้เฉพาะบริษัทที่ใช้งานได้
    const filteredPermissions = prmissionsActive.filter(permission => permission.companyonly === false);

    // เช็คว่าไม่ใช้แอดมิน priority มากกว่า 1
    if (dataUse?.priority > 1) {
      const companyPrmissions = await UsersrolePermissions.getUsersrolePermissionsByUsersroleId(dataUse?.Usersrole_id);

      // Create a map for quick lookup
      const companyPrmissionsMap = new Map();
      for (const perm of companyPrmissions) {
        companyPrmissionsMap.set(perm.Permissions_id, perm);
      }

      // Update prmissions with companyPrmissions
      const updatedPrmissions = filteredPermissions.filter(perm => {
        const matchingCompanyPerm = companyPrmissionsMap.get(perm.Permissions_id);
        if (matchingCompanyPerm) {
          perm.read = matchingCompanyPerm.read;
          perm.update = matchingCompanyPerm.update;
          perm.create = matchingCompanyPerm.create;
          perm.delete = matchingCompanyPerm.delete;

          if (!perm.read && !perm.update && !perm.create && !perm.delete) {
            return false; // ลบรายการที่ปิดการเข้าถึงทั้งหมดออก
          }

          return true;
        } else {
          return false;
        }
      });

      // กำหนเค่าใหม่ลง prmissions
      filteredPermissions.length = 0; // Clear the array
      filteredPermissions.push(...updatedPrmissions); // Add the updated items
    }

    const data = {
      use: dataUse,
      messages: req.flash(),
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language),
      prmissions: filteredPermissions,
    };

    return res.render("Users/accessroles/create", data);
    // return res.send("create");

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

    const Company = new T_Company();
    const Usersrole = new TM_Usersrole();
    const UsersrolePermissions = new TM_UsersrolePermissions();

    const { new_description, new_permissions } = req.body;

    let OBJpermissions = JSON.parse(new_permissions);

    const UsersroleGenId = await Usersrole.genId();

    const roleData = [
      {
        Usersrole_id: UsersroleGenId,
        description: new_description,
        core: (dataUse?.priority == 1 ? true : false),
        priority: (dataUse?.priority == 1 ? 3 : 4),
        created_at: Func.formatDateSave(new Date()),
        User_id: dataUse?.User_id,
      },
    ];

    // สร้างระดับการเข้าใช้งาน users (สร้างกลุ่มใหม่)
    await Usersrole.createUsersroleIfNotExists(roleData);

    // กำหนดสิทธิเข้ากลุ่มที่สร้างใหม่
    const createPromises = [];
    for (const Permissions_id in OBJpermissions) {
      const permission = OBJpermissions[Permissions_id];

      const roleCreatePermission = true;

      // เช็คว่าไม่ใช้แอดมิน priority มากกว่า 1
      if (dataUse?.priority > 1) {
        // ตรงนี้ควรเช็คด้วยว่า rolePermissionData ที่รับเข้ามา มีสิทธิสร้างตามที่ส่งเข้ามา ใช้หรือไม่ (ตามลำดับ)
        // 1. เช็คว่า เมนูเปิดใช้สิทธิใหม
        // 2. เช็คว่า company มีสิทธิใหม
        // 4. เก็บค่า boolean ลงตัวแปร roleCreatePermission
      }

      if (roleCreatePermission) {
        createPromises.push(
          UsersrolePermissions.createUsersrolePermissionsIfNotExists([
            {
              Usersrole_id: parseInt(UsersroleGenId),
              Permissions_id: parseInt(Permissions_id),
              read: permission?.Read,
              update: permission?.Update,
              create: permission?.Create,
              delete: permission?.Delete,
            }
          ])
        );
      }
    }

    await Promise.all(createPromises);  // ดำเนินการสร้างทั้งหมดแบบขนาน

    // ลบแคช KeyName: getAccessrolesByComId_
    const isAdministrator = [1].includes(dataUse.priority);
    const getCacheBycompanyId = `getAccessrolesByComId_${isAdministrator ? 'Administrator' : dataUse?.Company_id}`;
    Func.deleteCache(getCacheBycompanyId);

    // ถ้าเป็น Administrator ลบแคช Accessroles ของทุกบริษัท
    if (isAdministrator) {
      // ลบ Cache พร้อมกันแบบ Async
      const Companys = await Company.getAllCompany();
      const companyIds = Companys.map(company => company.Company_id);
      await Promise.all(
        companyIds.map(companyId =>
          Func.deleteCache(`getAccessrolesByComId_${companyId}`)
        )
      );
    }

    return res.status(200).json({
      status: true,
      token: res.locals.csrfToken,
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
// router.post('/user/accessroles/update', usersAuth, tokenSubmit, AccessrolesController.update);
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
    });
  }

  try {

    const Company = new T_Company();
    const Usersrole = new TM_Usersrole();
    const UsersrolePermissions = new TM_UsersrolePermissions();

    const {
      _usersroleId,
      new_description, new_permissions
    } = req.body;

    let OBJpermissions = JSON.parse(new_permissions);

    const usersroleIdDecrypt = Func.decryptText(_usersroleId);

    // อัปเดทข้อมูล Role
    await Usersrole.updateUsersroleByUid(usersroleIdDecrypt, new_description, dataUse?.Usersrole_id, dataUse?.User_id);

    // กำหนดสิทธิเข้ากลุ่ม
    const updatePromises = [];
    for (const Permissions_id in OBJpermissions) {
      const permission = OBJpermissions[Permissions_id];

      updatePromises.push(
        UsersrolePermissions.updateUsersrolePermissionsById(
          parseInt(usersroleIdDecrypt),
          parseInt(Permissions_id),
          {
            read: permission?.Read,
            update: permission?.Update,
            create: permission?.Create,
            delete: permission?.Delete,
          }
        )
      );
    }

    await Promise.all(updatePromises); // ดำเนินการอัปเดตทั้งหมดแบบขนาน

    // ลบแคช KeyName: getAccessrolesByComId_
    const isAdministrator = [1].includes(dataUse.priority);
    const getCacheBycompanyId = `getAccessrolesByComId_${isAdministrator ? 'Administrator' : dataUse?.Company_id}`;
    Func.deleteCache(getCacheBycompanyId);

    // ถ้าเป็น Administrator ลบแคช Accessroles ของทุกบริษัท
    if (isAdministrator) {
      // ลบ Cache พร้อมกันแบบ Async
      const Companys = await Company.getAllCompany();
      const companyIds = Companys.map(company => company.Company_id);
      await Promise.all(
        companyIds.map(companyId =>
          Func.deleteCache(`getAccessrolesByComId_${companyId}`)
        )
      );
    }

    return res.status(200).json({
      status: true,
      message: "success",
    });

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