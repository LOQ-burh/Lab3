'use strict'

const express = require('express')
const router = express.Router()

const discountController = require('../../controllers/discount.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2  } = require('../../auth/authUtils')

// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount)) // checked
router.get('/list-product-code', asyncHandler(discountController.getAllDiscountCodesWithProducts)) // checked
// Authentication
router.use(authenticationV2)
// ==============

router.post('', asyncHandler(discountController.createDiscount)) // checked
router.get('/list-discount-code', asyncHandler(discountController.getAllDiscountCodes)) // checked
router.delete('/delete-discount-code', asyncHandler(discountController.deleteDiscount)) // ?
router.delete('/cancel-discount-code', asyncHandler(discountController.cancelDiscount)) // ?

module.exports = router
