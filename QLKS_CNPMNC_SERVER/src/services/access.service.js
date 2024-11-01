'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto');
const shopModel = require('../models/shop.model')
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils/')
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbidenError  } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {

  static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {

    const { userId, email } = user

    if(keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById( userId )
      throw new ForbidenError('Something wrong happened, please relogin!')
    }

    if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop is not registered!')

    //check userId
    const foundShop = await findByEmail( { email } )
    if(!foundShop) throw new AuthFailureError('Shop is not registered - found')

    // create new pair
    const tokens = await createTokenPair({userId: userId, email}, keyStore.publicKey, keyStore.privateKey)

    //update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // is used to take new token
      }
    })

    return {
      user,
      tokens
    }
  }

  static logout = async ( keyStore ) => {
    const delKey = await KeyTokenService.removeKeyById( keyStore._id )
    console.log({delKey})
    return delKey
  }
  /* implement login steps
  1 - check email in dbs
  2 - match password
  3 - create assetToken & refreshToken and save
  4 - generate token
  5 - get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email })
    if(!foundShop) throw new BadRequestError('Shop not registered!')

    // 2.
    const match = bcrypt.compare( password, foundShop.password )
    if(!match) throw new AuthFailureError('Authentication error!')

    // 3.
    // const privateKey = crypto.randomBytes(64).toString('hex')
    // const publicKey  = crypto.randomBytes(64).toString('hex')
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      // The standard secure default length for RSA keys is 2048 bits
      // The different option secure length for RSA keys is 4096 bits
      modulusLength: 4096,
      /**
       * 'pkcs1': Public key CryptoGraphy Standards 1
       * 'pem'  : Privacy Enhanced Mail
      */
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem"
      }
    })

    // 4.
    // const publicKeyString = await KeyTokenService.createKeyToken({
    //   userId: newShop._id,
    //   publicKey,
    //   privateKey
    // })
    // const publicKeyObject = crypto.createPublicKey(publicKeyString)
    const { _id: userId } = foundShop
    const tokens = await createTokenPair({userId: userId, email}, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      userId: userId,
      privateKey,
      publicKey
    })
    // .then
    // 5.
    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    }
  }
  static signUp = async ({ name, email, password }) => {
    try {
      //Check email exists?
      const modelShop = await shopModel.findOne({ email }).lean()
      if (modelShop) {
        throw new BadRequestError('Error: Shop already registered!')
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name, email, password: passwordHash, roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // created private key, public key
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          // The standard secure default length for RSA keys is 2048 bits
          // The different option secure length for RSA keys is 4096 bits
          modulusLength: 4096,
          // 'pkcs1': Public key CryptoGraphy Standards 1
          // 'pem'  : Privacy Enhanced Mail
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem"
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
          }
        })

        console.log({ privateKey, publicKey })

        // console.log(
        //     publicKey.export({
        //         type: "pkcs1",
        //         format: "pem",
        //     }),

        //     privateKey.export({
        //         type: "pkcs1",
        //         format: "pem",
        //     })
        // )

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!publicKeyString) {
          return {
            code: 'xxx',
            message: 'publicKeyString error!'
          }
        }
        console.log(`publicKeyString::`, publicKeyString)

        const publicKeyObject = crypto.createPublicKey(publicKeyString)
        console.log(`publicKeyObject::`, publicKeyObject)

        //created tokens pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)
        console.log(`created tokens success!::`, tokens)

        //====================Level 0
        // return {
        //     code: 201,
        //     metadata: {
        //         shop: {
        //             _id: newShop._id,
        //             name: newShop.name,
        //             email: newShop.email
        //         },
        //         tokens
        //     }
        // }

        //====================Level 2
        //using lodash
        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
            tokens
          }
        }
      }
      return {
        code: 200,
        metadata: null
      }
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
