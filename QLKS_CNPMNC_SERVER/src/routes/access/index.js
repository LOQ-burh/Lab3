'use strict'

const express = require('express')
const router = express.Router()

const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2  } = require('../../auth/authUtils')
// Sign-up
router.post('/shop/signup', asyncHandler(accessController.signUp))
// Login
router.post('/shop/login', asyncHandler(accessController.login))
// Authentication
router.use(authenticationV2)
// ==============
// Logout
router.post('/shop/logout', asyncHandler(accessController.logout))
// hanlder refreshToken
router.post('/shop/hanlderRefreshToken', asyncHandler(accessController.handlerRefreshToken))

module.exports = router
