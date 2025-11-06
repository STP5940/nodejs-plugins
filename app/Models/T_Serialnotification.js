// FileName: T_Serialnotification.js 
// Created time: 10-03-2025 19:01:16

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Serialnotification {

  // R => getAllSerialnotificationByEmpId Or getSerialnotificationBySerialIds
  // C => createSerialnotification
  // U => updateTemplateById
  // D => daleteSerialnotificationBySeriaId Or hardDaleteAllSerialnotification

  async getAllSerialnotificationByComId(_companyId) {
    try {
      const getAllSerialnotification = await prisma.t_Serialnotification.findMany({
        where: {
          T_Serial: {
            deleted_at: null,
            T_Maintenanceschedule: {
              deleted_at: null,
              Company_id: _companyId
            }
          },
        },
        include: {
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
                  }
                }
              }
            }
          },
        },
      });

      return getAllSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Serialnotification Failed');
    }
  }

  async getSerialnotificationBySerialIds(_serialId) {
    try {
      const getSerialnotification = await prisma.t_Serialnotification.findMany({
        where: {
          Serial_id: {
            in: _serialId
          }
        }
      });

      return getSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Serialnotification By SerialIds Failed');
    }
  }


  async getSerialnotificationById(_serialnotificationId, _customerId, _companyId) {
    try {

      if (!_serialnotificationId) {
        return null;
      }

      const getSerialnotification = await prisma.t_Serialnotification.findFirst({
        where: {
          Serialnotification_id: _serialnotificationId
        },
        include: {
          T_Serial: {
            include: {
              T_Maintenanceschedule: {
                include: {
                  TM_Product: true
                }
              },
            },
          },
        },
      });

      if (!getSerialnotification) {
        return getSerialnotification;
      }

      let schedule = getSerialnotification?.T_Serial?.T_Maintenanceschedule;

      if (schedule) {
        if (schedule.Company_id !== _companyId) {
          throw new Error('CompanyId not found');
        }

        if (schedule.Customer_id !== _customerId) {
          throw new Error('CustomerId not found');
        }

        if (Array.isArray(schedule)) {
          getSerialnotification.T_Serial.T_Maintenanceschedule = schedule.filter(
            s => s.Company_id === _companyId && s.Customer_id === _customerId
          );
        }
      }

      return getSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to get serial by ID');
    }
  }

  async createSerialnotification(_serialnotificationData = []) {
    try {

      const createdSerialnotification = await prisma.t_Serialnotification.createMany({
        data: _serialnotificationData,
      });

      return createdSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Serialnotification Failed');
    }
  }

  // async updateTemplateById(_templateId, _templateData = []) {
  //   try {
  //     // set timestamp
  //     _templateData['updated_at'] = await Func.formatDateSave(new Date());

  //     const updatedTemplate = await prisma.t_Template.update({
  //       where: {
  //         id: _templateId
  //       },
  //       data: _templateData
  //     });

  //     return updatedTemplate;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Update Template Failed');
  //   }
  // }

  async daleteSerialnotificationBySeriaId(_serialId) {
    try {

      const daletedSerialnotification = await prisma.t_Serialnotification.deleteMany({
        where: {
          Serial_id: _serialId
        }
      });

      return daletedSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Serialnotification By SeriaId Failed');
    }
  }

  async hardDaleteAllSerialnotification() {
    try {

      const daletedSerialnotification = await prisma.t_Serialnotification.deleteMany();

      console.log('Serialnotification deleted:', daletedSerialnotification);
      return daletedSerialnotification;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Serialnotification All Failed');
    }
  }
}

module.exports = T_Serialnotification;
