// FileName: T_Correctivemaintenance.js 
// Created time: 19-03-2025 10:43:24

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Correctivemaintenance {

  // R => getCorrectivemaintenanceByCusIdAndComId Or getCorrectivemaintenanceById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteCorrectivemaintenanceById

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

  async getCorrectivemaintenanceById(_correctivemaintenanceId, _companyId) {
    try {
      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findFirst({
        where: {
          Correctivemaintenance_id: _correctivemaintenanceId,
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

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Correctivemaintenance byId Failed');
    }
  }

  async getCorrectivemaintenanceByComId(_companyId) {
    try {
      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        select: {
          Correctivemaintenance_id: true,
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
          { Correctivemaintenance_id: 'asc' },
        ],
      });

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Correctivemaintenance Failed');
    }
  }

  async getCorrectivemaintenanceByCusIdAndComId(_customerId, _companyId) {
    try {
      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findMany({
        where: {
          Customer_id: _customerId,
          Company_id: _companyId,
          deleted_at: null
        },
        select: {
          Correctivemaintenance_id: true,
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
        },
        orderBy: [
          { active: 'desc' },
          { isCompleted: 'asc' },
          { inspectionDate: 'asc' },
          { Correctivemaintenance_id: 'asc' },
        ],
      });

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Correctivemaintenance Failed');
    }
  }

  async getAllCorrectivemaintenanceByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findMany({
        where: {
          Employee_id: _employeeId,
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          isCompleted: false,
        },
        select: {
          Correctivemaintenance_id: true,
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

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Correctivemaintenance byComId Failed');
    }
  }

  async getAllCompletedCorrectivemaintenanceByEmpId(_employeeId, _companyId) {
    try {
      if (!_employeeId) {
        throw new Error('Access Denied: Employee Role only');
      }

      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findMany({
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
        //   Correctivemaintenance_id: 'desc'
        // }
      });

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Correctivemaintenance byComId Failed');
    }
  }

  async getAllPendingCorrectivemaintenanceByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company ID is missing.');
      }

      const getCorrectivemaintenance = await prisma.t_Correctivemaintenance.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
          active: true,
          isCompleted: false,
        },
        select: {
          Correctivemaintenance_id: true,
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
          { Correctivemaintenance_id: 'asc' },
        ],
        // orderBy: {
        //   Correctivemaintenance_id: 'desc'
        // }
      });

      return getCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Correctivemaintenance byComId Failed');
    }
  }

  async createCorrectivemaintenance(_correctivemaintenanceData = []) {
    try {

      // set timestamp
      _correctivemaintenanceData['created_at'] = await Func.formatDateSave(new Date());

      const createdCorrectivemaintenance = await prisma.t_Correctivemaintenance.create({
        data: _correctivemaintenanceData,
      });

      return createdCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Correctivemaintenance Failed');
    }
  }

  async updateCorrectivemaintenanceByIdAndComId(_correctivemaintenanceId, _companyId, _CorrectivemaintenanceData = []) {
    try {
      // set timestamp
      _CorrectivemaintenanceData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedCorrectivemaintenance = await prisma.t_Correctivemaintenance.update({
        where: {
          Correctivemaintenance_id: _correctivemaintenanceId,
          Company_id: _companyId,
        },
        data: _CorrectivemaintenanceData
      });

      return updatedCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Correctivemaintenance Failed');
    }
  }

  async daleteCorrectivemaintenanceById(_correctivemaintenanceId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedCorrectivemaintenance = await prisma.t_Correctivemaintenance.update({
        where: {
          Correctivemaintenance_id: _correctivemaintenanceId,
          Company_id: _companyId,
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedCorrectivemaintenance;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Correctivemaintenance Failed');
    }
  }
}

module.exports = T_Correctivemaintenance;
