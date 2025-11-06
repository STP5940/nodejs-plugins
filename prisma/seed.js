// seed.js

// Administator: Super Admin (username: root, password: root)

// Company: MyCompany (username: company, password: root)
// Employee: supervisor (username: company@supervisor, password: root)
// Employee: engineer (username: company@engineer, password: root)
// Employee: driver (username: company@driver, password: root)

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require("bcrypt");

const Func = require("../app/Func");

const TM_Usersrole = require("../app/Models/TM_Usersrole");
const TM_Permissions = require("../app/Models/TM_Permissions");
const T_Users = require("../app/Models/T_Users");
const T_Company = require("../app/Models/T_Company");
const T_Employee = require("../app/Models/T_Employee");
const TM_UsersrolePermissions = require("../app/Models/TM_UsersrolePermissions");

const prisma = new PrismaClient();

async function seed() {
  try {

    const Usersrole = new TM_Usersrole();
    const Permissions = new TM_Permissions();
    const UsersrolePermissions = new TM_UsersrolePermissions();
    const Company = new T_Company();
    const Employee = new T_Employee();
    const Users = new T_Users();

    const passWord = 'root';
    const adminId = await Users.genId();
    const companyFirstId = await Users.genId(1);
    const userFirstId = await Users.genId(2);
    const userSecondId = await Users.genId(3);
    const userFourthId = await Users.genId(4);

    console.log('adminId: ', adminId);
    console.log('companyFirstId: ', companyFirstId);
    console.log('userFirstId: ', userFirstId);
    console.log('userSecondId: ', userSecondId);
    console.log('userFourthId: ', userFourthId);
    console.log('\r');

    const adminData = {
      userId: adminId,
      firstname: 'Super',
      lastname: 'Admin',
      userName: 'root',
      passWord: passWord,
      hashPassWord: await bcrypt.hash(passWord, parseInt(process.env.SALTROUNDS)),
      Twofactor_id: 'MNVXXGNT2FUXXEQUGIKXWAO5KUMR4AB3',
      Usersrole_id: 1,
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      lockUntil: null,
      active: true
    };

    const companyData = [
      {
        userId: companyFirstId,
        firstname: 'My',
        lastname: 'Company',
        userName: 'company',
        passWord: passWord,
        hashPassWord: await bcrypt.hash(passWord, parseInt(process.env.SALTROUNDS)),
        Twofactor_id: 'TQV5WJTEUCZHCYPSTKSSEF3CCQTA5IGU',
        Usersrole_id: 2,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockUntil: null,
        active: true
      },
      {
        userId: userFirstId,
        firstname: 'สมชาย',
        lastname: 'รักดี',
        userName: 'company@supervisor',
        passWord: passWord,
        hashPassWord: await bcrypt.hash(passWord, parseInt(process.env.SALTROUNDS)),
        Twofactor_id: '3DACOQWBDZPTVKLY3SXIHV6PWEOXPHHQ',
        Usersrole_id: 3,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockUntil: null,
        active: true
      },
      {
        userId: userSecondId,
        firstname: 'สมหมาย',
        lastname: 'หวานเจี๋ยบ',
        userName: 'company@engineer',
        passWord: passWord,
        hashPassWord: await bcrypt.hash(passWord, parseInt(process.env.SALTROUNDS)),
        Twofactor_id: '7TCLX3YJFCFHHSV7R6Y4BEWK63BEPPMK',
        Usersrole_id: 4,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockUntil: null,
        active: true
      },
      {
        userId: userFourthId,
        firstname: 'สมรัก',
        lastname: 'หวานใจ',
        userName: 'company@driver',
        passWord: passWord,
        hashPassWord: await bcrypt.hash(passWord, parseInt(process.env.SALTROUNDS)),
        Twofactor_id: 'MQTJYRAIMJMNIGDL7BWEQH6PYMBGZPA2',
        Usersrole_id: 5,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockUntil: null,
        active: true
      }
    ];

    const roleDate = new Date('2023-12-31T07:00:00.000');

    const roleData = [
      {
        Usersrole_id: 1,
        description: 'Administrator',
        core: true,
        priority: 1,
        created_at: roleDate,
        User_id: adminId,
      },
      {
        Usersrole_id: 2,
        description: 'Company Admin',
        core: true,
        priority: 2,
        created_at: roleDate,
        User_id: adminId,
      },
      {
        Usersrole_id: 3,
        description: 'Supervisor',
        core: true,
        priority: 3,
        created_at: roleDate,
        User_id: adminId,
      },
      {
        Usersrole_id: 4,
        description: 'Engineer',
        core: true,
        priority: 3,
        created_at: roleDate,
        User_id: adminId,
      },
      {
        Usersrole_id: 5,
        description: 'Driver',
        core: true,
        priority: 3,
        created_at: roleDate,
        User_id: adminId,
      },
    ];

    const permissionsDate = new Date('2023-12-31T07:00:00.000');

    const permissionsData = [
      {
        Permissions_id: 100,
        prefix: 'F',
        controller: 'DashboardController',
        name: 'แผงควบคุม',
        read: false,
        update: false,
        create: false,
        delete: false,
        companyonly: false,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 101,
        prefix: 'F',
        controller: 'SecurityController',
        name: 'ความปลอดภัย',
        read: true,
        update: true,
        create: false,
        delete: true,
        companyonly: false,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 102,
        prefix: 'F',
        controller: 'TwofactorController',
        name: 'ตั้งค่ายืนยันตัวตนสองชั้น',
        read: true,
        update: true,
        create: false,
        delete: false,
        companyonly: false,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 103,
        prefix: 'F',
        controller: 'ManageemployeesController',
        name: 'จัดการข้อมูลพนักงาน',
        read: true,
        update: true,
        create: true,
        delete: true,
        companyonly: true,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 104,
        prefix: 'F',
        controller: 'AccessrolesController',
        name: 'จัดการกลุ่มสมาชิก',
        read: true,
        update: true,
        create: true,
        delete: false,
        companyonly: true,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 105,
        prefix: 'F',
        controller: 'ProfilecompanyController',
        name: 'จัดการโปรไฟล์บริษัท',
        read: true,
        update: true,
        create: false,
        delete: false,
        companyonly: true,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 120,
        prefix: 'F',
        controller: 'LineconfigController',
        name: 'บัญชีแจ้งเตือน LINE Notify',
        read: true,
        update: true,
        create: false,
        delete: false,
        companyonly: true,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 200,
        prefix: 'R',
        controller: 'ReportController',
        name: 'ตัวอย่างรายงาน',
        read: true,
        update: false,
        create: false,
        delete: false,
        companyonly: false,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 300,
        prefix: 'F',
        controller: 'ManagecompanysController', // SuperAdmin
        name: 'จัดการข้อมูลบริษัท',
        read: true,
        update: true,
        create: true,
        delete: true,
        companyonly: false,
        created_at: permissionsDate,
      },
      {
        Permissions_id: 301,
        prefix: 'F',
        controller: 'AccesspermissionsController', // SuperAdmin
        name: 'จัดการรายชื่อเมนู',
        read: true,
        update: true,
        create: false,
        delete: false,
        companyonly: false,
        created_at: permissionsDate,
      },
    ];

    const companyRolePermissions = [
      {
        Usersrole_id: 2,      // Company Admin
        Permissions_id: 101,  // SecurityController
        read: true,
        update: true,
        create: false,
        delete: true,
      },
      {
        Usersrole_id: 2,      // Company Admin
        Permissions_id: 102,  // TwofactorController
        read: true,
        update: true,
        create: false,
        delete: false,
      },
      {
        Usersrole_id: 2,      // Company Admin
        Permissions_id: 103,  // ManageemployeesController
        read: true,
        update: true,
        create: true,
        delete: true,
      },
      {
        Usersrole_id: 2,      // Company Admin
        Permissions_id: 104,  // AccessrolesController
        read: true,
        update: true,
        create: true,
        delete: false,
      },
      {
        Usersrole_id: 2,      // Company Admin
        Permissions_id: 200,  // ReportController
        read: true,
        update: false,
        create: false,
        delete: false,
      },
      {
        Usersrole_id: 3,      // Supervisor
        Permissions_id: 101,  // SecurityController
        read: true,
        update: true,
        create: false,
        delete: true,
      },
      {
        Usersrole_id: 3,      // Supervisor
        Permissions_id: 102,  // TwofactorController
        read: true,
        update: true,
        create: false,
        delete: false,
      },
      {
        Usersrole_id: 5,      // Driver
        Permissions_id: 101,  // SecurityController
        read: true,
        update: true,
        create: false,
        delete: true,
      },
      {
        Usersrole_id: 5,      // Driver
        Permissions_id: 102,  // TwofactorController
        read: true,
        update: true,
        create: false,
        delete: false,
      },
    ];

    const profileCompany = [
      {
        User_id: companyFirstId,
        name: companyData[0]['lastname'],
        profile: '/app-assets/images/profile/user-uploads/tigc-logo.png',
        logoreport: '/app-assets/images/profile/user-uploads/CompanyLogo_785x200.png',
        phone: `086 ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
        nameTh: 'บริษัท ทดสอบระบบ (ประเทศไทย) จำกัด',
        nameEn: 'TEST SYSTEMS (THAILAND) CO., LTD',
        addressTh: '123/6 หมู่ที่ 1 ตำบลบางขุนกอง อำเภอบางกรวย จังหวัดนนทบุรี 11130',
        addressEn: '123/6 Moo. 1 T. Bangkhunkong A. Bang Kruai, Nonthaburi 11130',
        taxid: '0123456789000',
        website: 'www.company.com',
        fax: '023456789',
      }
    ];

    // ลบโปรไฟล์บริษัท
    await Company.hardDaleteAllCompany();

    await Employee.hardDaleteAllEmployee();

    // ลบรายการที่อ้างอิง userId ทั้งหมดก่อนถึงลบ tb หลัก Users
    await deleteTwofactorByUserId();
    await deleteSigninlogsByUserId();

    // ลบ tb หลัก Users
    await deleteUserByUserId();

    // ลบสิทธิการเข้าถึงเมนู
    await UsersrolePermissions.hardDaleteAllUsersrolePermissions();

    // ลบระดับการเข้าใช้งาน users
    await Usersrole.hardDaleteAllrole();

    // สร้างระดับการเข้าใช้งาน users
    await Usersrole.createUsersroleIfNotExists(roleData);

    // ลบ Permissions
    await Permissions.hardDaleteAllpermissions();

    // สร้าง Permissions
    await Permissions.createPermissionsIfNotExists(permissionsData);

    // สร้างสิทธิการเข้าถึงเมนู
    await UsersrolePermissions.createUsersrolePermissionsIfNotExists(companyRolePermissions);

    // Insert Admin
    const insertadminData = await insertUser(adminData);

    // Insert Admin Company
    const insertcompanyDataFirst = await insertUser(companyData[0]);

    // Insert User 1 supervisor
    const insertuserDataFirst = await insertUser(companyData[1]);
    // Insert User 2 engineer
    const insertuserDataSecond = await insertUser(companyData[2]);
    // Insert User 3 driver
    const insertuserDataFourth = await insertUser(companyData[3]);

    // สร้างโปรไฟล์บริษัท
    for (const company of profileCompany) {
      const createdCompany = await Company.createCompanyIfNotExists(company);

      console.log("\nCreate ExtCustomer ByComId: ", createdCompany.res.Company_id);

      // Company ชื่อ MyCompany ให้สร้าง UserMockup เข้าไป
      if (parseInt(createdCompany.res.User_id) == parseInt(companyData[0]['userId'])) {
        await Employee.createEmployeeIfNotExists({
          Company_id: createdCompany.res.Company_id,
          User_id: companyData[1]['userId'],
          profile: '/app-assets/images/profile/user-uploads/user-01.jpg',
          created_at: new Date('2023-12-31T07:00:00.000'),
        });

        await Employee.createEmployeeIfNotExists({
          Company_id: createdCompany.res.Company_id,
          User_id: companyData[2]['userId'],
          profile: '/app-assets/images/profile/user-uploads/user-02.jpg',
          created_at: new Date('2023-12-31T07:00:00.000'),
        });

        await Employee.createEmployeeIfNotExists({
          Company_id: createdCompany.res.Company_id,
          User_id: companyData[3]['userId'],
          profile: '/app-assets/images/profile/user-uploads/user-03.jpg',
          created_at: new Date('2023-12-31T07:00:00.000'),
        });
      }
    }

    console.log('\nAccount Admin inserted successfully.');
    console.log('Username:', insertadminData.Users.username);
    console.log('Password:', passWord);

    console.log('\nAccount Company 1 inserted successfully.');
    console.log('Username:', insertcompanyDataFirst.Users.username);
    console.log('Password:', passWord);

    console.log('\nAccount User 1 inserted successfully.');
    console.log('Username:', insertuserDataFirst.Users.username);
    console.log('Password:', passWord);

    console.log('\nAccount User 2 inserted successfully.');
    console.log('Username:', insertuserDataSecond.Users.username);
    console.log('Password:', passWord);

    console.log('\nAccount User 3 inserted successfully.');
    console.log('Username:', insertuserDataFourth.Users.username);
    console.log('Password:', passWord);

    const genKeyAndIv = Func.generateKeyAndIV();

    console.log("\nGenerate the key and IV, then add them to the .env file.");
    console.log(`SECURITY_KEY=${genKeyAndIv.key}`);
    console.log(`SECURITY_IV=${genKeyAndIv.iv}`);
  } catch (error) {
    console.error('Error inserting default data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function insertUser(_userData) {
  try {
    // ตรวจสอบให้แน่ใจว่าไม่มีผู้ใช้ที่มี User_id เดียวกันอยู่แล้ว
    const existingUser = await prisma.t_Users.findUnique({
      where: {
        User_id: _userData.userId,
      },
    });

    if (!existingUser) {
      // สร้างผู้ใช้ใหม่เมื่อไม่มีผู้ใช้ที่มี User_id เดียวกันอยู่แล้ว

      // Insert default user
      const createdUsers = await prisma.t_Users.create({
        data: {
          User_id: _userData.userId,
          Usersrole_id: _userData.Usersrole_id,
          firstname: (_userData.firstname ? _userData.firstname : faker.person.firstName()),
          lastname: (_userData.lastname ? _userData.lastname : faker.person.lastName()),
          username: _userData.userName,
          password: _userData.hashPassWord,
          mail: faker.internet.email(),
          mailconfirm: false,
          phone: `086 ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          lockUntil: null,
          active: _userData.active,
          created_at: new Date('2023-12-31T07:00:00.000'),
          updated_at: null,
          deleted_at: null,
        },
      });

      // console.log('Users created:', createdUsers);

      const createdTwofactor = await prisma.t_Twofactor.create({
        data: {
          Twofactor_id: _userData.Twofactor_id,
          active: false,
          signinaccount: false,
          changepassword: false,
          User_id: _userData.userId
        },
      });

      // console.log('Twofactor created:', createdTwofactor);
      return {
        Users: createdUsers,
        Twofactor: createdTwofactor
      };
    } else {
      console.log(`User with User_id: ${existingUser.User_id} already exists, skipping.`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle the error if needed
    return null; // Return null or any other value to indicate deletion failure
  }
}

async function deleteUserByUserId() {
  try {
    const deletedUser = await prisma.t_Users.deleteMany();
    console.log('Users deleted:', deletedUser);
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle the error if needed
    return null; // Return null or any other value to indicate deletion failure
  }
}

async function deleteTwofactorByUserId() {
  try {
    const deletedTwofactor = await prisma.t_Twofactor.deleteMany();
    console.log('Twofactor deleted:', deletedTwofactor);
    return deletedTwofactor;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle the error if needed
    return null; // Return null or any other value to indicate deletion failure
  }
}

async function deleteSigninlogsByUserId() {
  try {
    const deletedSigninlogs = await prisma.sYS_Signinlogs.deleteMany();
    console.log('Signinlogs deleted:', deletedSigninlogs);
    return deletedSigninlogs;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle the error if needed
    return null; // Return null or any other value to indicate deletion failure
  }
}

seed();
