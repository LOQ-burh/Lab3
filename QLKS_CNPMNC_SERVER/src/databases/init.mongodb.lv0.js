'use stric'
require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((e) => {
    console.error("Did not connect to MongoDB", e);
  });

if(1 === 0){
    mongoose.set('debug', true)
    mongoose.set('debug', { color: true })
}

module.exports = mongoose;