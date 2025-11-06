// FileName: T_Maintenanceschedulechecklist.js 
// Created time: 11-03-2025 22:23:29

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Maintenanceschedulechecklist {

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

  async getMaintenanceschedulechecklistByMSId(_maintenancescheduleId, _preventivemaintenanceId = undefined) {
    try {

      // Fetch both the main items and sub-items in a single query using `include`
      const getMaintenanceschedulechecklist = await prisma.t_Maintenanceschedulechecklist.findMany({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          deleted_at: null,
        },
        include: {
          Children: { // Includes sub-items where Parent_id matches the main item's Checklist_id
            where: { deleted_at: null },
            orderBy: [
              { checklistIndex: 'asc' }, // Order sub-items by checklistIndex in ascending order
            ],
          },
        },
        orderBy: [
          { checklistIndex: 'asc' }, // Order sub-items by checklistIndex in ascending order
        ],
      });

      // ดึงผลลัพธ์จาก T_Checklistresult โดยกรอง sourcetype = 'maintenanceschedule'
      const checklistResults = await prisma.t_Checklistresult.findMany({
        where: {
          sourcetype: 'maintenanceschedule',
          Preventivemaintenance_id: _preventivemaintenanceId,
        },
      });

      // แปลงเป็น map เพื่อเข้าถึงข้อมูลง่าย
      const resultMap = new Map();
      checklistResults.forEach(result => {
        resultMap.set(result.Checklist_id, {
          Checklistresult_id: result.Checklistresult_id,
          selectedOption: result.selectedOption,
          note: result.note,
          image: result.image,
        });
      });

      // Transform the result into the desired structure
      const mainItemsWithSubItems = getMaintenanceschedulechecklist
        .filter(mainItem => mainItem.Parent_id === null) // Filter out main items
        .map(mainItem => ({
          Checklist_id: mainItem.Checklist_id,
          checklistIndex: mainItem.checklistIndex,
          Parent_id: mainItem.Parent_id,
          description: mainItem.description,
          isImageRequired: mainItem.isImageRequired,
          ...resultMap.get(mainItem.Checklist_id), // merge selectedOption, note, image
          subItems: mainItem.Children
            .map(subItem => ({
              Checklist_id: subItem.Checklist_id,
              checklistIndex: subItem.checklistIndex,
              Parent_id: subItem.Parent_id,
              checklistIndex: subItem.checklistIndex,
              description: subItem.description,
              isImageRequired: subItem.isImageRequired,
              ...resultMap.get(subItem.Checklist_id),
            })),
        }));

      return mainItemsWithSubItems;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Maintenanceschedulechecklist By MSId Failed');
    }
  }

  async createMaintenanceschedulechecklist(_maintenancescheduleId, _productCheckListData = []) {
    try {

      const currentTimestamp = await Func.formatDateSave(new Date());

      // Iterate through each main item
      for (const mainItemData of _productCheckListData) {

        const { checklistId, checklistIndex, description, isQuantityRequired, subItems } = mainItemData;

        let subItemsToInsert = [];
        let parentChecklistId = parseInt(checklistId);

        if (checklistId == 'NEW') {
          const createdmainItem = await prisma.t_Maintenanceschedulechecklist.create({
            data: {
              Maintenanceschedule_id: _maintenancescheduleId,
              checklistIndex: parseInt(checklistIndex),
              description: description,
              isImageRequired: Func.isTrue(isQuantityRequired),
              created_at: currentTimestamp,
            },
          });
          parentChecklistId = createdmainItem?.Checklist_id;
        }

        if (parentChecklistId) {
          subItemsToInsert = subItemsToInsert.concat(
            subItems.map((subItem) => ({
              Maintenanceschedule_id: _maintenancescheduleId,
              checklistIndex: parseInt(subItem?.checklistIndex),
              description: subItem?.description,
              isImageRequired: Func.isTrue(subItem?.isQuantityRequired),
              Parent_id: parentChecklistId,
              created_at: currentTimestamp,
            }))
          );
        }

        // insert item sub พร้อมกันทั้งหมด
        if (subItemsToInsert.length > 0) {
          await prisma.t_Maintenanceschedulechecklist.createMany({
            data: subItemsToInsert
          });
        }
      }

      return {
        status: true,
        message: `Create Maintenanceschedulechecklist success`,
      };

      // return { message: 'Preventivemaintenan Cechecklist created or already exists.' };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Maintenanceschedulechecklist Failed');
    }
  }

  async updateMaintenanceschedulechecklist(_maintenancescheduleId, _maintenanceschedulechecklistData = []) {
    try {
      const currentTimestamp = await Func.formatDateSave(new Date());
      const updateMainItems = [];
      const updateSubItems = [];

      // รายการที่ถูกอัปเดท
      let productsUpdated = [];

      // Iterate through each main item
      for (const mainItemData of _maintenanceschedulechecklistData) {
        const { checklistId, checklistIndex, description, isQuantityRequired, subItems } = mainItemData;
        const parentChecklistId = parseInt(checklistId);

        // Only update the main item if necessary
        if (checklistId !== 'NEW') {

          productsUpdated.push(parentChecklistId);

          updateMainItems.push({
            where: {
              Checklist_id: parentChecklistId,
              deleted_at: null,
            },
            data: {
              checklistIndex: parseInt(checklistIndex),
              description: description,
              isImageRequired: Func.isTrue(isQuantityRequired),
              updated_at: currentTimestamp,
            },
          });
        }

        // Prepare batch update for sub-items
        if (parentChecklistId && checklistId !== 'NEW') {
          subItems.forEach(subItem => {

            productsUpdated.push(parseInt(subItem.checklistId));

            updateSubItems.push({
              where: {
                Checklist_id: parseInt(subItem.checklistId),
                deleted_at: null,
              },
              data: {
                checklistIndex: parseInt(subItem.checklistIndex),
                description: subItem.description,
                isImageRequired: Func.isTrue(subItem?.isQuantityRequired),
                updated_at: currentTimestamp,
              },
            });
          });
        }
      }

      // Execute batch updates for main items and sub-items
      if (updateMainItems.length > 0) {
        await Promise.all(
          updateMainItems.map(item =>
            prisma.t_Maintenanceschedulechecklist.update(item)
          )
        );
      }

      if (updateSubItems.length > 0) {
        await Promise.all(
          updateSubItems.map(item =>
            prisma.t_Maintenanceschedulechecklist.update(item)
          )
        );
      }

      return {
        status: true,
        message: 'Update Maintenanceschedule Checklist success',
        productsUpdated: productsUpdated,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Maintenanceschedulechecklist Failed');
    }
  }


  async daleteMaintenanceschedulechecklistNotInList(_maintenancescheduleId, _productsUpdated) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedMaintenanceschedulechecklist = await prisma.t_Maintenanceschedulechecklist.updateMany({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          Checklist_id: {
            notIn: _productsUpdated,
          },
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedMaintenanceschedulechecklist;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Maintenanceschedulechecklist NotInList Failed');
    }
  }
}

module.exports = T_Maintenanceschedulechecklist;
