const mongoose = require("mongoose");
const Product2Schema = mongoose.Schema({
  product_id: {
    type: String,
    require: true
  },
  product_name: {
    type: String,
    require: true,
    text:true
  },
});

module.exports = mongoose.model("Product2", Product2Schema);