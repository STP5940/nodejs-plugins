// FileName: T_Company.js 
// Created time: 11-06-2025 09:33:02

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Company {

  // R => getAllCompany Or getCompanyById
  // C => createCompanyIfNotExists
  // U => updateCompanyById
  // D => deleteCompanyById Or hardDaleteAllCompany

  async getAllCompany() {
    try {
      const getCompanys = await prisma.t_Company.findMany({
        where: {
          deleted_at: null
        },
        include: {
          T_Users: true
        },
        orderBy: {
          Company_id: 'desc'
        }
      });

      return getCompanys;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Company All Failed');
    }
  }

  async getCompanyById(_companyId) {
    try {
      const getCompanys = await prisma.t_Company.findFirst({
        where: {
          deleted_at: null,
          Company_id: parseInt(_companyId)
        },
        include: {
          T_Users: true
        },
      });

      return getCompanys;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Company by Id Failed');
    }
  }

  async createCompanyIfNotExists(_companyData = []) {

    try {

      // set timestamp
      _companyData['created_at'] = await Func.formatDateSave(new Date());

      // const formattedDateTime = Func.formatDateSave(new Date());

      const existingCompany = await prisma.t_Company.findFirst({
        where: {
          User_id: _companyData.User_id
        },
        select: {
          Company_id: true,
          name: true,
          profile: true,
          phone: true,
          created_at: true
        }
      });

      const existingUser = await prisma.t_Users.findFirst({
        where: {
          User_id: _companyData.User_id
        },
        select: {
          User_id: true,
          active: true,
          deleted_at: true
        }
      });

      if (!existingUser) {
        console.log(`User with User_id ${_companyData.User_id} Not Found exists, skipping.`);

        return {
          status: false,
          message: `User User_id Not Found`,
          res: existingUser,
        };
      }

      if (!existingCompany) {
        const createdCompany = await prisma.t_Company.create({
          data: _companyData
        });

        return {
          status: true,
          message: `Create Company success`,
          res: createdCompany,
        };
      } else {
        console.log(`Company with User_id ${_companyData.User_id} already exists, skipping.`);

        return {
          status: false,
          message: `Company with User_id already exists`,
          res: existingCompany,
        };
      }

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Company Failed');
    }
  }

  async updateCompanyById(_companyId, _companyData = []) {
    try {
      // set timestamp
      _companyData['updated_at'] = await Func.formatDateSave(new Date());

      // Update the company's password
      const updatedCompany = await prisma.t_Company.update({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        data: _companyData
      });

      return updatedCompany;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Company Failed');
    }
  }

  async deleteCompanyById(_companyId) {
    try {
      // set timestamp
      const formattedDateTime = Func.formatDateSave(new Date());

      // delete the company's password
      const deletedCompany = await prisma.t_Company.update({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        data: {
          deleted_at: formattedDateTime,
        }
      });

      return deletedCompany;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Delete Company Failed');
    }
  }

  async hardDaleteAllCompany() {
    try {

      const daletedCompany = await prisma.t_Company.deleteMany();

      console.log('Company deleted:', daletedCompany);
      return daletedCompany;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Company All Failed');
    }
  }

}

module.exports = T_Company;
