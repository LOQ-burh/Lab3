const { Schema, Types, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Users'
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    customer_id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    contact_info: {
        phone: { type: String },
        email: { type: String }
    },
    passport_number: { type: String },
    address: { type: String },
    date_of_birth: { type: Date }
},{
  collection: DOCUMENT_NAME,
  timestamps: true
});

//Export the model
module.exports = mongoose.model('User', userSchema);
