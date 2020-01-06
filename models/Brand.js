const mongoose = require("mongoose");
const BrandSchema = mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  brand_name: {
    type: String,
    require: true
  }
});
module.exports = mongoose.model("Brand", BrandSchema);