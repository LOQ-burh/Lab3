'use strict'

const DiscountService = require("../services/discount.service")
const { SuccessResponse } = require('../core/success.response');
const { BadRequestError } = require("../core/error.response");

class DiscountController {
  createDiscount = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Create new Product success!',
      metadata: await DiscountService.createDisountCode({
        ...req.body,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getAllDiscountCodes = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Successful for get all code!',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getDiscountAmount = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Successful for get code amount!',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body
      })
    }).send(res)
  }

  getAllDiscountCodesWithProducts = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Successful for get all code with products!',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query
      })
    }).send(res)
  }

  deleteDiscount = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Delete discount success!',
      metadata: await DiscountService.deleteDiscountCode({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }

  cancelDiscount = async ( req, res, next ) => {
    new SuccessResponse({
      message: 'Cancel discount success!',
      metadata: await DiscountService.cancelDiscountCode({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }
}

module.exports = new DiscountController()
