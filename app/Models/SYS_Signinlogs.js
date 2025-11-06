// FileName: SYS_Signinlogs.js 
// Created time: 11-06-2025 09:33:02

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class SYS_Signinlogs {

  // R => getSigninlogsByUidAndSession
  // C => createSigninlogs
  // U =>
  // D => daleteSigninlogsByUidAndSession

  async getSigninlogsByUidAndSession(_userId, _sessionLists) {
    try {
      const user = await prisma.sYS_Signinlogs.findMany({
        where: {
          User_id: _userId,
          deleted_at: null,
          session: {
            in: _sessionLists
          }
        },
        orderBy: {
          Signinlog_id: 'desc'
        }
      });

      return user;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Signinlogs Failed');
    }
  }

  async createSigninlogs(_ip, _device, _browser, _platform, _session, _userId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const signinlog = await prisma.sYS_Signinlogs.create({
        data: {
          ipcurrent: _ip,
          device: _device,
          browser: _browser,
          platform: _platform,
          session: _session,
          User_id: _userId,
          created_at: formattedDateTime,
        },
      });
      // console.log('New log created:', signinlog);
      return signinlog;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Signinlogs Failed');
    }
  }

  async daleteSigninlogsByUidAndSession(_userId, _sessionId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const deletedSigninlogs = await prisma.sYS_Signinlogs.updateMany({
        where: {
          User_id: _userId,
          session: _sessionId,
          deleted_at: null
        },
        data: {
          deleted_at: formattedDateTime
        }
      });

      return deletedSigninlogs;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Delete Signinlogs Failed');
    }
  }
}

module.exports = SYS_Signinlogs;
