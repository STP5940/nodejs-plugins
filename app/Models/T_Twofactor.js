// FileName: T_Twofactor.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Twofactor {

  // R => getTwofactorByUid
  // C => createTwofactorIfNotExists
  // U => updateTwofactorByUid
  // D => deleteTwofactorById

  async getTwofactorByUid(_userId) {
    try {
      // Update the user's password
      const updatedUser = await prisma.t_Twofactor.update({
        where: {
          User_id: _userId
        },
        data: {
          active: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('GET Twofactor Failed');
    }
  }

  async createTwofactorIfNotExists(_userId, _twofactorId) {
    try {

      // เช็คข้อมูลซ้ำ
      const existingTwofactor = await prisma.t_Twofactor.findUnique({
        where: {
          User_id: _userId
        }
      });

      const existingUser = await prisma.t_Users.findFirst({
        where: {
          User_id: _userId
        },
        select: {
          User_id: true,
          active: true,
          deleted_at: true
        }
      });

      if (!existingUser) {
        console.log(`User with User_id ${_userId} Not Found exists, skipping.`);

        return {
          status: false,
          message: `User User_id Not Found`,
          res: existingUser,
        };
      }

      if (!existingTwofactor) {

        const createdTwofactor = await prisma.t_Twofactor.create({
          data: {
            Twofactor_id: _twofactorId,
            User_id: _userId,
            active: false,
            signinaccount: false,
            changepassword: false,
          },
        });

        return createdTwofactor;
      } else {
        console.log(`Twofactor with User_id ${_userId} already exists, skipping.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Twofactor Failed');
    }
  }

  async updateTwofactorByUid(_userId, _columnName, _setBoolean) {
    try {

      // Update the Twofactor's column
      const updatedTwofactor = await prisma.t_Twofactor.update({
        where: {
          User_id: _userId,
        },
        data: {
          [_columnName]: _setBoolean === 'true',
        }
      });

      return updatedTwofactor;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Twofactor Failed');
    }
  }

  async deleteTwofactorByUid(_userId) {
    try {

      // delete the twofactor's password
      const deletedTwofactor = await prisma.t_Twofactor.update({
        where: {
          User_id: _userId,
        },
        data: {
          active: false,
          signinaccount: false,
          changepassword: false,
        }
      });

      return deletedTwofactor;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Delete Twofactor Failed');
    }
  }
}

module.exports = T_Twofactor;
