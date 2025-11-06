// FileName: TM_Productchecklist.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Productchecklist {

  // R => getTemplateById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById, updateProductCheckList
  // D => daleteTemplateById, daleteProductCheckListNotInList

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

  // async getTemplateById(_templateId) {
  //   try {
  //     const getTemplate = await prisma.t_Template.findFirst({
  //       where: {
  //         id: _templateId,
  //         deleted_at: null
  //       }
  //     });

  //     return getTemplate;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Get Template Failed');
  //   }
  // }

  // ถ้าต้องการดึงรายการจาก Checklistresult ให้ส่ง _preventivemaintenanceId ไปด้วย
  async getProductCheckListByProductId(_productId, _preventivemaintenanceId = undefined) {
    try {
      // ดึง checklist พร้อม sub-items
      const getProductCheckList = await prisma.tM_Productchecklist.findMany({
        where: {
          Product_id: _productId,
          deleted_at: null,
        },
        include: {
          Children: {
            where: { deleted_at: null },
            orderBy: [{ checklistIndex: 'asc' }],
          },
        },
        orderBy: [{ checklistIndex: 'asc' }],
      });

      // ดึงผลลัพธ์จาก T_Checklistresult โดยกรอง sourcetype = 'product'
      const checklistResults = await prisma.t_Checklistresult.findMany({
        where: {
          sourcetype: 'product',
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

      // สร้าง structure ที่รวม main items และ sub items พร้อมข้อมูล result
      const mainItemsWithSubItems = getProductCheckList
        .filter(mainItem => mainItem.Parent_id === null)
        .map(mainItem => ({
          Checklist_id: mainItem.Checklist_id,
          checklistIndex: mainItem.checklistIndex,
          Parent_id: mainItem.Parent_id,
          description: mainItem.description,
          isImageRequired: mainItem.isImageRequired,
          ...resultMap.get(mainItem.Checklist_id), // merge selectedOption, note, image
          subItems: mainItem.Children.map(subItem => ({
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
      throw new Error('Get ProductCheckList By ProductId Failed');
    }
  }

  async createProductCheckList(_productId, _productCheckListData = []) {
    try {

      const currentTimestamp = await Func.formatDateSave(new Date());

      // Iterate through each main item
      for (const mainItemData of _productCheckListData) {

        const { checklistId, checklistIndex, description, isQuantityRequired, subItems } = mainItemData;

        let subItemsToInsert = [];
        let parentChecklistId = parseInt(checklistId);

        if (checklistId == 'NEW') {
          const createdmainItem = await prisma.tM_Productchecklist.create({
            data: {
              Product_id: _productId,
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
              Product_id: _productId,
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
          await prisma.tM_Productchecklist.createMany({
            data: subItemsToInsert
          });
        }
      }

      return {
        status: true,
        message: `Create ProductCheckList success`,
      };

      // return { message: 'Product CheckList created or already exists.' };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create ProductCheckList Failed');
    }
  }

  async updateProductCheckList(_productId, _productCheckListData = []) {
    try {
      const currentTimestamp = await Func.formatDateSave(new Date());
      const updateMainItems = [];
      const updateSubItems = [];

      // รายการที่ถูกอัปเดท
      let productsUpdated = [];

      // Iterate through each main item
      for (const mainItemData of _productCheckListData) {
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
            prisma.tM_Productchecklist.update(item)
          )
        );
      }

      if (updateSubItems.length > 0) {
        await Promise.all(
          updateSubItems.map(item =>
            prisma.tM_Productchecklist.update(item)
          )
        );
      }

      return {
        status: true,
        message: 'Update Product CheckList success',
        productsUpdated: productsUpdated,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update ProductCheckList Failed');
    }
  }

  // isImageRequired

  async updateProductchecklistIsImageRequiredById(_checklistId, _isImageRequired = false) {
    try {

      const updatedProductchecklist = await prisma.tM_Productchecklist.update({
        where: {
          Checklist_id: parseInt(_checklistId),
          deleted_at: null,
        },
        data: {
          isImageRequired: _isImageRequired,
          updated_at: await Func.formatDateSave(new Date())
        },

      });

      return updatedProductchecklist;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update updatedProductchecklist Failed');
    }
  }

  async daleteProductCheckListById(_productCheckListId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedProductCheckList = await prisma.tM_Productchecklist.updateMany({
        where: {
          Product_id: _productCheckListId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedProductCheckList;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete ProductCheckList Failed');
    }
  }

  async daleteProductCheckListNotInList(_productId, _productsUpdated) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedProductCheckList = await prisma.tM_Productchecklist.updateMany({
        where: {
          Product_id: _productId,
          Checklist_id: {
            notIn: _productsUpdated,
          },
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedProductCheckList;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete ProductCheckList NotInList Failed');
    }
  }

  async hardDaleteAllProductCheckList() {
    try {
      const daletedProductCheckList = await prisma.tM_Productchecklist.deleteMany();

      console.log('ProductCheckList deleted:', daletedProductCheckList);
      return daletedProductCheckList;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete ProductCheckList All Failed');
    }
  }
}

module.exports = TM_Productchecklist;
