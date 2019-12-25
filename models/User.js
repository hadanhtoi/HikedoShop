const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: false,
    default: null
  },
  password: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  birthday: {
    type: String,
    require: true
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
