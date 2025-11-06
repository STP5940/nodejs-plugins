// FileName: T_Users.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Users {

  // R => getUserByUsername, getUserByUsernameFirst, getAllUsers
  // C => createUserIfNotExists
  // U => updateUserById
  // D => deleteUserById

  async getUserByUsername(_username) {
    try {
      const user = await prisma.t_Users.findFirst({
        where: {
          username: _username,
          deleted_at: null
        },
        include: {
          T_Twofactor: true,
          TM_Usersrole:
          {
            include: {
              TM_UsersrolePermissions: {
                include: {
                  TM_Permissions: {
                    select: {
                      controller: true,
                    },
                  },
                },
              },
            },
          },
          T_Company: true,
          T_Employee: true,
        }
      });

      return user;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get User by username Failed');
    }
  }

  async getUserById(_userId) {
    try {
      const user = await prisma.t_Users.findFirst({
        where: {
          User_id: _userId,
          deleted_at: null
        },
        include: {
          TM_Usersrole: true,
          T_Company: true,
          T_Employee: true,
        }
      });

      return user;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get User by Id Failed');
    }
  }

  async getUserByUsernameFirst(_username) {
    try {
      const user = await prisma.t_Users.findFirst({
        where: {
          username: _username,
          deleted_at: null
        }
      });

      return user;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get User by username First Failed');
    }
  }

  async getActiveByUsername(_username) {
    try {
      const user = await prisma.t_Users.findFirst({
        where: {
          username: _username,
          deleted_at: null
        }
      });

      return user;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get user.Active Failed');
    }
  }

  async createUserIfNotExists(_userData = []) {
    try {

      // set timestamp
      _userData['created_at'] = await Func.formatDateSave(new Date());

      await this.validateFieldsData(_userData, ['username', 'mail']); // ตรวจสอบการส่งข้อมูลที่สำคัญ

      const existingUsername = await this.validateDuplicate('username', _userData.username); // เช็คข้อมูลซ้ำ username
      const existingMail = await this.validateDuplicate('mail', _userData.mail); // เช็คข้อมูลซ้ำ mail

      console.log(_userData);


      if (!existingUsername && !existingMail) {

        const createdUser = await prisma.t_Users.create({
          data: _userData, // ฟอร์มหลาย column มีบังคับส่งและไม่บังคับส่ง รับค่ามาเป็น Array
        });

        return {
          status: true,
          message: `Create user success`,
          res: createdUser,
        };
      } else {
        console.log(`User with username ${_userData.username} already exists, skipping.`);

        return {
          status: false,
          message: `User with username or mail already exists`,
          res: {
            DupUsername: (existingUsername ? true : false),
            DupMailCount: (existingMail ? true : false),
          },
        };
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create user Failed');
    }
  }

  async updateUserById(_userId, _userData = []) {
    try {
      // set timestamp
      _userData['updated_at'] = await Func.formatDateSave(new Date());

      // Update the user's password
      const updatedUser = await prisma.t_Users.update({
        where: {
          User_id: _userId,
          deleted_at: null
        },
        data: _userData
      });

      return updatedUser;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update User Failed');
    }
  }

  async deleteUserById(_userId) {
    try {
      // set timestamp
      const formattedDateTime = Func.formatDateSave(new Date());

      // Delete the user's password
      const deletedUser = await prisma.t_Users.update({
        where: {
          User_id: _userId,
          deleted_at: null
        },
        data: {
          deleted_at: formattedDateTime,
        }
      });

      return deletedUser;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Delete User Failed');
    }
  }

  //-------------------------------------------
  // ฟังก์ชั่นอื่นๆ ที่ทำงานร่วมกับ CRUD
  //-------------------------------------------

  /**
   * ฟังก์ชันนี้จะสร้าง ID ใหม่โดยอิงตามวันที่ปัจจุบัน
   * 
   * @param {number} _addCurrentId - ค่าที่จะบวกเพิ่มเข้าใน ID ล่าสุด (ค่าดีฟอลต์คือ 0)
   * @returns {Promise<string>} - คืนค่า ID ใหม่ในรูปแบบสตริง.
   * @throws จะส่งข้อผิดพลาดหากมีปัญหาในการสร้างหรือเรียกข้อมูล ID.
   */
  async genId(_addCurrentId = 0) {
    // สร้างวันที่ในรูปแบบที่ต้องการ
    const newid = '00001';

    const date = new Date();
    const year = date.getFullYear().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const tmpSearch = `${year}${month}${day}`;

    try {
      // ใช้ Prisma เพื่อค้นหา Users_id ที่ตรงกับรูปแบบ tmpSearch
      const result = await prisma.t_Users.findMany({
        orderBy: {
          User_id: 'desc',
        },
        take: 1,
      });

      let sAutoid;

      if (result.length > 0) {

        let letId = result[0].User_id?.toString()
        let firstKey = letId?.substring(0, 8);

        if (firstKey !== tmpSearch) {
          // ยังไม่เคยมีรายการในวันนี้
          sAutoid = parseInt(tmpSearch + newid) + _addCurrentId;
        } else {
          // เคยมีรายการแล้วในวันนี้
          // ถ้า _addCurrentId เป็น 0 คือให้ += 1
          sAutoid = parseInt(letId) + (_addCurrentId == 0 ? 1 : 1 + _addCurrentId);
        }
      } else {
        sAutoid = parseInt(tmpSearch + newid) + _addCurrentId;
      }

      return sAutoid;
    } catch (error) {
      // console.error('Error generating ID:', error);
      // throw error;
      console.error('Error:', error);
      throw new Error('Create GeneratingID Failed');
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * ตรวจสอบข้อมูลผู้ใช้เพื่อให้แน่ใจว่ามีช่องที่ต้องกรอก
   * 
   * @param {Object} _dataValidate - ข้อมูลที่ต้องการตรวจสอบ
   * @param {string[]} _fieldsToValidate - รายชื่อฟิลด์ที่ต้องการตรวจสอบ.
   * @throws จะเกิดข้อผิดพลาดหาก _fieldsToValidate เป็นอาร์เรย์ว่าง
   * @throws จะเกิดข้อผิดพลาดหากข้อมูลใน _fieldsToValidate หายไปจาก _dataValidate
   */
  async validateFieldsData(_dataValidate, _fieldsToValidate = []) {
    if (_fieldsToValidate.length === 0) {
      throw new Error(`Invalid _fieldsToValidate[] are required`);
    }

    const missingFields = _fieldsToValidate.filter(field => !_dataValidate[field]);

    if (missingFields.length > 0) {
      const missingFieldsStr = missingFields.join(', ');
      console.error(`Invalid data - ${missingFieldsStr} are required`);
      throw new Error(`Invalid data - ${missingFieldsStr} are required`);
    }
  }

  /**
   * ตรวจสอบว่ามีผู้ใช้ที่มีค่าคอลัมน์ที่กำหนดอยู่แล้วหรือไม่.
   * 
   * @param {string} _columnName - ชื่อของคอลัมน์ที่ต้องการตรวจสอบ.
   * @param {string|number} _columnValue - ค่าที่ต้องการตรวจสอบในคอลัมน์ที่กำหนด.
   * @returns {Promise<boolean>} - คืนค่า true ถ้ามีผู้ใช้ที่มีค่าคอลัมน์ที่กำหนดอยู่แล้ว, มิฉะนั้นคืนค่า false.
   * @throws จะส่งข้อผิดพลาดถ้ามีปัญหาในการเรียกข้อมูลจากฐานข้อมูล.
   */
  async validateDuplicate(_columnName, _columnValue) {
    try {
      // ตรวจสอบว่ามีผู้ใช้ที่มีค่าคอลัมน์ที่กำหนดอยู่แล้วหรือไม่
      const existingUser = await prisma.t_Users.findFirst({
        where: {
          [_columnName]: _columnValue,
          deleted_at: null,
        }
      });

      // existingUser ไม่ใช่ null หมายความว่ามีผู้ใช้ที่มีค่าคอลัมน์เดียวกันอยู่แล้ว
      if (existingUser) {
        console.log(`User with column=${_columnName}, value=${_columnValue} already exists.`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('An error occurred while validating user data');
    }
  }

}

module.exports = T_Users;
