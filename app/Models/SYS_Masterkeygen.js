// FileName: SYS_Masterkeygen.js 
// Created time: 11-06-2025 09:33:02

// Rename T_Template to NameModel

const Func = require("../Func");
const moment = require('moment');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class SYS_Masterkeygen {

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

  async getPrefixMasterkeygenByTableName(_tableName, _companyId) {
    try {
      const getPrefix = await prisma.sYS_Masterkeygen.findFirst({
        where: {
          tableName: _tableName,
          Company_id: _companyId,
        },
        select: {
          prefix: true
        }
      });

      return getPrefix;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get PrefixMasterkeygen Failed');
    }
  }

  async getMasterkeygenByComId(_tableName, _companyId) {
    try {

      let updatedMasterkeygen = { count: 0 };
      let getMasterkeygen = null;

      do {

        getMasterkeygen = await prisma.sYS_Masterkeygen.findFirst({
          where: {
            tableName: _tableName,
            Company_id: _companyId,
          }
        });

        if (!getMasterkeygen) {

          // สร้างรายการ Masterkeygen ใหม่กรณียังไม่มีข้อมูล
          switch (_tableName) {
            case 'T_Workinstruction': // เลขเอกสาร WI
              const createdMasterkeygenWI = await prisma.sYS_Masterkeygen.create({
                data: {
                  tableName: 'T_Workinstruction',
                  Company_id: _companyId,
                  prefix: 'WI',
                  masterkeygenId: Number(moment().format('YYYYMMDD') + '00001'),
                  updated_at: await Func.formatDateSave(new Date())
                },
              });

              getMasterkeygen = createdMasterkeygenWI;
              break;

            case 'T_Maintenanceschedule': // เลขเอกสาร MS
              const createdMasterkeygenMS = await prisma.sYS_Masterkeygen.create({
                data: {
                  tableName: 'T_Maintenanceschedule',
                  Company_id: _companyId,
                  prefix: 'MS',
                  masterkeygenId: Number(moment().format('YYYYMMDD') + '00001'),
                  updated_at: await Func.formatDateSave(new Date())
                },
              });

              getMasterkeygen = createdMasterkeygenMS;
              break;

            case 'T_Correctivemaintenance': // เลขเอกสาร CM
              const createdMasterkeygenCM = await prisma.sYS_Masterkeygen.create({
                data: {
                  tableName: 'T_Correctivemaintenance',
                  Company_id: _companyId,
                  prefix: 'CM',
                  masterkeygenId: Number(moment().format('YYYYMMDD') + '00001'),
                  updated_at: await Func.formatDateSave(new Date())
                },
              });

              getMasterkeygen = createdMasterkeygenCM;
              break;

            case 'T_Preventivemaintenance': // เลขเอกสาร PM
              const createdMasterkeygenPM = await prisma.sYS_Masterkeygen.create({
                data: {
                  tableName: 'T_Preventivemaintenance',
                  Company_id: _companyId,
                  prefix: 'PM',
                  masterkeygenId: Number(moment().format('YYYYMMDD') + '00001'),
                  updated_at: await Func.formatDateSave(new Date())
                },
              });

              getMasterkeygen = createdMasterkeygenPM;
              break;
            default:
              throw new Error('findFirst Masterkeygen not found');
          }
        }

        // Get current date in yyyymmdd format
        let masterkeygenId = 0;
        if (moment().format('YYYYMMDD') === getMasterkeygen?.masterkeygenId?.toString()?.slice(0, 8)) {
          // console.log("วันเดิม");

          masterkeygenId = Number(getMasterkeygen?.masterkeygenId) + 1;

          // อัปเดตค่า masterkeygenId โดยเพิ่มค่า 1
          updatedMasterkeygen = await prisma.sYS_Masterkeygen.updateMany({
            where: {
              tableName: _tableName,
              Company_id: _companyId,
              masterkeygenId: getMasterkeygen?.masterkeygenId,
            },
            data: {
              masterkeygenId: masterkeygenId,
              updated_at: await Func.formatDateSave(new Date())
            }
          });

        } else {
          // console.log("วันใหม่");

          //ส่ง 00002 ไปเก็บเป็นค่าใหม่เลย เพราะวันใหม่แล้ว 00001 จะถูกใช้งานทันที
          masterkeygenId = Number(moment().format('YYYYMMDD') + '00002');

          // อัปเดตค่า masterkeygenId โดยเพิ่มค่า 1
          updatedMasterkeygen = await prisma.sYS_Masterkeygen.updateMany({
            where: {
              tableName: _tableName,
              Company_id: _companyId,
              masterkeygenId: getMasterkeygen?.masterkeygenId,
            },
            data: {
              masterkeygenId: masterkeygenId,
              updated_at: await Func.formatDateSave(new Date())
            }
          });

          // ค่าที่จะส่งให้ให้ใช้งานทันที 00001
          getMasterkeygen && (getMasterkeygen.masterkeygenId = Number(moment().format('YYYYMMDD') + '00001'));
        }

        // ถ้าไม่สามารถอัปเดตได้ ให้วน loop ใหม่จนกว่าจะสำเร็จ
      } while (updatedMasterkeygen.count === 0);

      return getMasterkeygen;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Masterkeygen Failed');
    }
  }

  // async createTemplateIfNotExists(_templateData = []) {
  //   try {

  //     // set timestamp
  //     _templateData['created_at'] = await Func.formatDateSave(new Date());

  //     // เช็คข้อมูลซ้ำ
  //     const existingTemplate = await prisma.t_Template.findUnique({
  //       where: {
  //         id: _templateData.id
  //       },
  //     });

  //     if (!existingTemplate) {
  //       const createdTemplate = await prisma.t_Template.create({
  //         data: _templateData,
  //       });

  //       return createdTemplate;
  //     } else {
  //       console.log(`Template with id ${_templateData.id} already exists, skipping.`);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Create Template Failed');
  //   }
  // }

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

  // async daleteTemplateById(_templateId) {
  //   try {
  //     const formattedDateTime = Func.formatDateSave(new Date());

  //     const daletedTemplate = await prisma.t_Template.update({
  //       where: {
  //         id: _templateId
  //       },
  //       data: {
  //         deleted_at: formattedDateTime,
  //       },
  //     });

  //     return daletedTemplate;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Dalete Template Failed');
  //   }
  // }
}

module.exports = SYS_Masterkeygen;
