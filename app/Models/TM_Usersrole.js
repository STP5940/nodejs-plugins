// FileName: TM_Usersrole.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Usersrole {

  // R => getAllUsersrole
  // C => createUsersroleIfNotExists
  // U => updateUsersroleByUid
  // D => hardDaleteAllrole

  async getAllUsersrole(_byUsersroleId, _byUserId) {
    try {

      let getUsersrole = []

      // Role Company
      if (_byUsersroleId == 2) {
        getUsersrole = await prisma.tM_Usersrole.findMany({
          where: {
            deleted_at: null,
            priority: {
              not: 1 // Administrator ไม่ต้องแสดง
            },
            OR: [
              { Usersrole_id: _byUsersroleId }, // กลุ่มที่ตัวเองอยู่ ไว้อ้างอิงว่า priority 4 เลือกอะไรได้บ้าง
              { priority: 3 },
              { User_id: _byUserId }
            ]
          },
          orderBy: {
            priority: 'asc'
          }
        });
      }

      // Role Administrator
      if (_byUsersroleId == 1) {
        getUsersrole = await prisma.tM_Usersrole.findMany({
          where: {
            deleted_at: null,
            priority: {
              not: 1 // Administrator ไม่ต้องแสดง
            }
          },
          orderBy: {
            priority: 'asc'
          }
        });
      }

      // Step 1: Extract User_id from the fetched roles
      const userIds = getUsersrole.map(role => role.User_id).filter(id => id !== null);

      // Step 2: Fetch related T_Users records
      const companys = await prisma.t_Company.findMany({
        where: {
          User_id: { in: userIds }
        }
      });

      // Step 3: Combine roles with their corresponding createdBy user details
      const rolesWithCreatedBy = getUsersrole.map(role => {
        return {
          ...role,
          createdBy: companys.find(user => user.User_id === role.User_id)
        };
      });

      return rolesWithCreatedBy;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole All Failed');
    }
  }

  async getUsersroleCore(_prioritys = [1, 2, 3]) {
    try {

      let getUsersrole = [];

      getUsersrole = await prisma.tM_Usersrole.findMany({
        where: {
          deleted_at: null,
          core: true,
          priority: { in: _prioritys },
        },
        include: {
          T_Users: {
            take: 5,
            include: {
              T_Employee: true,
              T_Company: true
            }
          }
        },
        orderBy: {
          priority: 'asc'
        }
      });

      // Step 1: Extract User_id from the fetched roles
      const userIds = getUsersrole.map(role => role.User_id).filter(id => id !== null);

      const uniqueUserIds = [...new Set(userIds)];

      // Step 2: Fetch related T_Users records
      const companys = await prisma.t_Company.findMany({
        where: {
          User_id: { in: uniqueUserIds }
        },
        select: {
          User_id: true,
          name: true
        }
      });

      // Step 3: Combine roles with their corresponding createdBy user details
      const rolesWithCreatedBy = getUsersrole.map(role => {
        return {
          ...role,
          createdBy: companys.find(user => user.User_id === role.User_id)
        };
      });

      return rolesWithCreatedBy;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole All Failed');
    }
  }

  async getAllUsersroleSub() {
    try {

      let getUsersrole = [];

      getUsersrole = await prisma.tM_Usersrole.findMany({
        where: {
          deleted_at: null,
          core: false,
        },
        orderBy: {
          priority: 'asc'
        }
      });

      // Step 1: Extract User_id from the fetched roles
      const userIds = getUsersrole.map(role => role.User_id).filter(id => id !== null);

      // Step 2: Fetch related T_Users records
      const companys = await prisma.t_Company.findMany({
        where: {
          User_id: { in: userIds }
        },
        select: {
          User_id: true,
          name: true
        }
      });

      const users = await prisma.t_Users.findMany({
        where: {
          User_id: { in: userIds }
        },
        select: {
          User_id: true,
          Usersrole_id: true
        }
      });

      // Step 3: Combine roles with their corresponding createdBy user details
      const rolesWithCreatedBy = getUsersrole.map(role => {
        return {
          ...role,
          createdBy: companys.find(user => user.User_id === role.User_id),
          bosCompany: users.find(user => user.User_id === role.User_id)
        };
      });

      return rolesWithCreatedBy;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole All Failed');
    }
  }

  async getUsersroleSubByUid(_userId) {
    try {

      let getUsersrole = [];

      getUsersrole = await prisma.tM_Usersrole.findMany({
        where: {
          deleted_at: null,
          core: false,
          User_id: _userId,
        },
        orderBy: {
          priority: 'asc'
        }
      });

      // Step 1: Extract User_id from the fetched roles
      const userIds = getUsersrole.map(role => role.User_id).filter(id => id !== null);

      // Step 2: Fetch related T_Users records
      const companys = await prisma.t_Company.findMany({
        where: {
          User_id: { in: userIds }
        },
        select: {
          User_id: true,
          name: true
        }
      });

      const users = await prisma.t_Users.findMany({
        where: {
          User_id: { in: userIds }
        },
        select: {
          User_id: true,
          Usersrole_id: true
        }
      });

      // Step 3: Combine roles with their corresponding createdBy user details
      const rolesWithCreatedBy = getUsersrole.map(role => {
        return {
          ...role,
          createdBy: companys.find(user => user.User_id === role.User_id),
          bosCompany: users.find(user => user.User_id === role.User_id)
        };
      });

      return rolesWithCreatedBy;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole All Failed');
    }
  }

  async createUsersroleIfNotExists(_Usersroles = []) {

    const existingUsersroles = await prisma.tM_Usersrole.findMany({
      where: {
        OR:
          _Usersroles
      }
    });

    // ลบรายการที่มีแล้วในฐานข้อมูลออกจาก List ที่ต้องการเพิ่ม
    _Usersroles = _Usersroles.filter(Usersrole => {
      return !existingUsersroles.some(existingUsersrole =>
        Object.keys(Usersrole).every(key =>
          existingUsersrole[key] === Usersrole[key]
        )
      );
    });

    // สร้างแค่รายการที่ไม่มีใน Lists
    const createdUsersrole = await prisma.tM_Usersrole.createMany({
      data: _Usersroles
    });

    console.log(`Usersrole data ${createdUsersrole.count} rows inserted`);
  }

  async updateUsersroleByUid(_roleId, _description, _byUsersroleId, _byUserId) {
    try {

      // console.log(_byUsersroleId);
      // console.log(_byUserId);
      // console.log(_description);

      let updatedUsersrole = []

      // Role Company
      if (_byUsersroleId == 2) {
        // Update the Usersrole's column
        updatedUsersrole = await prisma.tM_Usersrole.update({
          where: {
            deleted_at: null,
            User_id: _byUserId,
            Usersrole_id: parseInt(_roleId),
          },
          data: {
            description: _description,
          }
        });
      }

      // Role Administrator
      if (_byUsersroleId == 1) {
        // Update the Usersrole's column
        updatedUsersrole = await prisma.tM_Usersrole.update({
          where: {
            Usersrole_id: parseInt(_roleId),
            deleted_at: null,
          },
          data: {
            description: _description,
          }
        });
      }

      return updatedUsersrole;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Usersrole Failed');
    }
  }

  async hardDaleteAllrole() {
    try {

      const daletedRole = await prisma.tM_Usersrole.deleteMany();

      console.log('Role deleted:', daletedRole);
      return daletedRole;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Role All Failed');
    }
  }


  //-------------------------------------------
  // ฟังก์ชั่นอื่นๆ ที่ทำงานร่วมกับ CRUD
  //-------------------------------------------

  /**
   * ฟังก์ชันนี้จะสร้าง ID ใหม่โดยอิงตามวันที่ปัจจุบัน
   * 
   * @param {number} _addCurrentId - ค่าที่จะเพิ่มเข้าใน ID ล่าสุด (ค่าดีฟอลต์คือ 1)
   * @returns {Promise<string>} - คืนค่า ID ใหม่ในรูปแบบสตริง.
   * @throws จะส่งข้อผิดพลาดหากมีปัญหาในการสร้างหรือเรียกข้อมูล ID.
   */
  async genId(_addCurrentId = 1) {

    try {
      // ใช้ Prisma เพื่อค้นหา Users_id ที่ตรงกับรูปแบบ tmpSearch
      const result = await prisma.tM_Usersrole.findMany({
        orderBy: {
          Usersrole_id: 'desc',
        },
        take: 1,
      });

      let sAutoid;

      if (result.length > 0) {
        sAutoid = parseInt(result[0].Usersrole_id?.toString()) + _addCurrentId
      } else {
        sAutoid = 1;
      }

      return sAutoid;
    } catch (error) {
      // console.error('Error generating ID:', error);
      // throw error;
      console.error('Error:', error);
      throw new Error('Create GeneratingID Failed');
    } finally {
      await prisma.$disconnect();
    }
  }

}

module.exports = TM_Usersrole;
