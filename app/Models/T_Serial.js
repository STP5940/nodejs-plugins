// FileName: T_Serial.js 
// Created time: 06-03-2025 18:30:17

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Serial {

  // R => getSerialByMSId Or getAllSerial
  // C => createSerial
  // U => updateSerialById
  // D => daleteSerialByMSId

  async getAllSerialByComid(_customerId, _companyId) {
    try {
      const getAllSerials = await prisma.t_Serial.findMany({
        where: {
          deleted_at: null,
          T_Maintenanceschedule: {
            Customer_id: _customerId,
            Company_id: _companyId,
          },
        },
        include: {
          T_Maintenanceschedule: {
            include: {
              TM_Product: true
            }
          },
        },
      });

      return getAllSerials;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get ALL Maintenanceschedule Failed');
    }
  }

  async getSerialByMSId(_maintenancescheduleId) {
    try {
      const getSerials = await prisma.t_Serial.findMany({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId,
          deleted_at: null
        },
        orderBy: {
          Serial_id: 'desc'
        }
      });

      return getSerials;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get getSerial ByMSId Failed');
    }
  }

  async createSerial(_serialData = []) {
    try {

      // set timestamp
      _serialData['created_at'] = await Func.formatDateSave(new Date());

      const createdSerial = await prisma.t_Serial.create({
        data: _serialData,
      });

      return createdSerial;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Serial Failed');
    }
  }

  async updateSerialById(_serialId, _serialData = []) {
    try {
      // set timestamp
      _serialData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedSerial = await prisma.t_Serial.update({
        where: {
          Serial_id: _serialId
        },
        data: _serialData
      });

      return updatedSerial;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Serial ById Failed');
    }
  }

  async daleteSerialByMSId(_maintenancescheduleId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      // 1. ค้นหาข้อมูลที่ต้องการจะอัพเดต
      const serialsToUpdate = await prisma.t_Serial.findMany({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId
        },
        select: {
          Serial_id: true
        }
      });

      // 2. อัพเดตข้อมูล
      await prisma.t_Serial.updateMany({
        where: {
          Maintenanceschedule_id: _maintenancescheduleId
        },
        data: {
          deleted_at: formattedDateTime,
        }
      });

      // 3. คืนค่ารายการที่ถูกอัพเดต
      return serialsToUpdate;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Serial By MSId Failed');
    }
  }
}

module.exports = T_Serial;
