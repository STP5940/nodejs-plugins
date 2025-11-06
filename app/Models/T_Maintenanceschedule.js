// FileName: T_Maintenanceschedule.js 
// Created time: 03-03-2025 08:45:22

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Maintenanceschedule {

  // R => getMaintenancescheduleById Or getMaintenancescheduleByCusIdAndComId Or getAllTemplate
  // C => createMaintenanceschedule
  // U => updateMaintenancescheduleByIdAndComId
  // D => daleteMaintenancescheduleById

  // async getAllTemplate() {
  //   try {
  //     const getAllTemplate = await prisma.t_Template.findMany({
  //       where: {
  //         deleted_at: null
  //       }
  //     });

  //     return getAllTemplate;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Get All Template Failed');
  //   }
  // }

  async getMaintenancescheduleById(_maintenancescheduleId, _companyId) {
    try {
      const getMaintenanceschedule = await prisma.t_Maintenanceschedule.findFirst({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          Company_id: _companyId,
          deleted_at: null,
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
        },
      });

      return getMaintenanceschedule;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Maintenanceschedule ById Failed');
    }
  }

  async getMaintenancescheduleByCusIdAndComId(_customerId, _companyId) {
    try {
      const getMaintenanceschedule = await prisma.t_Maintenanceschedule.findMany({
        where: {
          Customer_id: _customerId,
          Company_id: _companyId,
          deleted_at: null
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
        },
      });

      return getMaintenanceschedule;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Maintenanceschedule By CustomerId And CompanyId Failed');
    }
  }

  async createMaintenanceschedule(_maintenancescheduleData = []) {
    try {

      // set timestamp
      _maintenancescheduleData['created_at'] = await Func.formatDateSave(new Date());

      const createdMaintenanceschedule = await prisma.t_Maintenanceschedule.create({
        data: _maintenancescheduleData,
      });

      return createdMaintenanceschedule;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Maintenanceschedule Failed');
    }
  }

  async updateMaintenancescheduleByIdAndComId(_maintenancescheduleId, _companyId, _maintenancescheduleData = []) {
    try {
      // set timestamp
      _maintenancescheduleData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedMaintenanceschedule = await prisma.t_Maintenanceschedule.update({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          Company_id: _companyId
        },
        data: _maintenancescheduleData
      });

      return updatedMaintenanceschedule;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Maintenanceschedule By Id And CompanyId Failed');
    }
  }

  async daleteMaintenancescheduleById(_maintenancescheduleId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedMaintenanceschedule = await prisma.t_Maintenanceschedule.update({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          Company_id: _companyId,
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedMaintenanceschedule;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Maintenanceschedule Failed');
    }
  }
}

module.exports = T_Maintenanceschedule;
