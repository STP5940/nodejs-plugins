// FileName: T_WorkinstructionWorktool.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_WorkinstructionWorktool {

  // R => getWorkinstructionWorktoolById Or getAllWorkinstructionWorktool
  // C => createWorkinstructionWorktool
  // U => updateWorkinstructionWorktoolById
  // D => daleteWorkinstructionWorktoolById

  async getAllWorkinstructionWorktool() {
    try {
      const getAllWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.findMany({
        where: {
          deleted_at: null
        }
      });

      return getAllWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All WorkinstructionWorktool Failed');
    }
  }

  async getWorkinstructionWorktoolById(_workinstructionId) {
    try {
      const getWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.findMany({
        where: {
          Workinstruction_id: _workinstructionId,
          deleted_at: null
        },
        include: {
          TM_Worktool: true,
          TM_Unit: true,
        },
        orderBy: {
          WorkinstructionWorktool_id: 'desc'
        }
      });

      return getWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get WorkinstructionWorktool Failed');
    }
  }

  async createWorkinstructionWorktool(_workinstructionWorktoolData = []) {
    try {

      // set timestamp
      _workinstructionWorktoolData['created_at'] = await Func.formatDateSave(new Date());

      const createdWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.create({
        data: _workinstructionWorktoolData,
      });

      return createdWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create WorkinstructionWorktool Failed');
    }
  }

  async updateWorkinstructionWorktoolById(_workinstructionWorktoolId, _workinstructionWorktoolData = []) {
    try {
      // set timestamp
      _workinstructionWorktoolData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.update({
        where: {
          WorkinstructionWorktool_id: _workinstructionWorktoolId
        },
        data: _workinstructionWorktoolData
      });

      return updatedWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update WorkinstructionWorktool Failed');
    }
  }

  async daleteWorkinstructionWorktoolByWiId(_workinstructionId) {
    try {
      const daletedWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.updateMany({
        where: {
          Workinstruction_id: _workinstructionId
        },
        data: {
          deleted_at: await Func.formatDateSave(new Date())
        }
      });

      // console.log('WorkinstructionWorktool deleted:', daletedWorkinstructionWorktool);
      return daletedWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete WorkinstructionWorktool All Failed');
    }
  }

  async hardDaleteAllWorkinstructionWorktool() {
    try {

      const daletedWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.deleteMany();

      console.log('WorkinstructionWorktool deleted:', daletedWorkinstructionWorktool);
      return daletedWorkinstructionWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete WorkinstructionWorktool All Failed');
    }
  }

  // async daleteWorkinstructionWorktoolById(_templateId) {
  //   try {
  //     const formattedDateTime = Func.formatDateSave(new Date());

  //     const daletedWorkinstructionWorktool = await prisma.t_WorkinstructionWorktool.update({
  //       where: {
  //         id: _templateId
  //       },
  //       data: {
  //         deleted_at: formattedDateTime,
  //       },
  //     });

  //     return daletedWorkinstructionWorktool;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Dalete WorkinstructionWorktool Failed');
  //   }
  // }
}

module.exports = T_WorkinstructionWorktool;
