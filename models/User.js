const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: false,
    default: ""
  },
  password: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  birthday: {
    type: String,
    require: true,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  image:{
    type:String,
    require:false,
    default:'/images/man-user.png'
  }  
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
