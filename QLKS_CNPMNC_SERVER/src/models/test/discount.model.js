'use strict'

const { Schema, model } = require('mongoose'); // Erase if already required
const { ALL, SPECIFIC } = require('../enums/filterType')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema({
  discount_name:{
    type:String,
    require: true
  },
  discount_description:{
    type:String,
    require: true
  },
  discount_type:{
    type:String,
    default:'fixed_amount',
  },
  discount_value:{
    type:Number,
    require: true
  },
  discount_code:{
    type:String,
    require: true
  },
  discount_start_date: {
    type: Date,
    required: true
  },
  discount_end_date: {
    type: Date,
    required: true
  },
  discount_max_uses: {
    type: Number,
    required: true
  }, // discount amount is applied
  discount_uses_count: {
    type: Number,
    required: true
  }, // discount amount is used
  discount_users_used: {
    type: Array,
    default: []
  }, // People who have used it
  discount_max_uses_per_user: {
    type: Number,
    required: true
  }, // Maximum number of times used
  discount_min_order_value: {
    type: Number,
    required: true
  },
  discount_shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop'
  },
  discount_is_active: {
    type: Boolean,
    default: true
  },
  discount_applies_to: {
    type: String,
    required: true,
    enum: ['all', 'specific']
  },
  discount_product_ids: {
    type: Array,
    default: []
  } // Products which is applied
},{
  timestamps: true,
  collection: COLLECTION_NAME
}
);

//Export the model
module.exports = {
  discount: model(DOCUMENT_NAME, discountSchema)
};
