// FileName: T_Workinstruction.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Workinstruction {

  // R => getTemplateById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteWorkinstructionById

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

  async getWorkinstructionById(_workinstructionId, _companyId) {
    try {
      const getWorkinstruction = await prisma.t_Workinstruction.findFirst({
        where: {
          Workinstruction_id: _workinstructionId,
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
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Workinstruction byId Failed');
    }
  }

  async getAllWorkinstructionByCusIdAndComId(_customerId, _companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getWorkinstruction = await prisma.t_Workinstruction.findMany({
        where: {
          Company_id: _companyId,
          Customer_id: _customerId,
          deleted_at: null
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
        orderBy: [
          { Customer_id: 'desc' },
          { Workinstruction_id: 'desc' },
        ]
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Workinstruction byComId Failed');
    }
  }

  async getAllWorkinstructionByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getWorkinstruction = await prisma.t_Workinstruction.findMany({
        where: {
          Employee_id: _employeeId,
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          manualCompleted: false,
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
        // orderBy: {
        //   Workinstruction_id: 'desc'
        // }
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Workinstruction byComId Failed');
    }
  }

  async getAllCompletedWorkinstructionByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getWorkinstruction = await prisma.t_Workinstruction.findMany({
        where: {
          Employee_id: _employeeId,
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          manualCompleted: true,
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
        orderBy: {
          Workinstruction_id: 'desc'
        }
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Workinstruction byEmpId Failed');
    }
  }


  async getAllCompletedWorkinstructionByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company ID is missing.');
      }

      const getWorkinstruction = await prisma.t_Workinstruction.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          manualCompleted: true,
        },
        include: {
          TM_Product: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
        orderBy: {
          Workinstruction_id: 'desc'
        }
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Workinstruction byComId Failed');
    }
  }

  async getAllPendingWorkinstructionByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company ID is missing.');
      }

      const getWorkinstruction = await prisma.t_Workinstruction.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          manualCompleted: false,
        },
        select: {
          Workinstruction_id: true,
          Company_id: true,
          documentNumber: true,
          name: true,
          manualCompleted: true,
          created_at: true,
          active: true,
          TM_Customer: {
            include: {
              EXT_Customer: true, // Includes related EXT_Customer
            },
          },
          T_Employee: {
            include: {
              T_Users: true, // Includes related EXT_Customer
            },
          },
        },
        orderBy: [
          { active: 'desc' },
          { manualCompleted: 'asc' },
          { Workinstruction_id: 'desc' },
        ]
      });

      return getWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Workinstruction byComId Failed');
    }
  }

  async createWorkinstruction(_workinstructionData = []) {
    try {

      // set timestamp
      _workinstructionData['created_at'] = await Func.formatDateSave(new Date());

      const createdTemplate = await prisma.t_Workinstruction.create({
        data: _workinstructionData,
      });

      return createdTemplate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Workinstruction Failed');
    }
  }

  async updateWorkinstructionByIdAndComId(_workinstructionId, _companyId, _WorkinstructionData = []) {
    try {
      // set timestamp
      _WorkinstructionData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedWorkinstruction = await prisma.t_Workinstruction.update({
        where: {
          Workinstruction_id: _workinstructionId,
          Company_id: _companyId,
        },
        data: _WorkinstructionData
      });

      return updatedWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Workinstruction Failed');
    }
  }

  async daleteWorkinstructionById(_workinstructionId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedWorkinstruction = await prisma.t_Workinstruction.update({
        where: {
          Workinstruction_id: _workinstructionId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Workinstruction Failed');
    }
  }

  async hardDaleteAllWorkinstruction() {
    try {

      const daletedWorkinstruction = await prisma.t_Workinstruction.deleteMany();

      console.log('Workinstruction deleted:', daletedWorkinstruction);
      return daletedWorkinstruction;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Workinstruction All Failed');
    }
  }
}

module.exports = T_Workinstruction;
