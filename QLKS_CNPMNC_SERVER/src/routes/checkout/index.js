'use strict'

const express = require('express')
const router = express.Router()

const checkoutController = require('../../controllers/checkout.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2  } = require('../../auth/authUtils')


router.post('/review', asyncHandler(checkoutController.checkoutReview)) //
// Authentication
router.use(authenticationV2)
// ==============

module.exports = router
