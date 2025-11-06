// Rename T_Template to NameModel

const Func = require("@root/app/Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Template {

  // R => getTemplateById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteTemplateById

  async getAllTemplate() {
    try {
      const getAllTemplate = await prisma.t_Template.findMany({
        where: {
          deleted_at: null
        }
      });

      return getAllTemplate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Template Failed');
    }
  }

  async getTemplateById(_templateId) {
    try {
      const getTemplate = await prisma.t_Template.findFirst({
        where: {
          id: _templateId,
          deleted_at: null
        }
      });

      return getTemplate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Template Failed');
    }
  }

  async createTemplateIfNotExists(_templateData = []) {
    try {

      // set timestamp
      _templateData['created_at'] = await Func.formatDateSave(new Date());

      // เช็คข้อมูลซ้ำ
      const existingTemplate = await prisma.t_Template.findUnique({
        where: {
          id: _templateData.id
        },
      });

      if (!existingTemplate) {
        const createdTemplate = await prisma.t_Template.create({
          data: _templateData,
        });

        return createdTemplate;
      } else {
        console.log(`Template with id ${_templateData.id} already exists, skipping.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Template Failed');
    }
  }

  async updateTemplateById(_templateId, _templateData = []) {
    try {
      // set timestamp
      _templateData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedTemplate = await prisma.t_Template.update({
        where: {
          id: _templateId
        },
        data: _templateData
      });

      return updatedTemplate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Template Failed');
    }
  }

  async daleteTemplateById(_templateId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedTemplate = await prisma.t_Template.update({
        where: {
          id: _templateId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedTemplate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Template Failed');
    }
  }
}

module.exports = T_Template;
