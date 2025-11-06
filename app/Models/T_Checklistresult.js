// FileName: T_Checklistresult.js 
// Created time: 04-04-2025 19:14:07

// Rename T_Template to NameModel

const Func = require("../Func");
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

  async getCheckListByPMId(_preventivemaintenanceId) {
    try {
      // ดึง checklist ทั้งหมด
      const allChecklistItems = await prisma.t_Checklistresult.findMany({
        where: {
          Preventivemaintenance_id: _preventivemaintenanceId,
          sourcetype: 'product',
        },
        orderBy: [{ checklistIndex: 'asc' }],
      });

      // แยก parent items และจัดกลุ่ม child items
      const mainItems = allChecklistItems.filter(item => item.Parent_id === null);
      const childItemsByParentChecklist = {};

      allChecklistItems
        .filter(item => item.Parent_id !== null)
        .forEach(childItem => {
          if (!childItemsByParentChecklist[childItem.Parent_id]) {
            childItemsByParentChecklist[childItem.Parent_id] = [];
          }
          childItemsByParentChecklist[childItem.Parent_id].push(childItem);
        });

      // สร้าง structure ที่รวม main items และ sub items
      const mainItemsWithSubItems = mainItems.map(mainItem => ({
        Checklist_id: mainItem.Checklist_id,
        checklistIndex: mainItem.checklistIndex,
        Checklistresult_id: mainItem.Checklistresult_id,
        Parent_id: mainItem.Parent_id,
        description: mainItem.description,
        selectedOption: mainItem.selectedOption,
        note: mainItem.note,
        image: mainItem.image,
        checklistIndex: mainItem.checklistIndex,
        subItems: (childItemsByParentChecklist[mainItem.Checklist_id] || []).map(subItem => ({
          Checklist_id: subItem.Checklist_id,
          checklistIndex: subItem.checklistIndex,
          Checklistresult_id: subItem.Checklistresult_id,
          Parent_id: subItem.Parent_id,
          description: subItem.description,
          selectedOption: subItem.selectedOption,
          note: subItem.note,
          image: subItem.image,
          checklistIndex: subItem.checklistIndex,
        })),
      }));

      return mainItemsWithSubItems;
    } catch (error) {
      console.error('Error fetching product checklist:', error);
      throw error;
    }
  }

  async getCheckListCustomByPMId(_preventivemaintenanceId) {
    try {
      // ดึง checklist ทั้งหมด
      const allChecklistItems = await prisma.t_Checklistresult.findMany({
        where: {
          Preventivemaintenance_id: _preventivemaintenanceId,
          sourcetype: 'maintenanceschedule',
        },
        orderBy: [{ checklistIndex: 'asc' }],
      });

      // แยก parent items และจัดกลุ่ม child items
      const mainItems = allChecklistItems.filter(item => item.Parent_id === null);
      const childItemsByParentChecklist = {};

      allChecklistItems
        .filter(item => item.Parent_id !== null)
        .forEach(childItem => {
          if (!childItemsByParentChecklist[childItem.Parent_id]) {
            childItemsByParentChecklist[childItem.Parent_id] = [];
          }
          childItemsByParentChecklist[childItem.Parent_id].push(childItem);
        });

      // สร้าง structure ที่รวม main items และ sub items
      const mainItemsWithSubItems = mainItems.map(mainItem => ({
        Checklist_id: mainItem.Checklist_id,
        checklistIndex: mainItem.checklistIndex,
        Checklistresult_id: mainItem.Checklistresult_id,
        Parent_id: mainItem.Parent_id,
        description: mainItem.description,
        selectedOption: mainItem.selectedOption,
        note: mainItem.note,
        image: mainItem.image,
        checklistIndex: mainItem.checklistIndex,
        subItems: (childItemsByParentChecklist[mainItem.Checklist_id] || []).map(subItem => ({
          Checklist_id: subItem.Checklist_id,
          checklistIndex: subItem.checklistIndex,
          Checklistresult_id: subItem.Checklistresult_id,
          Parent_id: subItem.Parent_id,
          description: subItem.description,
          selectedOption: subItem.selectedOption,
          note: subItem.note,
          image: subItem.image,
          checklistIndex: subItem.checklistIndex,
        })),
      }));

      return mainItemsWithSubItems;
    } catch (error) {
      console.error('Error fetching maintenanceschedule checklist:', error);
      throw error;
    }
  }

  async createChecklistresult(_checklistresultData = []) {
    try {

      // set timestamp
      _checklistresultData['created_at'] = await Func.formatDateSave(new Date());

      const createdChecklistresult = await prisma.t_Checklistresult.create({
        data: _checklistresultData,
      });

      return createdChecklistresult;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Checklistresult Failed');
    }
  }

  async updateChecklistresultByIdAndComId(_checklistresultId, _companyId, _checklistresultData = []) {
    try {
      // set timestamp
      _checklistresultData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedChecklistresult = await prisma.t_Checklistresult.update({
        where: {
          Checklistresult_id: _checklistresultId,
          Company_id: _companyId
        },
        data: _checklistresultData
      });

      return updatedChecklistresult;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Checklistresult Failed');
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
