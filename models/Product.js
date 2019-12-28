const mongoose = require("mongoose");
const ProductSchema = mongoose.Schema({
  product_name:{
    type:String,
    require:true
  },
  brand_id:{
    type:Number,
    require:true
  },
  category_id:{
    type:Number,
    require:true
  },
  model_year:{
    type:Number,
    require:false,
    default:2019
  },
  money_unit:{
    type:String,
    require:true,
  },
  list_price:{
    type:Number,
    require:true
  },
  images:{
    type:Array,
    require:false,
    default:["https://sneakern.com/wp-content/uploads/2019/11/Mua-Rick-Owens-Drkshdw-co%CC%82%CC%89-cao-va%CC%89i-600x450.jpg"]
  },
  sizes:{
    type:Array,
    require:false,
    default:[]
  }
});

module.exports = mongoose.model("Product", ProductSchema);