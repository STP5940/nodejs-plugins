// FileName: TM_Permissions.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Permissions {

  // R => getAllPermissions Or getPermissionsHaveActive
  // C => createPermissionsIfNotExists
  // U => updatePermissionsById
  // D => 

  async getAllPermissions() {
    try {
      const getAllPermissions = await prisma.tM_Permissions.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          Permissions_id: 'asc'
        }
      });

      return getAllPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Permissions Failed');
    }
  }

  async getPermissionsHaveActive() {
    try {
      const getAllPermissions = await prisma.tM_Permissions.findMany({
        where: {
          deleted_at: null,
          Permissions_id: {
            lt: 300 // lt = less than (<)
          },
          OR: [
            { read: { not: false } },
            { update: { not: false } },
            { create: { not: false } },
            { delete: { not: false } },
          ],
        }
      });

      return getAllPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Permissions Failed');
    }
  }

  async getPermissionsHaveActiveByUsersroleId(_usersroleId) {
    try {
      const permissions = await prisma.tM_Permissions.findMany({
        where: {
          deleted_at: null,
          // ตรวจสอบว่ามี Permission อย่างน้อย 1 action (read, update, create, delete) เป็น true
          OR: [
            { read: true },
            { update: true },
            { create: true },
            { delete: true }
          ],
          // ตรวจสอบว่า Permission นี้ถูกกำหนดให้กับ Usersrole_id กลุ่มที่ระบุ
          // และตรวจสอบว่ามี Permission อย่างน้อย 1 action (read, update, create, delete) เป็น true
          TM_UsersrolePermissions: {
            some: {
              Usersrole_id: _usersroleId,
              OR: [
                { read: true },
                { update: true },
                { create: true },
                { delete: true }
              ]
            }
          }
        },
        include: {
          TM_UsersrolePermissions: {
            where: {
              Usersrole_id: _usersroleId,
            }
          }
        }
      });

      return permissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Permissions Failed');
    }
  }

  async getPermissionsById(_permissionsId) {
    try {
      const getPermissions = await prisma.tM_Permissions.findFirst({
        where: {
          Permissions_id: _permissionsId,
          deleted_at: null
        }
      });

      return getPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Permissions Failed');
    }
  }

  async getPermissionsByController(_controller) {
    try {
      const getPermissions = await prisma.tM_Permissions.findFirst({
        where: {
          controller: _controller,
          deleted_at: null
        }
      });

      return getPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get PermissionsByController Failed');
    }
  }

  async createPermissionsIfNotExists(_Permissions = []) {

    const existingPermissions = await prisma.tM_Permissions.findMany({
      where: {
        OR:
          _Permissions
      }
    });

    // ลบรายการที่มีแล้วในฐานข้อมูลออกจาก List ที่ต้องการเพิ่ม
    _Permissions = _Permissions.filter(Permission => {
      return !existingPermissions.some(existingPermission =>
        Object.keys(Permission).every(key =>
          existingPermission[key] === Permission[key]
        )
      );
    });

    // สร้างแค่รายการที่ไม่มีใน Lists
    const createdPermission = await prisma.tM_Permissions.createMany({
      data: _Permissions
    });

    console.log(`Permissions data ${createdPermission.count} rows inserted`);
  }

  async updatePermissionsById(_permissionsId, _permissionsData = []) {
    try {
      // set timestamp
      _permissionsData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedPermissions = await prisma.tM_Permissions.update({
        where: {
          Permissions_id: _permissionsId
        },
        data: _permissionsData
      });

      return updatedPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Permissions Failed');
    }
  }

  async daletePermissionsById(_permissionsId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedPermissions = await prisma.tM_Permissions.update({
        where: {
          Permissions_id: _permissionsId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Permissions Failed');
    }
  }

  async hardDaleteAllpermissions() {
    try {

      const daletedPermissions = await prisma.tM_Permissions.deleteMany();

      console.log('Permissions deleted:', daletedPermissions);
      return daletedPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Permissions All Failed');
    }
  }

}

module.exports = TM_Permissions;
