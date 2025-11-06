// FileName: EXT_Customer.js 
// Created time: 21-12-2024 09:06:43

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class EXT_Customer {

  // R => getExtCustomerByComId
  // C => createTemplateIfNotExists
  // U => updateExtCustomerById
  // D => daleteTemplateById

  async getExtCustomerByComId(_companyId) {
    try {

      let getExtCustomer = await prisma.eXT_Customer.findMany({
        select: {
          extCustomer_id: true,
          Company_id: true,
          cuscod: true,
          cusname: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
          _count: {
            select: {
              TM_Customer: {
                where: {
                  Company_id: _companyId,
                  deleted_at: null, // เงื่อนไข `deleted_at` เป็น `null`
                }
              }, // นับจำนวนลูกค้าที่สัมพันธ์กับ EXT_Customer
            },
          },
        },
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
      });

      // Add extCustomerIdEncrypt to each record in the result
      getExtCustomer = getExtCustomer.map(customer => ({
        extCustomerIdEncrypt: Func.encryptText(customer.extCustomer_id?.toString()),
        ...customer,
      }));

      return getExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get ExtCustomer Failed');
    }
  }

  async getExtCustomerByCuscod(_cuscod, _companyId) {

    if (!_cuscod) {
      throw new Error('cuscod Not Found: Invalid ExtCustomer Cuscod');
    }

    try {

      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getExtCustomer = await prisma.eXT_Customer.findFirst({
        where: {
          cuscod: _cuscod,
          Company_id: _companyId,
          deleted_at: null
        }
      });

      return getExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get ExtCustomer byCuscod Failed');
    }
  }

  async getExtCustomerById(_extCustomerId, _companyId) {

    if (!_extCustomerId) {
      throw new Error('extCustomerId Not Found: Invalid ExtCustomer ID');
    }

    try {

      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getExtCustomer = await prisma.eXT_Customer.findFirst({
        where: {
          extCustomer_id: _extCustomerId,
          Company_id: _companyId,
          deleted_at: null
        }
      });

      return getExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get ExtCustomer byId Failed');
    }
  }

  async createExtCustomerIfNotExists(_extCustomerData = []) {
    try {

      // เช็คข้อมูลซ้ำ
      const existingExtCustomer = await prisma.eXT_Customer.findFirst({
        where: {
          Company_id: _extCustomerData.Company_id,
          cuscod: _extCustomerData.cuscod,
          deleted_at: null
        },
      });

      if (!existingExtCustomer) {
        const createdExtCustomer = await prisma.eXT_Customer.create({
          data: _extCustomerData,
        });

        return createdExtCustomer;
      } else {
        console.log(`ExtCustomer with id ${_extCustomerData.cuscod} already exists, skipping.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create ExtCustomer Failed');
    }
  }

  async updateExtCustomerById(_extCustomerId, _extcustomerData = []) {
    try {
      // set timestamp
      _extcustomerData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedExtCustomer = await prisma.eXT_Customer.update({
        where: {
          extCustomer_id: _extCustomerId
        },
        data: _extcustomerData
      });

      return updatedExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update ExtCustomer Failed');
    }
  }

  async daleteExtCustomerById(_extCustomerId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedExtCustomer = await prisma.eXT_Customer.update({
        where: {
          extCustomer_id: _extCustomerId,
          Company_id: _companyId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete ExtCustomer Failed');
    }
  }

  async hardDaleteAllExtCustomer() {
    try {

      const daletedExtCustomer = await prisma.eXT_Customer.deleteMany();

      console.log('ExtCustomer deleted:', daletedExtCustomer);
      return daletedExtCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete ExtCustomer All Failed');
    }
  }
}

module.exports = EXT_Customer;
