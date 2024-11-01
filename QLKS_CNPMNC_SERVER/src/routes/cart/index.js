'use strict'

const express = require('express')
const router = express.Router()

const cartController = require('../../controllers/cart.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2  } = require('../../auth/authUtils')

router.post('', asyncHandler(cartController.addToCart)) //
router.delete('', asyncHandler(cartController.deleteOnCart)) //
router.post('/update', asyncHandler(cartController.updateCart)) //
router.get('', asyncHandler(cartController.listToCart)) //

// Authentication
router.use(authenticationV2)
// ==============

module.exports = router
