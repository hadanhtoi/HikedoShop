const mongoose = require("mongoose");
const OrderSchema = mongoose.Schema({
  user_id: {
    type: String,
    require: false
  },
  total_price: {
    type: Number,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  status: {
    type: String,
    require: true
  },
  address_shipping: {
    type: String,
    require: true
  },
  phone_number: {
    type: String,
    require: true
  },
  customer_name: {
    type: String,
    require: true
  },
  sale_code: {
    type: Number,
    require: false
  }
});
module.exports = mongoose.model("Order", OrderSchema);