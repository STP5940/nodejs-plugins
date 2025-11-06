// FileName: T_Employee.js 
// Created time: 11-06-2025 09:33:02

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Employee {

  // R => getAllEmployee Or getEmployeeById
  // C => createEmployeeIfNotExists
  // U => updateEmployeeById
  // D => deleteEmployeeById Or hardDaleteAllEmployee

  async getAllEmployeeByComId(_companyId) {
    if (!_companyId) {
      throw new Error('Access Denied: Company Admin Role only');
    }

    try {

      const getEmployees = await prisma.t_Employee.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null,
        },
        include: {
          T_Users: {
            include: {
              TM_Usersrole: {
                select: {
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          Employee_id: 'desc'
        }
      });

      return getEmployees;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Employee All Failed');
    }
  }

  async getEmployeeById(_employeeId) {
    try {
      const getEmployees = await prisma.t_Employee.findFirst({
        where: {
          deleted_at: null,
          Employee_id: parseInt(_employeeId)
        },
        include: {
          T_Users: true,
        },
      });

      return getEmployees;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Employee by Id Failed');
    }
  }

  async createEmployeeIfNotExists(_employeeData = []) {

    try {

      const existingEmployee = await prisma.t_Employee.findFirst({
        where: {
          Company_id: _employeeData.Company_id,
          User_id: _employeeData.User_id
        },
        select: {
          Company_id: true,
          User_id: true,
        }
      });

      const existingCompany = await prisma.t_Company.findFirst({
        where: {
          Company_id: _employeeData.Company_id
        },
        select: {
          Company_id: true,
          deleted_at: true
        }
      });

      if (!existingCompany) {
        console.log(`Company with Company_id ${_employeeData.Company_id} Not Found exists, skipping.`);

        return {
          status: false,
          message: `Company Company_id Not Found`,
          res: existingCompany,
        };
      }

      if (!existingEmployee) {
        const createdEmployee = await prisma.t_Employee.create({
          data: _employeeData
        });

        return {
          status: true,
          message: `Create Employee success`,
          res: createdEmployee,
        };
      } else {
        console.log(`Employee with User_id ${_employeeData.User_id} already exists, skipping.`);

        return {
          status: false,
          message: `Employee with User_id already exists`,
          res: existingEmployee,
        };
      }

    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Employee Failed');
    }
  }

  async updateEmployeeById(_employeeId, _companyId, _employeeData = []) {
    try {
      // set timestamp
      _employeeData['updated_at'] = await Func.formatDateSave(new Date());

      // Update the Employee's password
      const updatedEmployee = await prisma.t_Employee.update({
        where: {
          Company_id: _companyId,
          Employee_id: _employeeId,
          deleted_at: null
        },
        data: _employeeData
      });

      return updatedEmployee;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Employee Failed');
    }
  }

  async deleteEmployeeById(_employeeId, _userId, _companyId) {
    try {
      // set timestamp
      const formattedDateTime = Func.formatDateSave(new Date());

      // delete the Employee's password
      const deletedEmployee = await prisma.t_Employee.update({
        where: {
          User_id_Company_id: {
            User_id: _userId,
            Company_id: _companyId,
          },
          Employee_id: _employeeId,
          deleted_at: null
        },
        data: {
          deleted_at: formattedDateTime,
        }
      });

      return deletedEmployee;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Delete Employee Failed');
    }
  }

  async hardDaleteAllEmployee() {
    try {

      const daletedEmployee = await prisma.t_Employee.deleteMany();

      console.log('Employee deleted:', daletedEmployee);
      return daletedEmployee;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Employee All Failed');
    }
  }

}

module.exports = T_Employee;
