'use strict'

/*
Key features: Cart Service
- add product to cart [user]
- reduce product quantity by one [User]
- increase product quantity by One [User]
- get cart [User]
- Delete cart [User]
- Delete cart item [User]
*/

const { NotFoundError } = require('../core/error.response')
const { cart } = require('../models/cart.model')
const { product } = require('../models/product.model')
const { getProductById } = require('../models/repositories/product.repo')

class CartService {
  // Start repo cart
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: 'active' },
    updateOrInsert = {
      $addToSet: {
        cart_products: product
      }
    }, options = {
      upsert: true,
      new: true
    }

    return await cart.findOneAndUpdate( query, updateOrInsert, options )
  }

  static async updateUserCartQuantity({ userId, product }) {

    const  { productId, quantity } = product
    const query = {
      cart_userId: userId,
      'cart_products.productId': productId,
      cart_state: 'active'
    }
    const updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity, // ??
      }
    }
    const options = {
      upsert: true,
      new: true
    }

    return await cart.findOneAndUpdate( query, updateSet, options )
  }

  // End repo cart
  static async addToCart({ userId, product = {} }) {

    // check cart ton tai hay khong?
    const userCart = await cart.findOne({
      cart_userId: userId
    })

    if(!userCart) return await CartService.createUserCart({ userId, product })

    // if userId have cart but don't have products ??
    if(!userCart.cart_products.length) {
      userCart.cart_products = [product]
      return await userCart.save()
    }

    // if cart is exist and have this product then return [update quantity]
    return await CartService.updateUserCartQuantity({ userId, product })
  }

// update cart
/*
shop_order_ids: [
{
shopId,
item_products: [
{
quantity,
price,
shopId,
old_quantity,
productId
},
],
version
},
]
*/

  static async addToCartV2({ userId, shop_order_ids }) {
    const {
      productId,
      quantity,
      old_quantity
    } = shop_order_ids[0]?.item_products[0]
    console.log({
      productId,
      quantity,
      old_quantity
    })
    // check product $
    const foundProduct = await getProductById(productId)
    if(!foundProduct)  throw new NotFoundError(`Not found products ${productId} !!!`)

    // compare
    if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
      throw new NotFoundError('Product do belong to the shop')
    }

    if(quantity === 0) {
      // delete
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteUserCart({ userId, productId }) {
    const query = {
      cart_userId: userId,
      cart_state: 'active' // ?
    }, updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    }

    const deleteCart = await cart.updateOne( query, updateSet )

    return deleteCart
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({
      cart_userId: +userId
    }).lean()
  }
}

module.exports = CartService
