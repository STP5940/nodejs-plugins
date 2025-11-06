// FileName: T_Lineconfig.js 
// Created time: 03-07-2025 08:26:26

// Rename T_Template to NameModel

const Func = require("@root/app/Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Lineconfig {

  // R => getLineconfigById
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteTemplateById

  async getLineconfigById(_companyId) {
    try {
      const getLineconfig = await prisma.t_Lineconfig.findFirst({
        where: {
          Company_id: _companyId
        }
      });

      return getLineconfig;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Lineconfig Failed');
    }
  }

  async createLineconfigIfNotExists(_lineconfigData = []) {
    try {

      // set timestamp
      _lineconfigData['created_at'] = await Func.formatDateSave(new Date());

      // เช็คข้อมูลซ้ำ
      const existingLineconfig = await prisma.t_Lineconfig.findFirst({
        where: {
          Company_id: _lineconfigData.Company_id
        },
      });

      if (!existingLineconfig) {
        const createdLineconfig = await prisma.t_Lineconfig.create({
          data: _lineconfigData,
        });

        return createdLineconfig;
      } else {
        console.log(`Lineconfig with companyId ${_lineconfigData.Company_id} already exists, skipping.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Lineconfig Failed');
    }
  }

  async updateLineconfigById(_lineconfigId, _lineconfigData = []) {
    try {
      // set timestamp
      _lineconfigData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedLineconfig = await prisma.t_Lineconfig.update({
        where: {
          Lineconfig_id: _lineconfigId
        },
        data: _lineconfigData
      });

      return updatedLineconfig;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Lineconfig Failed');
    }
  }

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

module.exports = T_Lineconfig;
