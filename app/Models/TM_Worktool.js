// FileName: TM_Worktool.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Worktool {

  // R => getWorktoolByComId, getWorktoolById
  // C => createWorktool
  // U => updateTemplateById
  // D => daleteTemplateById

  async getWorktoolByComId(_companyId) {
    try {
      const getWorktool = await prisma.tM_Worktool.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        orderBy: {
          name: 'asc',
        }
      });

      return getWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Worktool ByComId Failed');
    }
  }


  async getWorktoolById(_worktoolId, _companyId) {
    try {
      const getWorktool = await prisma.tM_Worktool.findFirst({
        where: {
          Worktool_id: _worktoolId,
          Company_id: _companyId,
          deleted_at: null
        },
      });

      return getWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Worktool ById Failed');
    }
  }


  async createWorktool(_worktoolData = []) {
    try {

      // set timestamp
      _worktoolData['created_at'] = await Func.formatDateSave(new Date());

      const createdWorktool = await prisma.tM_Worktool.create({
        data: _worktoolData,
      });

      return createdWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Worktool Failed');
    }
  }

  async updateWorktoolById(_worktoolId, _worktoolData = []) {
    try {
      // set timestamp
      _worktoolData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedWorktool = await prisma.tM_Worktool.update({
        where: {
          Worktool_id: _worktoolId
        },
        data: _worktoolData
      });

      return updatedWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Worktool Failed');
    }
  }

  async daleteWorktoolById(_worktoolId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedWorktool = await prisma.tM_Worktool.update({
        where: {
          Worktool_id: _worktoolId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Worktool Failed');
    }
  }

  async hardDaleteAllWorktool() {
    try {
      const daletedWorktool = await prisma.tM_Worktool.deleteMany();

      console.log('Worktool deleted:', daletedWorktool);
      return daletedWorktool;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Worktool All Failed');
    }
  }
}

module.exports = TM_Worktool;
