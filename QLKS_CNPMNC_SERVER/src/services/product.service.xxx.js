'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbidenError } = require('../core/error.response');

const { findAllDraftForShop, publicProductByShop, findAllPublishForShop, unpublicProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById } = require('../models/repositories/product.repo');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
const { insertInventory } = require('../models/repositories/inventory.repo')
// define Factory class to create product
class ProductFactory {

  /*
    type: 'Clothing',
    payload
  */

  static productRegistry = {}

  static registerProductType( type, classRef ) {
    ProductFactory.productRegistry[type] = classRef
  }

  static async createProduct( type, payload ) {
    const productClass = ProductFactory.productRegistry[type]

    if(!productClass) throw new BadRequestError(`Invalid product types::${type}`)

    // switch (type) {
    //   case 'Electronics':
    //     return new Electronics(payload).createProduct()
    //   case 'Clothing':
    //     return new Clothing(payload).createProduct()
    //   case 'Furniture':
    //     return new Furnitures(payload).createProduct()
    //   default:
    //     throw new BadRequestError(`Invalid Products Type::${type}`)
    // }

    return new productClass(payload).createProduct()
  }

  static async updateProduct( type, productId, payload ) {
    const productClass = ProductFactory.productRegistry[type]

    if(!productClass) throw new BadRequestError(`Invalid product types::${type}`)

    return new productClass(payload).updateProduct(productId)
  }

  // PUT //
  static async publicProductByShop ({ product_shop, product_id }) {
    return await publicProductByShop({ product_shop, product_id })
  }

  static async unpublicProductByShop ({ product_shop, product_id }) {
    return await unpublicProductByShop({ product_shop, product_id })
  }


  // QUERY
  static async findAllDraftForShop ({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftForShop({ query, limit, skip })
  }

  static async findAllPublishForShop ({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async searchProduct ({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts ({ limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true} }) {
    return await findAllProducts({ limit, sort, page, filter,
      select: ['product_name', 'product_price', 'product_thumb', 'product_shop']
    })
  }

  static async findProduct ({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] })
  }
}

// define base product class
class Product {

  constructor({
    product_name, product_thumb, product_description, product_price,
    product_quantity, product_type, product_shop, product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  async createProduct( product_id ) {
    const newProduct =  await product.create({ ...this, _id: product_id })
    if(newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
    }

    return newProduct
  }

  async updateProduct( productId, bodyUpdate ) {
    return await updateProductById({productId, bodyUpdate, model: product})
  }
}

//define sub-class Clothing for different product type
class Clothing extends Product {

  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if(!newClothing) throw new BadRequestError('error::create new Clothing')

    const newProduct = await super.createProduct()
    if(!newProduct) throw new BadRequestError('error::create new Product')

    return newProduct
  }

  // ======================== level 1
  async updateProduct(productId) {
    /**
     * {
     *    a: underfined,
     *    b: null
     * }
     */
    // console.log(`[1]::`, this)
    // 1. remove attr has null andd underfined
    const objectParams = removeUndefinedObject(this)
    // console.log(`[2]::`, objectParams)
    // 2. check it out somewhere
    if(objectParams.product_attributes) {
      // update attr's child
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: clothing
      })
    }

    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
    return updateProduct
  }
}

//define sub-class Electronic for different product type
class Electronics extends Product {

  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if(!newElectronic) throw new BadRequestError('error::create new Electronic')

    const newProduct = await super.createProduct(newElectronic._id)
    if(!newProduct) throw new BadRequestError('error::create new Product')

    return newProduct
  }
}

class Furniture extends Product {

  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if(!newFurniture) throw new BadRequestError('error::create new Furniture')

    const newProduct = await super.createProduct(newFurniture._id)
    if(!newProduct) throw new BadRequestError('error::create new Product')

    return newProduct
  }
}

ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory
