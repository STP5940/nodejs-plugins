// FileName: T_Preventivemaintenance.js 
// Created time: 29-03-2025 08:40:08

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Preventivemaintenance {

  // R => getTemplateById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteTemplateById

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

  async getAllPreventivemaintenanceByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findMany({
        where: {
          Employee_id: _employeeId,
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          isCompleted: false,
        },
        select: {
          Preventivemaintenance_id: true,
          documentNumber: true,
          name: true,
          active: true,
          inspectionDate: true,
          inspectionTime: true,
          isCompleted: true,
          completed_at: true,

          T_Serial: {
            select: {
              Serial_id: true,
              serialNo: true,

              T_Maintenanceschedule: {
                select: {
                  Maintenanceschedule_id: true,

                  TM_Product: {
                    select: {
                      Product_id: true,
                      equipmenttype: true, // เลือกเฉพาะที่ต้องใช้
                    }
                  },
                },
              }
            }
          },
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
          // เรียงตามวันที่จากน้อยไปหามาก
          { inspectionDate: 'asc' },

          // เรียงตามเวลาจากน้อยไปหามาก
          { inspectionTime: 'asc', },
        ]
      });

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Preventivemaintenance byComId Failed');
    }
  }

  async getPreventivemaintenanceById(_preventivemaintenanceId, _companyId) {
    try {
      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findFirst({
        where: {
          Preventivemaintenance_id: _preventivemaintenanceId,
          Company_id: _companyId,
          deleted_at: null
        },
        include: {
          T_Serial: {
            include: {
              T_Maintenanceschedule: {
                include: {
                  TM_Product: true,
                },
              },
            },
          },
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

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Preventivemaintenance byId Failed');
    }
  }

  async getPreventivemaintenanceByComId(_companyId) {
    try {
      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        select: {
          Preventivemaintenance_id: true,
          documentNumber: true,
          name: true,
          active: true,
          inspectionDate: true,
          inspectionTime: true,
          isCompleted: true,
          completed_at: true,

          T_Serial: {
            select: {
              Serial_id: true,
              serialNo: true,
              notificationDays: true,

              T_Maintenanceschedule: {
                select: {
                  Maintenanceschedule_id: true,
                  documentNumber: true,
                  Company_id: true,

                  TM_Product: {
                    select: {
                      Product_id: true,
                      equipmenttype: true,
                    }
                  },

                  TM_Customer: {
                    select: {
                      Customer_id: true,
                      contactnameprimary: true,
                      phoneprimary: true,
                      address: true,
                      EXT_Customer: {
                        select: {
                          cuscod: true,
                          cusname: true
                        }
                      }
                    }
                  },
                },
              }
            }
          },

          T_Employee: {
            select: {
              Employee_id: true,
              Company_id: true,
              profile: true,
              T_Users: {
                select: {
                  User_id: true,
                  firstname: true,
                  lastname: true,
                  username: true,
                }
              },
            }
          },
        },
        orderBy: [
          { active: 'desc' },
          { isCompleted: 'asc' },
          { inspectionDate: 'asc' },
          { Preventivemaintenance_id: 'asc' },
        ],
      });

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Preventivemaintenance Failed');
    }
  }

  async getPreventivemaintenanceByCusIdAndComId(_customerId, _companyId) {
    try {
      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findMany({
        where: {
          Customer_id: _customerId,
          Company_id: _companyId,
          deleted_at: null
        },
        include: {
          T_Serial: {
            include: {
              T_Maintenanceschedule: {
                include: {
                  TM_Product: {
                    select: {
                      Product_id: true,
                      equipmenttype: true, // เลือกเฉพาะที่ต้องใช้
                    }
                  },
                },
              }
            }
          },
        },
        orderBy: [
          { active: 'desc' },
          { isCompleted: 'asc' },
          { inspectionDate: 'asc' },
          { Preventivemaintenance_id: 'asc' },
        ],
      });

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Preventivemaintenance Failed');
    }
  }

  async getAllCompletedPreventivemaintenanceByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findMany({
        where: {
          Employee_id: _employeeId,
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          isCompleted: true,
        },
        include: {
          T_Serial: {
            include: {
              T_Maintenanceschedule: {
                include: {
                  TM_Product: true, // Includes related TM_Product
                },
              }
            }
          },
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
        //   Preventivemaintenance_id: 'desc'
        // }
      });

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Preventivemaintenance byComId Failed');
    }
  }

  async getAllPendingPreventivemaintenanceByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company ID is missing.');
      }

      const getPreventivemaintenance = await prisma.t_Preventivemaintenance.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          isCompleted: false,
        },
        select: {
          Preventivemaintenance_id: true,
          Company_id: true,
          documentNumber: true,
          name: true,
          isCompleted: true,
          inspectionDate: true,
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
          { isCompleted: 'asc' },
          { inspectionDate: 'asc' },
          { Preventivemaintenance_id: 'asc' },
        ],
        // orderBy: {
        //   Preventivemaintenance_id: 'desc'
        // }
      });

      return getPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Preventivemaintenance byComId Failed');
    }
  }

  async createPreventivemaintenance(_preventivemaintenanceData = []) {
    try {

      // set timestamp
      _preventivemaintenanceData['created_at'] = await Func.formatDateSave(new Date());

      const createdPreventivemaintenance = await prisma.t_Preventivemaintenance.create({
        data: _preventivemaintenanceData,
      });

      return createdPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Preventivemaintenance Failed');
    }
  }

  async updatePreventivemaintenanceByIdAndComId(_preventivemaintenanceId, _companyId, _PreventivemaintenanceData = []) {
    try {
      // set timestamp
      _PreventivemaintenanceData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedPreventivemaintenance = await prisma.t_Preventivemaintenance.update({
        where: {
          Preventivemaintenance_id: _preventivemaintenanceId,
          Company_id: _companyId,
        },
        data: _PreventivemaintenanceData
      });

      return updatedPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Preventivemaintenance Failed');
    }
  }

  async daletePreventivemaintenanceById(_preventivemaintenanceId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedPreventivemaintenance = await prisma.t_Preventivemaintenance.update({
        where: {
          Preventivemaintenance_id: _preventivemaintenanceId,
          Company_id: _companyId,
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedPreventivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Preventivemaintenance Failed');
    }
  }
}

module.exports = T_Preventivemaintenance;
