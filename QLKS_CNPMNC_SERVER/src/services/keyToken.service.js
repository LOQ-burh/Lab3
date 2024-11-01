'use strict'

const keyTokenModel = require('../models/keytoken.model')
const { Types } = require('mongoose')
class KeyTokenService {

  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      // const publicKeyString = publicKey.toString();
      // const tokens = await keyTokenModel.create({
      //     user: userId,
      //     publicKey: publicKeyString
      // })
      // return tokens ? tokens.publicKey : null

      // level xxx
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken },
        options = { upsert: true, new: true }

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }
  static findByUserId = async ( userId ) => {
    // try {

    // } catch (error) {
    //   console.error('Error finding token by userId:', error.message);
    //   throw error;
    // }
    return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) })
  }

  static removeKeyById = async ( id ) => {
    return await keyTokenModel.deleteOne( id )
  }

  static findByRefreshTokenUsed = async ( refreshToken ) => {
    return await keyTokenModel.findOne( { refreshTokensUsed: refreshToken } ).lean()
  }

  static findByRefreshToken = async ( refreshToken ) => {
    return await keyTokenModel.findOne( { refreshToken } )
  }

  static deleteKeyById = async ( userId ) => {
    return await keyTokenModel.deleteOne( { user: new Types.ObjectId(userId) } )
  }
}

module.exports = KeyTokenService
