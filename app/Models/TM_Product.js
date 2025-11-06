// FileName: TM_Product.js 
// Created time: 25-12-2024 19:11:50

// Rename T_Template to NameModel

const Func = require("../Func");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

BigInt.prototype.toJSON = function () { return this.toString() }

class TM_Product {

  // R => getTemplateById Or getAllTemplate
  // C => createTemplateIfNotExists
  // U => updateTemplateById
  // D => daleteTemplateById

  async getAllProductByComId(_companyId) {
    if (!_companyId) {
      throw new Error('Access Denied: Company Admin Role only');
    }

    try {
      const getAllProducts = await prisma.tM_Product.findMany({
        where: {
          Company_id: _companyId,
          deleted_at: null
        },
        orderBy: {
          Product_id: 'desc'
        }
      });

      return getAllProducts;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get All Product byComId Failed');
    }
  }
  
  async getActiveProductByComId(_companyId) {
    if (!_companyId) {
      throw new Error('Access Denied: Company Admin Role only');
    }

    try {
      const getActiveProducts = await prisma.tM_Product.findMany({
        where: {
          deleted_at: null,
          active: true
        },
        orderBy: {
          Product_id: 'desc'
        }
      });

      return getActiveProducts;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Active Product byComId Failed');
    }
  }

  async getProductById(_productId, _companyId) {
    try {

      console.log(_productId);
      console.log(_companyId);

      const getProduct = await prisma.tM_Product.findFirst({
        where: {
          Product_id: _productId,
          Company_id: _companyId,
          deleted_at: null
        }
      });

      console.log(getProduct);

      return getProduct;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Get Product byId Failed');
    }
  }

  async createProductIfNotExists(_productData = []) {
    try {

      // set timestamp
      _productData['created_at'] = await Func.formatDateSave(new Date());

      // ปิดไว้ก่อนยังไม่ทราบว่าอะไรคือคีย์
      // เช็คข้อมูลซ้ำ
      // const existingTemplate = await prisma.tM_Product.findUnique({
      //   where: {
      //     id: _productData.id
      //   },
      // });

      if (true /* !existingTemplate */) {
        const createdProduct = await prisma.tM_Product.create({
          data: _productData,
        });

        return {
          status: true,
          message: `Create Product success`,
          res: createdProduct,
        };
      } else {
        // console.log(`Template with id ${_productData.id} already exists, skipping.`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Create Template Failed');
    }
  }

  async updateProductById(_productId, _productData = []) {
    try {
      // set timestamp
      _productData['updated_at'] = await Func.formatDateSave(new Date());

      const updatedProduct = await prisma.tM_Product.update({
        where: {
          Product_id: _productId
        },
        data: _productData
      });

      return {
        status: true,
        message: `Update Product success`,
        res: updatedProduct,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Update Product Failed');
    }
  }

  async daleteProductById(_productId, _companyId) {
    try {
      const formattedDateTime = Func.formatDateSave(new Date());

      const daletedProduct = await prisma.tM_Product.update({
        where: {
          Product_id: _productId,
          Company_id: _companyId,
        },
        data: {
          deleted_at: formattedDateTime,
        },
      });

      return daletedProduct;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Dalete Product Failed');
    }
  }

  async hardDaleteAllProduct() {
    try {
      const daletedProduct = await prisma.tM_Product.deleteMany();

      console.log('Product deleted:', daletedProduct);
      return daletedProduct;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Hard Delete Product All Failed');
    }
  }
}

module.exports = TM_Product;
