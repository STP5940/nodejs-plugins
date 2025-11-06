// FileName: TM_Customer.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Customer {

  // R => getCustomerById, getAllCustomerByComId Or getAllTemplate
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


  async getCustomerById(_customerId, _companyId) {

    if (!_customerId) {
      throw new Error('cusid Not Found: Invalid customer ID');
    }

    try {

      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getCustomer = await prisma.tM_Customer.findFirst({
        where: {
          Customer_id: _customerId,
          Company_id: _companyId,
          deleted_at: null
        },
        include: {
          EXT_Customer: true
        }
      });

      return getCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Customer byId Failed');
    }
  }

  async getAllCustomerByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getCustomer = await prisma.tM_Customer.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        include: {
          EXT_Customer: true
        },
        orderBy: {
          Customer_id: 'desc'
        }
      });

      return getCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Customer byComId Failed');
    }
  }


  async getActiveCustomerByComId(_companyId) {
    try {
      if (!_companyId) {
        throw new Error('Access Denied: Company Admin Role only');
      }

      const getActiveCustomer = await prisma.tM_Customer.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
          active: true
        },
        include: {
          EXT_Customer: true
        },
        orderBy: {
          Customer_id: 'desc'
        }
      });

      return getActiveCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Active Customer byComId Failed');
    }
  }

  async createCustomer(_customerData = []) {
    try {

      // set timestamp
      _customerData['created_at'] = await Func.formatDateSave(new Date());

      const createdCustomer = await prisma.tM_Customer.create({
        data: _customerData,
      });

      return createdCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Customer Failed');
    }
  }

  async updateCustomerById(_customerId, _customerData = []) {
    try {
      // set timestamp
      _customerData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedCustomer = await prisma.tM_Customer.update({
        where: {
          Customer_id: _customerId
        },
        data: _customerData
      });

      return updatedCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Customer Failed');
    }
  }

  async daleteCustomerById(_customerId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedCustomer = await prisma.tM_Customer.update({
        where: {
          Customer_id: _customerId,
          Company_id: _companyId
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Customer Failed');
    }
  }

  async hardDaleteAllCustomer() {
    try {

      const daletedCustomer = await prisma.tM_Customer.deleteMany();

      console.log('Customer deleted:', daletedCustomer);
      return daletedCustomer;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Customer All Failed');
    }
  }
}

module.exports = TM_Customer;
