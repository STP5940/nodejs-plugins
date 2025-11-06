// FileName: TM_Unit.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Unit {

  // R => getUnitById Or getAllUnit
  // C => createUnit
  // U => updateUnitById
  // D => daleteUnitById

  async getAllUnit() {
    try {
      const getAllUnit = await prisma.tM_Unit.findMany({
        where: {
          deleted_at: null
        }
      });

      return getAllUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Unit Failed');
    }
  }

  async getUnitById(_templateId) {
    try {
      const getUnit = await prisma.tM_Unit.findFirst({
        where: {
          id: _templateId,
          deleted_at: null
        }
      });

      return getUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Unit Failed');
    }
  }

  async createManyUnit(_unitData = []) {
    try {

      // set timestamp
      _unitData['created_at'] = await Func.formatDateSave(new Date());

      const createdUnit = await prisma.tM_Unit.createMany({
        data: _unitData,
      });

      return createdUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Unit Failed');
    }
  }

  async updateUnitById(_templateId, _templateData = []) {
    try {
      // set timestamp
      _templateData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedUnit = await prisma.tM_Unit.update({
        where: {
          id: _templateId
        },
        data: _templateData
      });

      return updatedUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Unit Failed');
    }
  }

  async daleteUnitById(_templateId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedUnit = await prisma.tM_Unit.update({
        where: {
          id: _templateId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Unit Failed');
    }
  }

  async hardDaleteAllUnit() {
    try {
      const daletedUnit = await prisma.tM_Unit.deleteMany();

      console.log('Unit All deleted:', daletedUnit);
      return daletedUnit;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Unit All Failed');
    }
  }
}

module.exports = TM_Unit;
