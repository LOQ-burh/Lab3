'use strict'

const express = require('express')
const router = express.Router()

const productController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2  } = require('../../auth/authUtils')

router.get('/search/:keySearch', asyncHandler(productController.getListsSearchProduct))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findProduct))
// Authentication
router.use(authenticationV2)
// ==============
router.post('', asyncHandler(productController.createProduct))
router.patch('/:productId', asyncHandler(productController.updateProduct))

router.post('/publish/:id', asyncHandler(productController.publicProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unpublicProductByShop))
// GET
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/publish/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router
