'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { product } = require('../models/product.model')
const { findCartById } = require('../models/repositories/cart.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('../services/discount.service')
class CheckoutService {
  static async checkoutReview({ cardId, userId, shop_order_ids }) {
    //check cardId is exist or not?
    const foundCart = await findCartById(cardId)
    console.log(`check cart::${foundCart}`)
    if(!foundCart) throw new BadRequestError('Cart does not exist!!')

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0 // tong thanh toan
    }, shop_order_ids_new = []

    //Calculate total bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], items_products = [] } = shop_order_ids[i]

      // check product available
      const checkProductServer = await checkProductByServer(items_products)
      console.log(`checkProductByServer::`, checkProductByServer)
      if(!checkProductServer) throw new BadRequestError('order wrong !!')

      // total money
      const checkoutPrice =  checkProductServer.reduce((acc, product) => {
        return acc + (product.quantity * product.price)
      }, 0)

      // Total money after handle
      checkout_order.totalPrice =+ checkoutPrice // ???

      const itemCheckout = {
        shopId, shop_discounts,
        priceRaw: checkoutPrice, // money before is discounted
        priceApplyDiscount: checkoutPrice,
        items_products: checkProductServer
      }

      // if
      if(shop_discounts.length > 0) {
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId, shopId,
          products: checkProductByServer
        })

        // total discount down sale
        checkout_order.totalDiscount += discount

        // if money's discount > 0
        if(discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount
        }
      }

      // finally total money
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return { shop_order_ids, shop_order_ids_new, checkout_order }
  }
}

module.exports = CheckoutService
