// FileName: TM_UsersrolePermissions.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const T_Company = require("./T_Company");
const TM_Permissions = require("./TM_Permissions");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_UsersrolePermissions {

  // R => getUsersrolePermissionsByUsersroleId
  // C => createUsersrolePermissionsIfNotExists
  // U => updateUsersrolePermissionsById Or updateUsersrolePermissionsBypermissionsId
  // D => 

  async getAllUsersrolePermissions() {
    try {
      const getAllUsersrolePermissions = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          deleted_at: null
        }
      });

      return getAllUsersrolePermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All UsersrolePermissions Failed');
    }
  }

  async getUsersrolePermissionsByUsersroleId(_usersroleId) {
    try {
      const getPermissions = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          Usersrole_id: _usersroleId,
          OR: [
            { read: true },
            { update: true },
            { create: true },
            { delete: true }
          ]
        }
      });

      return getPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Permissions By Usersrole_id Failed');
    }
  }

  async getUsersrolePermissionsByroleIdAndpermissionsId(_usersroleId, _permissionsId) {
    try {
      const getPermissions = await prisma.tM_UsersrolePermissions.findFirst({
        where: {
          Usersrole_id: _usersroleId,
          Permissions_id: _permissionsId,
        }
      });

      return getPermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Permissions By Usersrole_id Failed');
    }
  }


  async getUsersroleIdForWorkinstructionsdetail() {
    try {

      const getPermissionWithController = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          Usersrole_id: {
            gte: 3, // เทียบกับ Usersrole_id >= 3
          },
          read: true,
          update: true,
          TM_Permissions: {
            controller: 'WorkinstructionsdetailController',
            deleted_at: null, // กรองที่ deleted_at เป็น NULL
          },
        },
        select: {
          Usersrole_id: true, // ดึงเฉพาะ Usersrole_id
        },
      });

      return getPermissionWithController;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole WorkinstructionsdetailController Failed');
    }
  }


  async getUsersroleIdForCorrectivemaintenancedetail() {
    try {

      const getPermissionWithController = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          Usersrole_id: {
            gte: 3, // เทียบกับ Usersrole_id >= 3
          },
          read: true,
          update: true,
          TM_Permissions: {
            controller: 'CorrectivemaintenancedetailController',
            deleted_at: null, // กรองที่ deleted_at เป็น NULL
          },
        },
        select: {
          Usersrole_id: true, // ดึงเฉพาะ Usersrole_id
        },
      });

      return getPermissionWithController;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole CorrectivemaintenancedetailController Failed');
    }
  }


  async getUsersroleIdForPreventivemaintenancedetail() {
    try {

      const getPermissionWithController = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          Usersrole_id: {
            gte: 3, // เทียบกับ Usersrole_id >= 3
          },
          read: true,
          update: true,
          TM_Permissions: {
            controller: 'PreventivemaintenancedetailController',
            deleted_at: null, // กรองที่ deleted_at เป็น NULL
          },
        },
        select: {
          Usersrole_id: true, // ดึงเฉพาะ Usersrole_id
        },
      });

      return getPermissionWithController;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Usersrole PreventivemaintenancedetailController Failed');
    }
  }


  async getUsersrolePermissionsByComIdAndController(_companyId, _controller) {

    try {
      const company = new T_Company();
      const Permissions = new TM_Permissions();

      const getCompanys = await company.getCompanyById(_companyId);
      const getPermissions = await Permissions.getPermissionsByController('LineconfigController');

      const getUsersrolePermissions = await prisma.tM_UsersrolePermissions.findFirst({
        where: {
          Usersrole_id: getCompanys?.T_Users.Usersrole_id,
          Permissions_id: getPermissions?.Permissions_id,
        }
      });

      return getUsersrolePermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get PermissionsByComId Failed');
    }
  }

  async createUsersrolePermissionsIfNotExists(_usersrolePermissionsData = []) {
    try {

      const existingUsersrolePermissions = await prisma.tM_UsersrolePermissions.findMany({
        where: {
          OR:
            _usersrolePermissionsData
        }
      });

      // ลบรายการที่มีแล้วในฐานข้อมูลออกจาก List ที่ต้องการเพิ่ม
      _usersrolePermissionsData = _usersrolePermissionsData.filter(UsersrolePermissionsData => {
        return !existingUsersrolePermissions.some(existingUsersrolePermissions =>
          Object.keys(UsersrolePermissionsData).every(key =>
            existingUsersrolePermissions[key] === UsersrolePermissionsData[key]
          )
        );
      });

      // สร้างแค่รายการที่ไม่มีใน Lists
      const createdUsersrolePermissions = await prisma.tM_UsersrolePermissions.createMany({
        data: _usersrolePermissionsData
      });

      console.log(`UsersrolePermissions data ${createdUsersrolePermissions.count} rows inserted`);
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create UsersrolePermissions Failed');
    }
  }

  async updateUsersrolePermissionsById(_usersroleId, _permissionsId, _usersrolePermissionsData = []) {
    try {

      const existingRecord = await prisma.tM_UsersrolePermissions.findUnique({
        where: {
          Usersrole_id_Permissions_id: {
            Usersrole_id: _usersroleId,
            Permissions_id: _permissionsId
          }
        }
      });

      if (existingRecord) {
        // Update the existing record
        const updatedUsersrolePermissions = await prisma.tM_UsersrolePermissions.update({
          where: {
            Usersrole_id_Permissions_id: {
              Usersrole_id: _usersroleId,
              Permissions_id: _permissionsId
            }
          },
          data: _usersrolePermissionsData
        });

        return updatedUsersrolePermissions;
      } else {
        // Insert a new record
        const newUsersrolePermissions = await prisma.tM_UsersrolePermissions.create({
          data: {
            Usersrole_id: _usersroleId,
            Permissions_id: _permissionsId,
            ..._usersrolePermissionsData
          }
        });

        return newUsersrolePermissions;
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update UsersrolePermissions Failed');
    }
  }

  async updateUsersrolePermissionsBypermissionsId(_permissionsId, _usersrolePermissionsData = []) {
    try {
      // Update the existing record
      const updatedUsersrolePermissions = await prisma.tM_UsersrolePermissions.updateMany({
        where: {
          Permissions_id: _permissionsId
        },
        data: _usersrolePermissionsData
      });

      return updatedUsersrolePermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update UsersrolePermissions Failed');
    }
  }

  async daleteUsersrolePermissionsById(_usersrolePermissionsId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedUsersrolePermissions = await prisma.tM_UsersrolePermissions.update({
        where: {
          id: _usersrolePermissionsId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedUsersrolePermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete UsersrolePermissions Failed');
    }
  }

  async hardDaleteAllUsersrolePermissions() {
    try {

      const daletedUsersrolePermissions = await prisma.tM_UsersrolePermissions.deleteMany();

      console.log('UsersrolePermissions deleted:', daletedUsersrolePermissions);
      return daletedUsersrolePermissions;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete UsersrolePermissions All Failed');
    }
  }
}

module.exports = TM_UsersrolePermissions;
