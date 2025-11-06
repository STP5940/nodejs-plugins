// FileName: T_Feedbackrequest.js 
// Created time: 11-06-2025 09:33:02

// Rename T_Template to NameModel

const Func = require("@root/app/Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class T_Feedbackrequest {

  // R => getFeedbackrequestByDocNumber Or getAllTemplate
  // C => createFeedbackrequest
  // U => updateTemplateById
  // D => daleteTemplateById

  async getAllFeedbackrequestByComId(_companyId) {
    try {
      const getAllFeedbackrequests = await prisma.t_Feedbackrequest.findMany({
        where: {
          Company_id: _companyId,
          feedback_at: {
            not: null
          }
        },
        orderBy: {
          feedback_at: 'desc'
        }
      });

      if (!getAllFeedbackrequests) {
        return null;
      }

      // Process each feedback request
      const result = await Promise.all(getAllFeedbackrequests.map(async (request) => {
        if (request.prefix === 'PM') {
          // Find matching preventive maintenance record
          const pmRecord = await prisma.t_Preventivemaintenance.findFirst({
            where: {
              documentNumber: request.documentNumber
            },
            select: {
              Preventivemaintenance_id: true,
              documentNumber: true,
              name: true,
              Employee_id: true,
              completed_at: true,
              T_Company: true,
              T_Employee: {
                include: {
                  T_Users: true,
                },
              },
            },
          });

          return {
            ...request,
            DocumentId: pmRecord.Preventivemaintenance_id,
            Document: pmRecord || null
          };
        }

        if (request.prefix === 'CM') {
          // Find matching preventive maintenance record
          const cmRecord = await prisma.t_Correctivemaintenance.findFirst({
            where: {
              documentNumber: request.documentNumber
            },
            select: {
              Correctivemaintenance_id: true,
              documentNumber: true,
              name: true,
              Employee_id: true,
              completed_at: true,
              T_Company: true,
              T_Employee: {
                include: {
                  T_Users: true,
                },
              },
            },
          });

          return {
            ...request,
            DocumentId: cmRecord.Correctivemaintenance_id,
            Document: cmRecord || null
          };
        }

        // Return original request if not PM prefix
        return request;
      }));

      // Return the processed result
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Feedbackrequest Failed');
    }
  }

  async getFeedbackrequestByDocNumber(_documentNumber) {
    try {
      // 1. หาข้อมูล Feedbackrequest ก่อนเพื่อดู prefix
      const feedbackRequest = await prisma.t_Feedbackrequest.findFirst({
        where: {
          documentNumber: _documentNumber,
        }
      });

      if (!feedbackRequest) {
        return null;
      }

      // 2. กำหนดเงื่อนไข include ตาม prefix
      if (feedbackRequest.prefix === 'PM') {
        // 3. ค้นหาข้อมูล PM อีกครั้ง
        const result = await prisma.t_Preventivemaintenance.findFirst({
          where: {
            documentNumber: _documentNumber,
          },
          select: {
            documentNumber: true,
            name: true,
            completed_at: true,
            T_Company: true,
            T_Employee: {
              include: {
                T_Users: true, // Includes related EXT_Customer
              },
            },
          },
        });

        return {
          Feedbackrequest_id: feedbackRequest?.Feedbackrequest_id,
          documentHash: feedbackRequest.documentHash,
          rating: feedbackRequest?.rating,
          employeeComments: feedbackRequest?.employeeComments,
          companySuggestions: feedbackRequest?.companySuggestions,
          feedback_at: feedbackRequest?.feedback_at,
          prefix: feedbackRequest.prefix,
          ...result
        };
      }
      if (feedbackRequest.prefix === 'CM') {
        // 3. ค้นหาข้อมูล CM อีกครั้ง
        const result = await prisma.t_Correctivemaintenance.findFirst({
          where: {
            documentNumber: _documentNumber,
          },
          select: {
            documentNumber: true,
            name: true,
            completed_at: true,
            T_Company: true,
            T_Employee: {
              include: {
                T_Users: true, // Includes related EXT_Customer
              },
            },
          },
        });

        return {
          Feedbackrequest_id: feedbackRequest?.Feedbackrequest_id,
          documentHash: feedbackRequest.documentHash,
          rating: feedbackRequest?.rating,
          employeeComments: feedbackRequest?.employeeComments,
          companySuggestions: feedbackRequest?.companySuggestions,
          feedback_at: feedbackRequest?.feedback_at,
          prefix: feedbackRequest.prefix,
          ...result
        };
      }

      return null;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Feedbackrequest Failed');
    }
  }


  async createFeedbackrequest(_feedbackrequestData = []) {
    try {

      // set timestamp
      _feedbackrequestData['created_at'] = await Func.formatDateSave(new Date());

      const createdFeedbackrequest = await prisma.t_Feedbackrequest.create({
        data: _feedbackrequestData,
      });

      return createdFeedbackrequest;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Feedbackrequest Failed');
    }
  }

  async updateFeedbackrequestById(_feedbackrequestId, _feedbackrequestData = []) {
    try {
      // set timestamp
      _feedbackrequestData['feedback_at'] = await Func.formatDateSave(new Date());

      const updatedFeedbackrequest = await prisma.t_Feedbackrequest.update({
        where: {
          Feedbackrequest_id: _feedbackrequestId
        },
        data: _feedbackrequestData
      });

      return updatedFeedbackrequest;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Feedbackrequest Failed');
    }
  }

  // async daleteTemplateById(_templateId) {
  //   try {
  //     const formattedDateTime = Func.formatDateSave(new Date());

  //     const daletedTemplate = await prisma.t_Feedbackrequest.update({
  //       where: {
  //         id: _templateId
  //       },
  //       data: {
  //         deleted_at: formattedDateTime,
  //       },
  //     });

  //     return daletedTemplate;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw new Error('Dalete Template Failed');
  //   }
  // }
}

module.exports = T_Feedbackrequest;
