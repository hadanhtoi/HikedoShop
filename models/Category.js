const mongoose = require("mongoose");
const CategorySchema = mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  category_name: {
    type: String,
    require: true
  },
  parent_category:{
    type:Number,
    require:true
  }
});
module.exports = mongoose.model("Category", CategorySchema);